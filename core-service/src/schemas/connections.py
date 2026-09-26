from datetime import datetime
from typing import Literal, Optional
from pydantic import BaseModel, ConfigDict


class ConnectionBase(BaseModel):
    name: str
    provider: Literal["AWS", "GCP"]

    model_config = ConfigDict(from_attributes=True)


class ConnectionCreate(ConnectionBase):
    credentials: str  # Zaszyfrowany JSON / token wysyłany przy tworzeniu


class ConnectionUpdate(BaseModel):
    name: Optional[str] = None
    credentials: Optional[str] = None


class ConnectionRead(ConnectionBase):
    id: int
    created_at: datetime