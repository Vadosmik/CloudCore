import json
from datetime import datetime
from typing import Any

from google.oauth2 import service_account
from google.cloud import compute_v1, monitoring_v3


GCE_STATUS = {
  "RUNNING": "RUNNING",
  "STOPPING": "STOPPED",
  "TERMINATED": "STOPPED",
  "SUSPENDED": "STOPPED",
}


GCE_METRICS = {
  "CPUUtilization": ("instance/cpu/utilization", "Percent", "ALIGN_MEAN", 100),
  "NetworkIn": ("instance/network/received_bytes_count", "Bytes", "ALIGN_SUM", 1),
  "NetworkOut": ("instance/network/sent_bytes_count", "Bytes", "ALIGN_SUM", 1),
  "DiskReadBytes": ("instance/disk/read_bytes_count", "Bytes", "ALIGN_SUM", 1),
  "DiskWriteBytes": ("instance/disk/write_bytes_count", "Bytes", "ALIGN_SUM", 1),
  "DiskReadOps": ("instance/disk/read_ops_count", "Count", "ALIGN_SUM", 1),
  "DiskWriteOps": ("instance/disk/write_ops_count", "Count", "ALIGN_SUM", 1),
}


class GcpClient:
  def __init__(self, credentials: str):
    creds_dict = json.loads(credentials)
    self.project_id = creds_dict.get("project_id")
    self.credentials = service_account.Credentials.from_service_account_info(creds_dict)
    self.instances = compute_v1.InstancesClient(credentials=self.credentials)
    self.monitoring = monitoring_v3.MetricServiceClient(credentials=self.credentials)

  def list_instances(self) -> list[dict[str, Any]]:
    instances = []
    for _zone, scoped in self.instances.aggregated_list(request={"project": self.project_id}):
      for instance in scoped.instances:
        instances.append(self._normalize_instance(instance))
    return instances

  def get_metric(self, instance_id: str, metric_type: str, aligner: str, scale: float, start: datetime, end: datetime) -> list[dict[str, Any]]:
    results = self.monitoring.list_time_series(
      request={
        "name": f"projects/{self.project_id}",
        "filter": (
          f'metric.type = "compute.googleapis.com/{metric_type}" '
          f'AND resource.labels.instance_id = "{instance_id}"'
        ),
        "interval": monitoring_v3.TimeInterval(start_time=start, end_time=end),
        "aggregation": monitoring_v3.Aggregation(
          alignment_period={"seconds": 300},
          per_series_aligner=monitoring_v3.Aggregation.Aligner[aligner],
          cross_series_reducer=monitoring_v3.Aggregation.Reducer.REDUCE_SUM,
          group_by_fields=["resource.labels.instance_id"]
        ),
        "view": monitoring_v3.ListTimeSeriesRequest.TimeSeriesView.FULL,
      }
    )
    
    points = [
      {
        "timestamp": point.interval.end_time,
        "value": (point.value.double_value or point.value.int64_value) * scale,
      }
      for series in results
      for point in series.points
    ]
    return sorted(points, key=lambda point: point["timestamp"])

  def _normalize_instance(self, instance: compute_v1.Instance) -> dict[str, Any]:
    zone = instance.zone.rsplit("/", 1)[-1]
    return {
      "external_id": str(instance.id),
      "name": instance.name,
      "resource_type": "COMPUTE",
      "provider_type": "gcp:compute",
      "region": zone.rsplit("-", 1)[0],
      "status": GCE_STATUS.get(instance.status, "UNKNOWN"),
    }

