from fastapi import APIRouter, HTTPException, status
from sqlalchemy import select

from core.database import SessionDep
from core.dependencies import CurrentAdmin
from models import Resource
from schemas.resources import ResourceRead

router = APIRouter(prefix="/resources", tags=["Resources"])


@router.get("", response_model=list[ResourceRead])
async def get_resources(db: SessionDep) -> list[Resource]:
  query = select(Resource).order_by(Resource.id.desc())
  result = await db.execute(query)

  return list(result.scalars().all())


@router.get("/{id}", response_model=ResourceRead)
async def get_resource(id: int, db: SessionDep) -> Resource:
  query = select(Resource).where(Resource.id == id)
  resource = (await db.execute(query)).scalar_one_or_none()
  
  if not resource:
    raise HTTPException(
      status_code=status.HTTP_404_NOT_FOUND,
      detail=f"Resource with ID {id} not found.",
    )
  
  return resource


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=CurrentAdmin)
async def delete_resource(id: int, db: SessionDep) -> None:
  query = select(Resource).where(Resource.id == id)
  resource = (await db.execute(query)).scalar_one_or_none()
  
  if not resource:
    raise HTTPException(
      status_code=status.HTTP_404_NOT_FOUND,
      detail=f"Resource with ID {id} not found.",
    )
  
  await db.delete(resource)
  await db.commit()
