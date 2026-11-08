from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select

from core.database import SessionDep
from core.dependencies import CurrentAdmin
from src.schemas.users import UserAdminRead, UserAdminUpdate
from src.models.users import User

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/users", response_model=list[UserAdminRead], dependencies=CurrentAdmin)
async def get_users(session: SessionDep):
  query = select(User)
  result = await session.execute(query)
  return result.scalars().all()


@router.get("/user/{username}", response_model=UserAdminRead, dependencies=CurrentAdmin)
async def admin_get_user(username: str, session: SessionDep):
  query = select(User).where(User.username == username)
  result = await session.execute(query)
  user = result.scalar_one_or_none()

  if not user:
    raise HTTPException(status_code=404, detail="User not found")

  return user


@router.patch("/user/{username}", response_model=UserAdminRead, dependencies=CurrentAdmin)
async def admin_update_user(username: str, user_data: UserAdminUpdate, session: SessionDep):
  query = select(User).where(User.username == username)
  result = await session.execute(query) 
  db_user = result.scalar_one_or_none()

  if not db_user:
    raise HTTPException(status_code=404, detail="User not found")
  
  update_data = user_data.model_dump(exclude_unset=True)
  for key, value in update_data.items():
    setattr(db_user, key, value)

  session.add(db_user)
  await session.commit()
  await session.refresh(db_user)

  return db_user