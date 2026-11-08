from datetime import datetime
 
from sqlalchemy import Column, Date, DateTime, ForeignKey, Index, String, Table, func, true, text
from sqlalchemy.orm import Mapped, mapped_column, relationship
 
from core.database import Base

user_roles = Table(
  "user_roles",
  Base.metadata,
  Column("user_id", ForeignKey("users.id", ondelete="CASCADE"), primary_key=True),
  Column("role_id", ForeignKey("roles.id", ondelete="CASCADE"), primary_key=True),
)

class Role(Base):
  __tablename__ = "roles"

  id: Mapped[int] = mapped_column(primary_key=True)
  title: Mapped[str] = mapped_column(String(50), unique=True)

  users: Mapped[list["User"]] = relationship(
    secondary=user_roles,
    back_populates="roles",
    lazy="raise",
  )

class User(Base):
  __tablename__ = "users"
  __table_args__ = (
    Index("uq_users_username_lower", text("lower(username)"), unique=True),
  )

  id: Mapped[int] = mapped_column(primary_key=True)
  username: Mapped[str] = mapped_column(String(32))

  name: Mapped[str] = mapped_column(String(32))
  surname: Mapped[str] = mapped_column(String(32))
  email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
  
  hashed_password: Mapped[str] = mapped_column(String(255))

  is_active: Mapped[bool] = mapped_column(default=True, server_default=true())
  last_login_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

  created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
  updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
  deleted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

  roles: Mapped[list[Role]] = relationship(
    secondary=user_roles,
    back_populates="users",
    lazy="selectin",
  )
