from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict
from .charts import ChartRead


class DashboardBase(BaseModel):
    title: str


class DashboardCreate(DashboardBase):
    pass


class DashboardUpdate(BaseModel):
    title: Optional[str] = None


class DashboardListItem(DashboardBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class DashboardRead(DashboardListItem):
    pass
    charts: list["ChartRead"] = []