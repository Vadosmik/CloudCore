from datetime import datetime
from typing import List, Optional
from sqlalchemy import DateTime, ForeignKey, String, Table, Column, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from db_connect.database import Base

chart_metrics = Table(
  "chart_metrics",
  Base.metadata,
  Column("chart_id", ForeignKey("charts.id", ondelete="CASCADE"), primary_key=True),
  Column("metric_definition_id", ForeignKey("metric_definitions.id", ondelete="CASCADE"), primary_key=True),
)

class Connection(Base):
  __tablename__ = "connections"

  id: Mapped[int] = mapped_column(primary_key=True, index=True)
  provider: Mapped[str] = mapped_column(String(20))  # 'GCP', 'AWS'
  name: Mapped[str] = mapped_column(String(100), unique=True, index=True)
  credentials: Mapped[str] = mapped_column()  # Zaszyfrowany JSON / token
  created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

  resources: Mapped[List["Resource"]] = relationship(back_populates="connection", cascade="all, delete-orphan")


class Resource(Base):
  __tablename__ = "resources"
  __table_args__ = (
    UniqueConstraint("connection_id", "external_id", name="uq_resource_connection_external"),
  )

  id: Mapped[int] = mapped_column(primary_key=True, index=True)
  connection_id: Mapped[int] = mapped_column(ForeignKey("connections.id", ondelete="CASCADE"))
  external_id: Mapped[str] = mapped_column(String(255), index=True)  # np. i-0123456789 (AWS) / instance-id (GCP)
  name: Mapped[str] = mapped_column(String(100))

  resource_type: Mapped[str] = mapped_column(String(20), default="OTHER")  # 'COMPUTE', 'DATABASE', 'STORAGE', ...
  provider_type: Mapped[str] = mapped_column(String(50))  # np. 'aws:ec2', 'gcp:compute'
  region: Mapped[Optional[str]] = mapped_column(String(50))  # np. 'eu-central-1'
  status: Mapped[str] = mapped_column(String(20), default="UNKNOWN", server_default="UNKNOWN")  # 'RUNNING', 'STOPPED', ...

  last_seen_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
  created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

  connection: Mapped["Connection"] = relationship(back_populates="resources")
  metrics: Mapped[List["MetricDefinition"]] = relationship(back_populates="resource", cascade="all, delete-orphan")


class MetricDefinition(Base):
  __tablename__ = "metric_definitions"
  __table_args__ = (
    UniqueConstraint("resource_id", "name", name="uq_metric_definition_resource_name"),
  )

  id: Mapped[int] = mapped_column(primary_key=True, index=True)
  resource_id: Mapped[int] = mapped_column(ForeignKey("resources.id", ondelete="CASCADE"))
  
  name: Mapped[str] = mapped_column(String(100))  # np. 'CPUUtilization'
  unit: Mapped[str] = mapped_column(String(20))   # np. 'Percent', 'Bytes'

  resource: Mapped["Resource"] = relationship(back_populates="metrics")
  data_points: Mapped[List["MetricDataPoint"]] = relationship(back_populates="metric_definition", cascade="all, delete-orphan")
  charts: Mapped[List["Chart"]] = relationship(secondary=chart_metrics, back_populates="metrics")


class MetricDataPoint(Base):
  __tablename__ = "metric_data_points"
  __table_args__ = (
    UniqueConstraint("metric_definition_id", "timestamp", name="uq_data_point_metric_timestamp"),
  )

  id: Mapped[int] = mapped_column(primary_key=True)
  metric_definition_id: Mapped[int] = mapped_column(ForeignKey("metric_definitions.id", ondelete="CASCADE"), index=True)
  
  value: Mapped[float] = mapped_column()
  timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True, server_default=func.now())

  metric_definition: Mapped["MetricDefinition"] = relationship(back_populates="data_points")


class Chart(Base):
  __tablename__ = "charts"

  id: Mapped[int] = mapped_column(primary_key=True, index=True)
  dashboard_id: Mapped[int] = mapped_column(ForeignKey("dashboards.id", ondelete="CASCADE"))

  pos_x: Mapped[int] = mapped_column(default=0)
  pos_y: Mapped[int] = mapped_column(default=0)
  width: Mapped[int] = mapped_column(default=6)
  height: Mapped[int] = mapped_column(default=4)
  
  title: Mapped[str] = mapped_column(String(100))
  chart_type: Mapped[str] = mapped_column(String(30))  # np. 'line', 'bar', 'gauge'
  time_range: Mapped[str] = mapped_column(String(20), default="1h")  # np. '15m', '1h', '24h'

  dashboard: Mapped["Dashboard"] = relationship(back_populates="charts")
  metrics: Mapped[List["MetricDefinition"]] = relationship(secondary=chart_metrics, back_populates="charts", lazy="selectin")
  
  created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
  updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class Dashboard(Base):
  __tablename__ = "dashboards"

  id: Mapped[int] = mapped_column(primary_key=True, index=True)
  title: Mapped[str] = mapped_column(String(100), unique=True, index=True)
  
  created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
  updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

  charts: Mapped[List["Chart"]] = relationship(back_populates="dashboard", lazy="selectin", cascade="all, delete-orphan")