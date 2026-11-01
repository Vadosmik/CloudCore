from datetime import datetime
from typing import Literal, Optional
from pydantic import BaseModel, ConfigDict, Field


ResourceType = Literal["COMPUTE", "DATABASE", "STORAGE", "NETWORK", "OTHER"]
ResourceStatus = Literal["RUNNING", "STOPPED", "TERMINATED", "UNKNOWN"]


class ResourceBase(BaseModel):
  external_id: str = Field(max_length=255)  # np. "i-0123456789" (AWS) / instance-id (GCP)
  name: str = Field(max_length=100)
  resource_type: ResourceType = "OTHER"
  provider_type: str = Field(max_length=50)  # np. "aws:ec2", "gcp:cloud_sql", "aws:lambda"
  region: Optional[str] = Field(default=None, max_length=50)  # np. "us-east-1", "europe-west1"
  status: ResourceStatus = "UNKNOWN"

  model_config = ConfigDict(from_attributes=True)


class ResourceSyncItem(ResourceBase):
  pass


class ResourceBatchSync(BaseModel):
  connection_id: int
  resources: list[ResourceSyncItem]


class ResourceRead(ResourceBase):
  id: int
  connection_id: int
  last_seen_at: datetime
  created_at: datetime
