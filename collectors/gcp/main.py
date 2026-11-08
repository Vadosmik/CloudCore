import asyncio
from datetime import datetime, timedelta, timezone
import logging

from src.gcp_client import GCE_METRICS, GcpClient
from src.config import settings
from src.core_api import get_connections, sync_resources, ensure_metric, push_points

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")


async def collect(conn):
  cloud = GcpClient(conn["credentials"])
  resources = await asyncio.to_thread(cloud.list_instances)

  synced = await sync_resources(conn["id"], resources)
  logging.info("connection %s: %d instances", conn["id"], len(synced))

  end = datetime.now(timezone.utc)
  start = end - timedelta(minutes=settings.metrics_lookback_minutes)
  for r in synced:
    for name, (metric_type, unit, aligner, scale) in GCE_METRICS.items():
      metric = await ensure_metric(r["id"], name, unit)
      points = await asyncio.to_thread(cloud.get_metric, r["external_id"], metric_type, aligner, scale, start, end)
      result = await push_points(metric["id"], points)
      logging.info("%s %s: %s", r["external_id"], name, result)


async def main():
  while True:
    try:
      for conn in await get_connections("GCP"):
        try:
          await collect(conn)
        except Exception:
          logging.exception("connection %s failed", conn["id"])
    except Exception:
      logging.exception("cannot get connections from core")
    await asyncio.sleep(settings.discovery_interval)


if __name__ == "__main__":
  asyncio.run(main())
