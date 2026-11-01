import json
from datetime import datetime
from typing import Any

import boto3


EC2_STATUS = {
  "running": "RUNNING",
  "stopped": "STOPPED",
  "terminated": "TERMINATED",
}


class AwsClient:
  def __init__(self, credentials: str):
    creds = json.loads(credentials)
    self.region = creds["region"]
    session = boto3.Session(
      aws_access_key_id=creds["aws_access_key_id"],
      aws_secret_access_key=creds["aws_secret_access_key"],
      region_name=self.region,
    )
    self.ec2 = session.client("ec2")
    self.cloudwatch = session.client("cloudwatch")

  def list_instances(self) -> list[dict[str, Any]]:
    instances = []
    paginator = self.ec2.get_paginator("describe_instances")
    for page in paginator.paginate():
      for reservation in page["Reservations"]:
        for instance in reservation["Instances"]:
          instances.append(self._normalize_instance(instance))
    return instances

  def get_cpu(self, instance_id: str, start: datetime, end: datetime) -> list[dict[str, Any]]:
    response = self.cloudwatch.get_metric_statistics(
      Namespace="AWS/EC2",
      MetricName="CPUUtilization",
      Dimensions=[{"Name": "InstanceId", "Value": instance_id}],
      StartTime=start,
      EndTime=end,
      Period=300,
      Statistics=["Average"],
    )
    datapoints = sorted(response["Datapoints"], key=lambda point: point["Timestamp"])
    return [
      {"timestamp": point["Timestamp"], "value": point["Average"]}
      for point in datapoints
    ]

  # === nowszy metod ale zawsze płatny  ---  ok. $0.01 za 1000 pobranych metryk ===
  # def get_cpu(self, instance_id: str, start: datetime, end: datetime) -> list[dict[str, Any]]:
  #   response = self.cloudwatch.get_metric_data(
  #     MetricDataQueries=[{
  #       "Id": "cpu",
  #       "MetricStat": {
  #         "Metric": {
  #           "Namespace": "AWS/EC2",
  #           "MetricName": "CPUUtilization",
  #           "Dimensions": [{"Name": "InstanceId", "Value": instance_id}],
  #         },
  #         "Period": 300,
  #         "Stat": "Average",
  #       },
  #     }],
  #     StartTime=start,
  #     EndTime=end,
  #     ScanBy="TimestampAscending",
  #   )
  #   result = response["MetricDataResults"][0]
  #   return [
  #     {"timestamp": timestamp, "value": value}
  #     for timestamp, value in zip(result["Timestamps"], result["Values"])
  #   ]

  def _normalize_instance(self, instance: dict[str, Any]) -> dict[str, Any]:
    tags = {tag["Key"]: tag["Value"] for tag in instance.get("Tags", [])}
    return {
      "external_id": instance["InstanceId"],
      "name": tags.get("Name", instance["InstanceId"]),
      "resource_type": "COMPUTE",
      "provider_type": "aws:ec2",
      "region": self.region,
      "status": EC2_STATUS.get(instance["State"]["Name"], "UNKNOWN"),
    }
