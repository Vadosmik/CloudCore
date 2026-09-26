from fastapi import APIRouter, HTTPException, status
from sqlalchemy import select

from db_connect.database import SessionDep
from db_connect.models import Connection
from schemas.connections import (
    ConnectionCreate,
    ConnectionRead,
    ConnectionUpdate,
)

router = APIRouter(prefix="/connections", tags=["Connections"])


@router.post("/", response_model=ConnectionRead, status_code=status.HTTP_201_CREATED)
async def create_connection(payload: ConnectionCreate, db: SessionDep) -> Connection:
    query = select(Connection).where(Connection.name == payload.name)
    results = (await db.execute(query)).scalar_one_or_none()

    if results:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Connection with name '{payload.name}' already exists.",
        )

    new_connection = Connection(**payload.model_dump())
    db.add(new_connection)
    await db.commit()
    await db.refresh(new_connection)
    return new_connection


@router.get("/", response_model=list[ConnectionRead])
async def get_connections(db: SessionDep) -> list[Connection]:
    query = select(Connection).order_by(Connection.id.desc())
    result = await db.execute(query)
    return list(result.scalars().all())


@router.get("/{id}", response_model=ConnectionRead)
async def get_connection(id: int, db: SessionDep) -> Connection:
    query = select(Connection).where(Connection.id == id)
    conn = (await db.execute(query)).scalar_one_or_none()

    if not conn:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Connection with ID {id} not found.",
        )
    
    return conn


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_connection(id: int, db: SessionDep) -> None:
    query = select(Connection).where(Connection.id == id)
    conn = (await db.execute(query)).scalar_one_or_none()

    if not conn:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Connection with ID {id} not found.",
        )

    await db.delete(conn)
    await db.commit()
