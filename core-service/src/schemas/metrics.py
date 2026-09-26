from datetime import datetime
from pydantic import BaseModel, ConfigDict

class MetricDefinitionBase(BaseModel):
    name: str  # np. 'CPUUtilization'
    unit: str  # np. 'Percent'

    model_config = ConfigDict(from_attributes=True)


class MetricDefinitionCreate(MetricDefinitionBase):
    resource_id: int


class MetricDefinitionRead(MetricDefinitionBase):
    id: int
    resource_id: int


class MetricDataPointBase(BaseModel):
    value: float
    timestamp: datetime

    model_config = ConfigDict(from_attributes=True)


class MetricDataPointCreate(MetricDataPointBase):
    metric_definition_id: int


class MetricDataPointRead(MetricDataPointBase):
    id: int
    metric_definition_id: int


class DataPointIngest(BaseModel):
    timestamp: datetime
    value: float


class MetricBatchIngest(BaseModel):
    metric_definition_id: int
    data_points: list[DataPointIngest]


class MetricWithDataPoints(MetricDefinitionRead):
    data_points: list[MetricDataPointBase] = []