from fastapi import APIRouter, HTTPException, status

from sqlalchemy import select

from db_connect.database import SessionDep
from db_connect.models import Resource
from schemas.resources import ResourceRead

router = APIRouter(prefix="/resources", tags=["Resources"])


@router.get("/", response_model=list[ResourceRead])
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

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
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

@router.post("/", response_model=ResourceRead, status_code=status.HTTP_201_CREATED)
async def sync_resources(payload: ResourceRead, db: SessionDep) -> Resource:
    for resource in payload.resources:
        query = select(Resource).where(Resource.connection_id == resource.connection_id, Resource.external_id == resource.external_id)
        existing = (await db.execute(query)).scalar_one_or_none()

        if existing:
            existing.name = resource.name
            existing.resource_type = resource.resource_type
            existing.provider_type = resource.provider_type
            existing.region = resource.region
            existing.status = resource.status
        else:
            new_resource = Resource(
                name=resource.name,
                connection_id=resource.connection_id,
                external_id=resource.external_id,
                resource_type=resource.resource_type,
                provider_type=resource.provider_type,
                region=resource.region,
                status=resource.status
            )
            db.add(new_resource)

    await db.commit()