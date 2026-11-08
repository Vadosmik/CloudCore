from datetime import datetime, timedelta, timezone
 
import bcrypt
import jwt
 
from core.config import settings

MAX_PASSWORD_BYTES = 72

# === PASSWORD ===
def get_password_hash(password: str) -> str:
  password_bytes = password.encode("utf-8")
  if len(password_bytes) > MAX_PASSWORD_BYTES:
    raise ValueError("Password is too long")
  return bcrypt.hashpw(password_bytes, bcrypt.gensalt()).decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
  password_bytes = plain_password.encode("utf-8")
  if len(password_bytes) > MAX_PASSWORD_BYTES:
    return False 
  try:
    return bcrypt.checkpw(password_bytes, hashed_password.encode("utf-8"))
  except ValueError:
    return False


# === TOKEN ===
def _encode(payload: dict) -> str:
  return jwt.encode(payload, settings.jwt_secret.get_secret_value(), algorithm=settings.jwt_algorithm)

def create_access_token(user_id: int, username: str, roles: list[str]) -> str:
  now = datetime.now(timezone.utc)
  return _encode({
    "sub": str(user_id),
    "username": username,
    "roles": roles,
    "type": "access",
    "iat": now,
    "exp": now + timedelta(minutes=settings.jwt_expiration),
  })

def create_refresh_token(user_id: int) -> str:
  now = datetime.now(timezone.utc)
  return _encode({
    "sub": str(user_id),
    "type": "refresh",
    "iat": now,
    "exp": now + timedelta(days=settings.refresh_token_expiration),
  })

def decode_refresh_token(refresh_token: str) -> int:
  try:
    payload = jwt.decode(
      refresh_token,
      settings.jwt_secret.get_secret_value(),
      algorithms=[settings.jwt_algorithm],
      options={"require": ["exp", "sub", "type"]},
    )
  except jwt.ExpiredSignatureError:
    raise ValueError("Refresh token expired")
  except jwt.PyJWTError:
    raise ValueError("Invalid token")
 
  if payload["type"] != "refresh" or not str(payload["sub"]).isdigit():
    raise ValueError("Invalid token")
 
  return int(payload["sub"])
