export interface MetricDefinition {
  id: number;
  resource_id: number;
  name: string;
  unit: string;
}

export interface MetricDataPoint {
  id: number;
  metric_definition_id: number;
  value: number;
  timestamp: string;
}