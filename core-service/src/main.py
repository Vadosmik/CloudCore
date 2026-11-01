import asyncio
import traceback
from contextlib import asynccontextmanager
from fastapi import FastAPI, APIRouter
from pathlib import Path
from alembic.config import Config
from alembic import command

from db_connect.database import engine
from routers.charts import router as charts_router
from routers.connections import router as connections_router
from routers.dashboards import router as dashboards_router
from routers.internal import router as internal_router
from routers.metrics import router as metrics_router
from routers.resources import router as resources_router


def run_migrations():
  try:
    base_dir = Path(__file__).resolve().parent.parent
    ini_path = base_dir / "alembic.ini"
    alembic_cfg = Config(str(ini_path))
    alembic_cfg.set_main_option("script_location", str(base_dir / "alembic"))
    command.upgrade(alembic_cfg, "head")
    print("--- MIGRACJE ZAKOŃCZONE SUKCESEM ---")
  except Exception as e:
    print("--- BŁĄD PODCZAS URUCHAMIANIA MIGRACJI ---")
    traceback.print_exc()
    raise e


@asynccontextmanager
async def lifespan(app: FastAPI):
  await asyncio.to_thread(run_migrations)
  yield
  await engine.dispose()


app = FastAPI(title="CloudCore API", lifespan=lifespan)


api_router = APIRouter(prefix="/api")


api_router.include_router(dashboards_router)
api_router.include_router(charts_router)
api_router.include_router(metrics_router)
api_router.include_router(resources_router)
api_router.include_router(connections_router)


app.include_router(api_router)
app.include_router(internal_router)


@app.get("/health")
async def health() -> dict[str, str]:
  return {"message": "Service is healthy"}