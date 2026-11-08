from datetime import datetime
from typing import Any

import httpx

from src.config import settings


def _headers() -> dict[str, str]:
  return {"X-Internal-Key": settings.internal_api_key.get_secret_value()}


_client = httpx.AsyncClient(
  base_url=settings.core_api_url,
  headers=_headers(),
  timeout=settings.core_api_timeout,
)


async def close() -> None:
  await _client.aclose()


async def get_connections(provider: str = "GCP"):
  response = await _client.get("/internal/connections", params={"provider": provider})
  response.raise_for_status()
  return response.json()


async def sync_resources(connection_id: int, resources: list[dict[str, Any]]):
  response = await _client.post(
    "/internal/resources/sync",
    json={"connection_id": connection_id, "resources": resources},
  )
  response.raise_for_status()
  return response.json()


async def ensure_metric(resource_id: int, name: str, unit: str):
  response = await _client.post(
    "/internal/metrics/definitions",
    json={"resource_id": resource_id, "name": name, "unit": unit},
  )
  response.raise_for_status()
  return response.json()


async def push_points(metric_definition_id: int, points: list[dict[str, Any]]):
  data_points = [
    {"timestamp": _to_iso(point["timestamp"]), "value": point["value"]}
    for point in points
  ]
  response = await _client.post(
    "/internal/metrics/data",
    json={"metric_definition_id": metric_definition_id, "data_points": data_points},
  )
  response.raise_for_status()
  return response.json()


def _to_iso(value: Any):
  return value.isoformat() if isinstance(value, datetime) else value
