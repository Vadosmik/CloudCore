from typing import Literal, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.dialects.postgresql import insert

from config import verify_internal_key
from db_connect.database import SessionDep
from db_connect.models import Connection, Resource, MetricDataPoint, MetricDefinition
from schemas.connections import ConnectionWithCredentials
from schemas.resources import ResourceBatchSync, ResourceRead
from schemas.metrics import MetricBatchIngest, MetricDefinitionCreate, MetricDefinitionRead


router = APIRouter(
  prefix="/internal",
  tags=["Internal"],
  dependencies=[Depends(verify_internal_key)],
)


@router.get("/connections", response_model=list[ConnectionWithCredentials])
async def get_connections_with_credentials(
  db: SessionDep,
  provider: Optional[Literal["AWS", "GCP"]] = None,
) -> list[Connection]:
  query = select(Connection).order_by(Connection.id)

  if provider is not None:
    query = query.where(Connection.provider == provider)

  result = await db.execute(query)
  return list(result.scalars().all())


# === RESORCE ===
@router.post("/resources/sync", response_model=list[ResourceRead])
async def sync_resources(payload: ResourceBatchSync, db: SessionDep) -> list[Resource]:
  connection = await db.get(Connection, payload.connection_id)

  if not connection:
    raise HTTPException(
      status_code=status.HTTP_404_NOT_FOUND,
      detail=f"Connection with ID {payload.connection_id} not found.",
    )

  if not payload.resources:
    return []

  rows = [
    {**resource.model_dump(), "connection_id": payload.connection_id}
    for resource in payload.resources
  ]

  query = insert(Resource).values(rows)
  query = query.on_conflict_do_update(
    constraint="uq_resource_connection_external",
    set_={
      "name": query.excluded.name,
      "resource_type": query.excluded.resource_type,
      "provider_type": query.excluded.provider_type,
      "region": query.excluded.region,
      "status": query.excluded.status,
      "last_seen_at": func.now(),
    },
  ).returning(Resource)

  result = await db.scalars(query, execution_options={"populate_existing": True})
  resources = list(result.all())
  await db.commit()

  return resources


# === METRICS ===
@router.post("/metrics/definitions", response_model=MetricDefinitionRead, status_code=status.HTTP_201_CREATED)
async def create_metric_definition(payload: MetricDefinitionCreate, db: SessionDep) -> MetricDefinition:
  query = select(MetricDefinition).where(
    MetricDefinition.resource_id == payload.resource_id,
    MetricDefinition.name == payload.name,
  )
  existing = (await db.execute(query)).scalar_one_or_none()

  if existing:
    return existing

  new_def = MetricDefinition(**payload.model_dump())
  db.add(new_def)
  await db.commit()
  await db.refresh(new_def)
  return new_def


@router.post("/metrics/data", status_code=status.HTTP_201_CREATED)
async def save_measurements(payload: MetricBatchIngest, db: SessionDep) -> dict[str, int]:
  metric_definition = await db.get(MetricDefinition, payload.metric_definition_id)

  if not metric_definition:
    raise HTTPException(
      status_code=status.HTTP_404_NOT_FOUND,
      detail=f"Metric definition with ID {payload.metric_definition_id} not found.",
    )

  if not payload.data_points:
    return {"received": 0, "inserted": 0}

  rows = [
    {
      "metric_definition_id": payload.metric_definition_id,
      "timestamp": point.timestamp,
      "value": point.value,
    }
    for point in payload.data_points
  ]

  stmt = (
    insert(MetricDataPoint)
    .values(rows)
    .on_conflict_do_nothing(constraint="uq_data_point_metric_timestamp")
    .returning(MetricDataPoint.id)
  )

  inserted_ids = (await db.scalars(stmt)).all()
  await db.commit()

  return {"received": len(rows), "inserted": len(inserted_ids)}