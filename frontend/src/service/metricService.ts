import { api } from "./api";
import type { MetricDataPoint, MetricDefinition } from "../types/metrics";
import type { TimeRange } from "../types/charts";

export async function getMetricDefinitions(resourceId: number): Promise<MetricDefinition[]> {
  const response = await api.get<MetricDefinition[]>("/metrics", {
    params: { resource_id: resourceId },
  });
  return response.data;
}

export async function getMetricDataPoints(
  metricId: number,
  timeRange: TimeRange,
): Promise<MetricDataPoint[]> {
  const response = await api.get<MetricDataPoint[]>("/metrics/data", {
    params: { metric_definition_id: metricId, time_range: timeRange },
  });
  return response.data;
}
