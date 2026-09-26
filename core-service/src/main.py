import asyncio  # <-- Dodaj ten import
from contextlib import asynccontextmanager
from fastapi import FastAPI
from alembic.config import Config
from alembic import command

from db_connect.database import engine
from routers.charts import router as charts_router
from routers.connections import router as connections_router
from routers.dashboards import router as dashboards_router
from routers.metrics import router as metrics_router
from routers.resources import router as resources_router


def run_migrations():
    alembic_cfg = Config("alembic.ini")
    command.upgrade(alembic_cfg, "head")


@asynccontextmanager
async def lifespan(app: FastAPI):
    await asyncio.to_thread(run_migrations)
    yield
    await engine.dispose()


app = FastAPI(title="CloudCore API", lifespan=lifespan)

app.include_router(dashboards_router)
app.include_router(charts_router)
app.include_router(metrics_router)
app.include_router(resources_router)
app.include_router(connections_router)


@app.get("/health")
async def health() -> dict[str, str]:
    return {"message": "Service is healthy"}