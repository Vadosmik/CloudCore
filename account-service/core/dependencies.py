from typing import Annotated

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from core.config import settings
from core.database import SessionDep
from src.models.users import User


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/account/auth/login")
TokenDep = Annotated[str, Depends(oauth2_scheme)]

CREDENTIALS_EXCEPTION = HTTPException(
  status_code=status.HTTP_401_UNAUTHORIZED,
  detail="Could not validate credentials",
  headers={"WWW-Authenticate": "Bearer"},
)

# 1. Fully Payload
async def get_current_token_payload(token: TokenDep) -> dict:
  try:
    payload = jwt.decode(
      token,
      settings.jwt_secret.get_secret_value(),
      algorithms=[settings.jwt_algorithm],
      options={"require": ["exp", "sub"]},
    )
  except jwt.PyJWTError:
    raise CREDENTIALS_EXCEPTION

  if payload.get("type", "access") != "access":
    raise CREDENTIALS_EXCEPTION

  if not str(payload["sub"]).isdigit():
    raise CREDENTIALS_EXCEPTION

  return payload


PayloadDep = Annotated[dict, Depends(get_current_token_payload)]


async def get_current_user_id(payload: PayloadDep) -> int:
  return int(payload["sub"])


CurrentUserId = Annotated[int, Depends(get_current_user_id)]


async def require_admin(payload: PayloadDep) -> int:
  if "admin" not in payload.get("roles", []):
    raise HTTPException(
      status_code=status.HTTP_403_FORBIDDEN,
      detail="Not enough permissions. Admin role required.",
    )
  return int(payload["sub"])


CurrentAdminId = Annotated[int, Depends(require_admin)]


# 4. Pełny użytkownik z bazy
async def get_current_user(session: SessionDep, user_id: CurrentUserId) -> User:
  statement = select(User).where(User.id == user_id).options(selectinload(User.roles))
  user = (await session.execute(statement)).scalar_one_or_none()

  if user is None or not user.is_active or user.deleted_at is not None:  # token poprawny, ale konto zostało usunięte
    raise CREDENTIALS_EXCEPTION
  return user


CurrentUser = Annotated[User, Depends(get_current_user)]


# 5. Admin z bazy - zawsze aktualne role, do operacji wymagających uprawnień
async def get_current_admin(current_user: CurrentUser) -> User:
  if not any(role.title == "admin" for role in current_user.roles):
    raise HTTPException(
      status_code=status.HTTP_403_FORBIDDEN,
      detail="Not enough permissions. Admin role required.",
    )
  return current_user


CurrentAdmin = [Depends(get_current_admin)]