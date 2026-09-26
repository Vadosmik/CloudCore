from datetime import datetime
from typing import Literal, Optional
from pydantic import BaseModel, ConfigDict


ResourceType = Literal["COMPUTE", "DATABASE", "STORAGE", "NETWORK", "OTHER"]
ResourceStatus = Literal["RUNNING", "STOPPED", "TERMINATED", "UNKNOWN"]


class ResourceBase(BaseModel):
    name: str
    resource_type: ResourceType = "OTHER"
    provider_type: str  # np. "aws:ec2", "gcp:cloud_sql", "aws:lambda"
    provider_resource_id: str  # ARN z AWS lub ID z GCP
    region: Optional[str] = None  # np. "us-east-1", "europe-west1"

    model_config = ConfigDict(from_attributes=True)


class ResourceSyncItem(ResourceBase):
    status: ResourceStatus = "RUNNING"
    metadata_json: Optional[dict] = None


class ResourceBatchSync(BaseModel):
    connection_id: int
    resources: list[ResourceSyncItem]


class ResourceRead(ResourceBase):
    id: int
    connection_id: int
    status: ResourceStatus
    last_seen_at: datetime
    created_at: datetime