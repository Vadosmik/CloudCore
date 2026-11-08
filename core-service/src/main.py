from contextlib import asynccontextmanager
from fastapi import FastAPI, APIRouter, Depends

from core.database import engine
from core.dependencies import get_current_user_id

from routers.charts import router as charts_router
from routers.connections import router as connections_router
from routers.dashboards import router as dashboards_router
from routers.internal import router as internal_router
from routers.metrics import router as metrics_router
from routers.resources import router as resources_router


@asynccontextmanager
async def lifespan(app: FastAPI):
  yield
  await engine.dispose()


app = FastAPI(title="CloudCore API", lifespan=lifespan)


api_router = APIRouter(prefix="/api")


api_router.include_router(dashboards_router, dependencies=[Depends(get_current_user_id)])
api_router.include_router(charts_router, dependencies=[Depends(get_current_user_id)])
api_router.include_router(metrics_router, dependencies=[Depends(get_current_user_id)])
api_router.include_router(resources_router, dependencies=[Depends(get_current_user_id)])
api_router.include_router(connections_router, dependencies=[Depends(get_current_user_id)])


app.include_router(api_router)
app.include_router(internal_router)


@app.get("/health")
async def health() -> dict[str, str]:
  return {"message": "Service is healthy"}