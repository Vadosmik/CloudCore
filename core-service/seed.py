# seed_demo.py
# python seed_demo.py           -> dodaje dane demo (idempotentnie)
# python seed_demo.py --clean   -> usuwa dane demo
# python seed_demo.py --reset   -> clean + seed (świeże punkty "do teraz")
import argparse
import asyncio
import random
from typing import Optional
from datetime import datetime, timedelta, timezone

from sqlalchemy import func, select

from core.database import AsyncSessionLocal
from src.models import (
  Chart,
  Connection,
  Dashboard,
  MetricDataPoint,
  MetricDefinition,
  Resource,
)

DEMO_CONNECTION = "Demo AWS"
DEMO_DASHBOARD = "Demo - AWS EC2"
DEMO_CHART = "CPU - web-server-1"
N_POINTS = 10
STEP = timedelta(minutes=5)


async def get_or_create(db, model, lookup: dict, defaults: Optional[dict] = None):
  obj = (await db.execute(select(model).filter_by(**lookup))).scalar_one_or_none()
  if obj:
    return obj
  obj = model(**lookup, **(defaults or {}))
  db.add(obj)
  await db.flush()  # żeby obj.id było dostępne
  return obj


async def seed() -> None:
  async with AsyncSessionLocal() as db:
    conn = await get_or_create(
      db, Connection,
      {"name": DEMO_CONNECTION},
      {"provider": "AWS", "credentials": "demo-not-real"},
    )
    resource = await get_or_create(
      db, Resource,
      {"connection_id": conn.id, "external_id": "i-demo0001"},
      {
        "name": "web-server-1",
        "resource_type": "COMPUTE",
        "provider_type": "aws:ec2",
        "region": "eu-central-1",
        "status": "RUNNING",
      },
    )
    metric = await get_or_create(
      db, MetricDefinition,
      {"resource_id": resource.id, "name": "CPUUtilization"},
      {"unit": "Percent"},
    )
    dashboard = await get_or_create(db, Dashboard, {"title": DEMO_DASHBOARD})

    points_count = (
      await db.execute(
        select(func.count())
        .select_from(MetricDataPoint)
        .where(MetricDataPoint.metric_definition_id == metric.id)
      )
    ).scalar_one()

    if points_count == 0:
      now = datetime.now(timezone.utc)
      value = 35.0
      points = []
      for i in range(N_POINTS):
        value = min(95.0, max(5.0, value + random.uniform(-8, 8)))
        points.append(
          MetricDataPoint(
            metric_definition_id=metric.id,
            timestamp=now - STEP * (N_POINTS - 1 - i),
            value=round(value, 2),
          )
        )
      db.add_all(points)

    chart = (
      await db.execute(
        select(Chart).where(
          Chart.dashboard_id == dashboard.id, Chart.title == DEMO_CHART
        )
      )
    ).scalar_one_or_none()
    if chart is None:
      db.add(
        Chart(
          dashboard_id=dashboard.id,
          title=DEMO_CHART,
          chart_type="line",
          time_range="1h",
          metrics=[metric],
        )
      )

    await db.commit()
    print(f"OK: dashboard id={dashboard.id} -> /dashboards/{dashboard.id}")


async def clean() -> None:
  # kaskady w modelach usuwają resztę: wykresy, zasoby, metryki, punkty
  async with AsyncSessionLocal() as db:
    dashboard = (
      await db.execute(select(Dashboard).where(Dashboard.title == DEMO_DASHBOARD))
    ).scalar_one_or_none()
    if dashboard:
      await db.delete(dashboard)

    conn = (
      await db.execute(select(Connection).where(Connection.name == DEMO_CONNECTION))
    ).scalar_one_or_none()
    if conn:
      await db.delete(conn)

    await db.commit()
    print("Dane demo usunięte")


if __name__ == "__main__":
  parser = argparse.ArgumentParser()
  parser.add_argument("--clean", action="store_true")
  parser.add_argument("--reset", action="store_true")
  args = parser.parse_args()

  if args.clean:
    asyncio.run(clean())
  elif args.reset:
    asyncio.run(clean())
    asyncio.run(seed())
  else:
    asyncio.run(seed())