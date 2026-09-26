from fastapi import APIRouter, status
from sqlalchemy import select

from db_connect.database import SessionDep
from db_connect.models import MetricDataPoint, MetricDefinition
from schemas.metrics import (
    MetricBatchIngest,
    MetricDataPointRead,
    MetricDefinitionCreate,
    MetricDefinitionRead,
)

router = APIRouter(prefix="/metrics", tags=["Metrics"])


@router.get("/", response_model=list[MetricDefinitionRead])
async def get_metric_definitions(db: SessionDep, resource_id: int | None = None ) -> list[MetricDefinition]:
    query = select(MetricDefinition)

    if resource_id is not None:
        query = query.where(MetricDefinition.resource_id == resource_id)

    result = await db.execute(query)
    return list(result.scalars().all())


@router.post("/definitions", response_model=MetricDefinitionRead, status_code=status.HTTP_201_CREATED)
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


@router.post("/data", status_code=status.HTTP_201_CREATED)
async def save_measurements(payload: MetricBatchIngest, db: SessionDep) -> MetricDefinition:
    db_points = [
        MetricDataPoint(
            metric_definition_id=payload.metric_definition_id,
            timestamp=point.timestamp,
            value=point.value,
        )
        for point in payload.data_points
    ]

    db.add_all(db_points)
    await db.commit()


@router.get("/data", response_model=list[MetricDataPointRead])
async def get_metric_data(metric_definition_id: int, db: SessionDep):
    query = select(MetricDataPoint).where(MetricDataPoint.metric_definition_id == metric_definition_id).order_by(MetricDataPoint.timestamp.asc())

    result = await db.execute(query)
    return list(result.scalars().all())