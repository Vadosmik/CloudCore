from fastapi import APIRouter
from sqlalchemy import select
from typing import Optional

from db_connect.database import SessionDep
from db_connect.models import MetricDataPoint, MetricDefinition
from schemas.metrics import MetricDataPointRead, MetricDefinitionRead

router = APIRouter(prefix="/metrics", tags=["Metrics"])


@router.get("/", response_model=list[MetricDefinitionRead])
async def get_metric_definitions(db: SessionDep, resource_id: Optional[int] = None ) -> list[MetricDefinition]:
  query = select(MetricDefinition)

  if resource_id is not None:
    query = query.where(MetricDefinition.resource_id == resource_id)

  result = await db.execute(query)
  return list(result.scalars().all())


@router.get("/data", response_model=list[MetricDataPointRead])
async def get_metric_data(metric_definition_id: int, db: SessionDep):
  query = select(MetricDataPoint).where(MetricDataPoint.metric_definition_id == metric_definition_id).order_by(MetricDataPoint.timestamp.asc())

  result = await db.execute(query)
  return list(result.scalars().all())