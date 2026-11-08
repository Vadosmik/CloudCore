from fastapi import APIRouter
from sqlalchemy import select
from datetime import datetime, timedelta, timezone
from typing import Literal, Optional

from core.database import SessionDep
from models import MetricDataPoint, MetricDefinition
from schemas.metrics import MetricDataPointRead, MetricDefinitionRead

router = APIRouter(prefix="/metrics", tags=["Metrics"])


TIME_RANGES = {
  "15m": timedelta(minutes=15),
  "1h": timedelta(hours=1),
  "24h": timedelta(hours=24),
  "7d": timedelta(days=7),
  "30d": timedelta(days=30),
}


@router.get("", response_model=list[MetricDefinitionRead])
async def get_metric_definitions(db: SessionDep, resource_id: Optional[int] = None ) -> list[MetricDefinition]:
  query = select(MetricDefinition)

  if resource_id is not None:
    query = query.where(MetricDefinition.resource_id == resource_id)

  result = await db.execute(query)
  return list(result.scalars().all())


@router.get("/data", response_model=list[MetricDataPointRead])
async def get_metric_data(db: SessionDep, metric_definition_id: int, time_range: Literal["15m", "1h", "24h", "7d", "30d"] = "1h"):
  since = datetime.now(timezone.utc) - TIME_RANGES[time_range]

  query = (
    select(MetricDataPoint)
    .where(MetricDataPoint.metric_definition_id == metric_definition_id)
    .where(MetricDataPoint.timestamp >= since)
    .order_by(MetricDataPoint.timestamp.asc()))

  result = await db.execute(query)
  return list(result.scalars().all())