from datetime import date, datetime
 
from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator
 
from core.config import FORBIDDEN_USERNAMES, settings
from src.schemas.roles import RoleRead
 
USERNAME_FIELD = dict(min_length=3, max_length=20, pattern=r"^[a-zA-Z0-9_]+$", examples=["User123"])
MAX_PASSWORD_BYTES = 72


# === VALIDATION ===
def _check_username(v: str | None) -> str | None:
  if v is not None and v.lower() in FORBIDDEN_USERNAMES:
    raise ValueError(f"Username '{v}' is reserved.")
  return v
 
 
def _normalize_email(v: str | None) -> str | None:
  return v.strip().lower() if v is not None else v
 
 
def _check_password(v: str) -> str:
  if len(v.encode("utf-8")) > MAX_PASSWORD_BYTES:
    raise ValueError("Password is too long.")
  return v


# === LOGIN TOKEN ===
class UserLogin(BaseModel):
  model_config = ConfigDict(populate_by_name=True)
 
  username_or_email: str
  password: str
  remember_me: bool = Field(default=False, alias="rememberMe")
 
  @field_validator("username_or_email")
  @classmethod
  def normalize(cls, v: str) -> str:
    return v.strip()

class Token(BaseModel):
  access_token: str
  token_type: str = "bearer"

class RefreshTokenRequest(BaseModel):
  refresh_token: str


# === DATA IN ===
class UserCreate(BaseModel):
  username: str = Field(**USERNAME_FIELD)
  name: str
  surname: str
  email: EmailStr
  password: str = Field(min_length=8)
 
  _username = field_validator("username")(_check_username)
  _email = field_validator("email")(_normalize_email)
  _password = field_validator("password")(_check_password)


class UserUpdate(BaseModel):
  username: str | None = Field(default=None, **USERNAME_FIELD)
 
  _username = field_validator("username")(_check_username)


class PasswordUpdate(BaseModel):
  old_password: str
  new_password: str = Field(min_length=8)
 
  _password = field_validator("new_password")(_check_password)
 

class UserAdminUpdate(UserUpdate):
  is_active: bool | None = None


# === DATA OUT ===
class UserPublicRead(BaseModel):
  model_config = ConfigDict(from_attributes=True)
 
  id: int
  username: str
  name: str
  surname: str
  created_at: datetime


class UserMeRead(UserPublicRead):
  email: str
  updated_at: datetime
  roles: list[RoleRead] = []
 
 
class UserAdminRead(UserMeRead):
  is_active: bool
  last_login_at: datetime | None
  deleted_at: datetime | None