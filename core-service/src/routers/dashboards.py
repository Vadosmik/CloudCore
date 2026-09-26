from fastapi import APIRouter, HTTPException, status
from sqlalchemy import select

from db_connect.database import SessionDep
from db_connect.models import Dashboard
from schemas.dashboards import (
    DashboardCreate,
    DashboardListItem,
    DashboardRead,
    DashboardUpdate,
)

router = APIRouter(prefix="/dashboards", tags=["Dashboards"])


@router.get("/", response_model=list[DashboardListItem])
async def get_dashboards(db: SessionDep) -> list[DashboardListItem]:
    query = select(Dashboard)
    dashboards = (await db.execute(query)).scalars().all()

    return dashboards


@router.post("/", response_model=DashboardRead, status_code=status.HTTP_201_CREATED)
async def create_dashboard(dashboard_in: DashboardCreate, db: SessionDep):
    query = select(Dashboard).where(Dashboard.title == dashboard_in.title)
    dashboard = (await db.execute(query)).scalar_one_or_none()
    
    if dashboard:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Dashboard with title: {dashboard_in.title} already exists",
        )
    
    new_dashboard = Dashboard(**dashboard_in.model_dump())

    db.add(new_dashboard)
    await db.commit()
    await db.refresh(new_dashboard)

    return new_dashboard


@router.get("/{dashboard_id}", response_model=DashboardRead)
async def get_dashboard(dashboard_id: int, db: SessionDep):
    query = select(Dashboard).where(Dashboard.id == dashboard_id)
    dashboard = (await db.execute(query)).scalar_one_or_none()

    if not dashboard:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Dashboard with id: {dashboard_id} not found",
        )

    return dashboard


@router.put("/{dashboard_id}", response_model=DashboardRead)
async def update_dashboard(dashboard_id: int, dashboard_in: DashboardUpdate, db: SessionDep):
    query = select(Dashboard).where(Dashboard.id == dashboard_id)
    dashboard = (await db.execute(query)).scalar_one_or_none()

    if not dashboard:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Dashboard with id: {dashboard_id} not found",
        )

    update_data = dashboard_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(dashboard, field, value)

    db.add(dashboard)
    await db.commit()
    await db.refresh(dashboard)

    return dashboard


@router.delete("/{dashboard_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_dashboard(dashboard_id: int, db: SessionDep):
    query = select(Dashboard).where(Dashboard.id == dashboard_id)
    dashboard = (await db.execute(query)).scalar_one_or_none()

    if not dashboard:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Dashboard with id: {dashboard_id} not found",
        )

    await db.delete(dashboard)
    await db.commit()