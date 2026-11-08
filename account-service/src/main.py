from contextlib import asynccontextmanager

from fastapi import FastAPI

from core.config import settings
from core.database import engine

from src.routers.auth import router as auth_router
from src.routers.users import router as user_router

from src.routers.roles import router as roles_router
from src.routers.admin import router as admin_router

@asynccontextmanager
async def lifespan(app: FastAPI):
  yield
  await engine.dispose()

app = FastAPI(
  title=settings.project_name,
  version=settings.version,
  description="Lorely user service: accounts, auth and roles",
  lifespan=lifespan,
)

@app.get("/health")
async def health_check():
  return {"status": "ok"}

API_PREFIX = "/account"

app.include_router(auth_router, prefix=API_PREFIX)
app.include_router(user_router, prefix=API_PREFIX)
app.include_router(roles_router, prefix=API_PREFIX)
app.include_router(admin_router, prefix=API_PREFIX)
