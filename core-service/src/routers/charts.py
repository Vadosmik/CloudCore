from fastapi import APIRouter, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from db_connect.database import SessionDep
from db_connect.models import Chart, MetricDefinition
from schemas.charts import ChartCreate, ChartRead, ChartUpdate

router = APIRouter(prefix="/charts", tags=["Charts"])


@router.post("/", response_model=ChartRead, status_code=status.HTTP_201_CREATED)
async def create_chart(chart_in: ChartCreate, db: SessionDep):
	query = select(Chart).where(Chart.title == chart_in.title)
	chart = (await db.execute(query)).scalar_one_or_none()

	if chart:
		raise HTTPException(
			status_code=status.HTTP_400_BAD_REQUEST,
			detail=f"Chart with title: {chart_in.title} already exists",
		)
	
	query = select(MetricDefinition).where(MetricDefinition.id.in_(chart_in.metric_ids))
	metrics = list((await db.execute(query)).scalars().all())

	new_chart = Chart(**chart_in.model_dump(exclude={"metric_ids"}), metrics = metrics)

	db.add(new_chart)
	await db.commit()
	await db.refresh(new_chart, attribute_names=["metrics"])

	return new_chart


@router.get("/{chart_id}", response_model=ChartRead)
async def get_chart(chart_id: int, db: SessionDep):
	query = select(Chart).options(selectinload(Chart.metrics)).where(Chart.id == chart_id)
	chart = (await db.execute(query)).scalar_one_or_none()

	if not chart:
		raise HTTPException(
			status_code=status.HTTP_404_NOT_FOUND,
			detail=f"Chart with ID {chart_id} not found.",
		)

	return chart


@router.put("/{chart_id}", response_model=ChartRead)
async def update_chart(chart_id: int, chart_in: ChartUpdate, db: SessionDep):
	query = select(Chart).options(selectinload(Chart.metrics)).where(Chart.id == chart_id)
	chart = (await db.execute(query)).scalar_one_or_none()
	
	if not chart:
		raise HTTPException(
			status_code=status.HTTP_404_NOT_FOUND,
			detail=f"Chart with ID {chart_id} not found.",
		)

	update_data = chart_in.model_dump(exclude_unset=True)
	metric_ids = update_data.pop("metric_ids", None)

	for field, value in update_data.items():
		setattr(chart, field, value)

	if metric_ids is not None:
		query = select(MetricDefinition).where(MetricDefinition.id.in_(metric_ids))
		metrics = (await db.execute(query)).scalars().all()
		chart.metrics = list(metrics)
	
	db.add(chart)
	await db.commit()
	await db.refresh(chart, attribute_names=["metrics"])
	
	return chart


@router.delete("/{chart_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_chart(chart_id: int, db: SessionDep):
	query = select(Chart).where(Chart.id == chart_id)
	chart = (await db.execute(query)).scalar_one_or_none()

	if not chart:
		raise HTTPException(
			status_code=status.HTTP_404_NOT_FOUND,
			detail=f"Chart with ID {chart_id} not found.",
		)

	await db.delete(chart)
	await db.commit()