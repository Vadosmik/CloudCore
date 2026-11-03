from datetime import datetime
from typing import Literal, Optional
from pydantic import BaseModel, ConfigDict, Field

from schemas.metrics import MetricDefinitionRead


class ChartBase(BaseModel):
  title: str
  chart_type: Literal["line", "bar", "pie", "gauge"] = "line"
  time_range: str = "1h"

  model_config = ConfigDict(from_attributes=True)


class ChartCreate(ChartBase):
  dashboard_id: int
  metric_ids: list[int]


class ChartUpdate(BaseModel):
  title: Optional[str] = None
  chart_type: Optional[Literal["line", "bar", "pie", "gauge"]] = None
  time_range: Optional[str] = None
  metric_ids: Optional[list[int]] = None


class ChartLayoutItem(BaseModel):
  chart_id: int
  pos_x: int = Field(ge=0)
  pos_y: int = Field(ge=0)
  width: int = Field(ge=1, le=12)
  height: int = Field(ge=1)


class ChartRead(ChartBase):
  id: int
  dashboard_id: int

  pos_x: int
  pos_y: int
  width: int
  height: int

  created_at: datetime
  metrics: list[MetricDefinitionRead] = []