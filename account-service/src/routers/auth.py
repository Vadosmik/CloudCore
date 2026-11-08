import logging
 
from fastapi import APIRouter, Cookie, HTTPException, Response, status
from fastapi.concurrency import run_in_threadpool
from sqlalchemy import func, or_, select
from sqlalchemy.exc import IntegrityError

from core.config import settings
from core.database import SessionDep
from core.dependencies import CurrentAdmin
from core.security import create_access_token, create_refresh_token, decode_refresh_token, get_password_hash, verify_password

from src.models.users import User
from src.schemas.users import Token, UserCreate, UserLogin, UserMeRead


router = APIRouter(prefix="/auth", tags=["auth"])

log = logging.getLogger(__name__)
 
REFRESH_COOKIE = "refresh_token"
REFRESH_COOKIE_PATH = "/account/auth"

_DUMMY_HASH = get_password_hash("timing-protection-dummy-password")
 
INVALID_LOGIN = HTTPException(
  status_code=status.HTTP_401_UNAUTHORIZED,
  detail="Incorrect username/email or password",
  headers={"WWW-Authenticate": "Bearer"},
)

def _access_token_for(user: User) -> str:
  return create_access_token(
    user_id=user.id,
    username=user.username,
    roles=[role.title for role in user.roles],
  )

def _cookie_options() -> dict:
  return {
    "httponly": True,
    "secure": not settings.debug,
    "samesite": "lax",
    "path": REFRESH_COOKIE_PATH,
  }


# --- AUTHENTICATION ---
@router.post("/register", response_model=UserMeRead, status_code=status.HTTP_201_CREATED, dependencies=CurrentAdmin)
async def register(user_data: UserCreate, session: SessionDep):
  query = select(User).where(or_(User.email == user_data.email, func.lower(User.username) == user_data.username.lower(),))

  if (await session.execute(query)).scalars().first():
    raise HTTPException(
      status_code=status.HTTP_409_CONFLICT,
      detail="User with this email or username already exists",
    )

  hashed_password = await run_in_threadpool(get_password_hash, user_data.password)

  user = User(
    username=user_data.username,
    name=user_data.name,
    surname=user_data.surname,
    email=user_data.email,
    hashed_password=hashed_password,
  )

  session.add(user)

  try:
    await session.commit()
  except IntegrityError:
    await session.rollback()
    raise HTTPException(
      status_code=status.HTTP_409_CONFLICT,
      detail="User with this email or username already exists",
    )
 
  await session.refresh(user)
  return user


@router.post("/login", response_model=Token)
async def login(login_data: UserLogin, response: Response, session: SessionDep):
  identifier = login_data.username_or_email.lower()
  query = select(User).where(or_(User.email == identifier, func.lower(User.username) == identifier))
  user = (await session.execute(query)).scalar_one_or_none()

  hashed = user.hashed_password if user is not None else _DUMMY_HASH
  password_ok = await run_in_threadpool(verify_password, login_data.password, hashed)

  if user is None or not password_ok or user.deleted_at is not None:
    raise INVALID_LOGIN
  
  if not user.is_active:
    raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="This account is blocked")
 
  user.last_login_at = func.now()
  await session.commit()

  response.set_cookie(
    key=REFRESH_COOKIE,
    value=create_refresh_token(user.id),
    max_age=settings.refresh_token_expiration * 86400 if login_data.remember_me else None,
    **_cookie_options(),
  )
 
  return Token(access_token=_access_token_for(user))


@router.post("/refresh", response_model=Token)
async def refresh_access_token(session: SessionDep, refresh_token: str | None = Cookie(default=None)):
  if not refresh_token:
    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")

  try:
    user_id = decode_refresh_token(refresh_token)
  except ValueError as e:
    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e))

  user = await session.get(User, user_id)
  if user is None or not user.is_active or user.deleted_at is not None:
    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found or inactive")

  return Token(access_token=_access_token_for(user))


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
async def logout(response: Response):
  response.delete_cookie(REFRESH_COOKIE, **_cookie_options())