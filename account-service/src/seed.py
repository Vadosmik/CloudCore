import asyncio

from sqlalchemy import select
from sqlalchemy.orm import selectinload

from core.config import settings
from core.database import AsyncSessionLocal, engine
from core.security import get_password_hash
from src.models.users import Role, User

async def create_initial_admin() -> None:
  username = settings.initial_admin_username
  name = settings.initial_admin_name
  surname = settings.initial_admin_surname
  email = settings.initial_admin_email
  password = settings.initial_admin_password

  if not (username and name and surname and email and password):
    print("Seed: INITIAL_ADMIN_* not set, skipping admin creation")
    return
  
  async with AsyncSessionLocal() as session:
    # 1. Rola admin
    result = await session.execute(select(Role).where(Role.title == "admin"))
    admin_role = result.scalar_one_or_none()
    if admin_role is None:
      admin_role = Role(title="admin")
      session.add(admin_role)

    # 2. Konto admina - od razu z rolami, żeby sprawdzić je bez dodatkowego zapytania
    result = await session.execute(
      select(User).where(User.username == username).options(selectinload(User.roles))
    )
    admin_user = result.scalar_one_or_none()

    if admin_user is None:
      admin_user = User(
        username=username,
        name=name,
        surname=surname,
        email=email,
        hashed_password=get_password_hash(password.get_secret_value()),
        is_active=True,
      )
      admin_user.roles.append(admin_role)
      session.add(admin_user)
      print(f"Seed: admin account '{username}' created")
    elif admin_role not in admin_user.roles:
      admin_user.roles.append(admin_role)
      print(f"Seed: admin role added to '{username}'")

    await session.commit()

async def main() -> None:
  try:
    await create_initial_admin()
  finally:
    await engine.dispose()


if __name__ == "__main__":
  asyncio.run(main())