import secrets
from fastapi import Header, HTTPException, status
from typing import Annotated, Optional

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer

from core.config import settings

TOKEN_URL = "/account/auth/login"

oauth2_scheme = OAuth2PasswordBearer(tokenUrl=TOKEN_URL)
optional_oauth2_scheme = OAuth2PasswordBearer(tokenUrl=TOKEN_URL, auto_error=False)

CREDENTIALS_EXCEPTION = HTTPException(
  status_code=status.HTTP_401_UNAUTHORIZED,
  detail="Could not validate credentials",
  headers={"WWW-Authenticate": "Bearer"},
)

def verify_internal_key(x_internal_key: Annotated[Optional[str], Header(...)] = None):
  if x_internal_key is None or not secrets.compare_digest(x_internal_key, settings.internal_api_key.get_secret_value()):
    raise HTTPException(
      status_code=status.HTTP_401_UNAUTHORIZED,
      detail="Invalid or missing X-Internal-Key header."
    )

def _decode_access_token(token: str) -> dict:
  try:
    payload = jwt.decode(
      token,
      settings.jwt_secret.get_secret_value(),
      algorithms=[settings.jwt_algorithm],
      options={"require": ["exp", "sub"]},
    )
  except jwt.PyJWTError:
    raise CREDENTIALS_EXCEPTION

  if payload.get("type") != "access" or not str(payload["sub"]).isdigit():
    raise CREDENTIALS_EXCEPTION

  return payload

# 1. Fully Payload
async def get_current_token_payload(token: Annotated[str, Depends(oauth2_scheme)]) -> dict:
  return _decode_access_token(token)

PayloadDep = Annotated[dict, Depends(get_current_token_payload)]

# 2. Only ID
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

CurrentAdmin = [Depends(require_admin)]