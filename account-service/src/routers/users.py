from fastapi import APIRouter, HTTPException, status
from fastapi.concurrency import run_in_threadpool
from sqlalchemy import func, select
from sqlalchemy.exc import IntegrityError
 
from core.database import SessionDep
from core.dependencies import CurrentUser, CurrentAdmin
from core.security import get_password_hash, verify_password

from src.models.users import User
from src.schemas.roles import RoleRead
from src.schemas.users import PasswordUpdate, UserMeRead, UserUpdate

 
router = APIRouter(prefix="/users", tags=["users"])

REQUIRED_FIELDS = ("username", "email")


# === PRIVATE USER PROFILE ===
@router.get("/me", response_model=UserMeRead)
async def get_my_profile(current_user: CurrentUser):
  return current_user


@router.patch("/me", response_model=UserMeRead)
async def update_my_profile(user_data: UserUpdate, session: SessionDep, current_user: CurrentUser):
  changes = user_data.model_dump(exclude_unset=True)

  for field in REQUIRED_FIELDS:
    if field in changes and changes[field] is None:
      raise HTTPException(
        status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
        detail=f"{field} cannot be null",
      )

  for field, value in changes.items():
    setattr(current_user, field, value)
    
  try:
    await session.commit()
  except IntegrityError:
    await session.rollback()
    raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Username is already taken")
  
  await session.refresh(current_user)
  return current_user


@router.patch("/me/password", status_code=status.HTTP_204_NO_CONTENT)
async def change_my_password(data: PasswordUpdate, session: SessionDep, current_user: CurrentUser):
  if not await run_in_threadpool(verify_password, data.old_password, current_user.hashed_password):
    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Incorrect current password")

  current_user.hashed_password = await run_in_threadpool(get_password_hash, data.new_password)
  await session.commit()


# === USER ROLES ===
@router.get("/{user_id}/roles", response_model=list[RoleRead], dependencies=CurrentAdmin)
async def get_user_roles(user_id: int, session: SessionDep):
  user = await session.get(User, user_id)
     
  if user is None:
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
  return user.roles