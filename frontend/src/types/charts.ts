import type { MetricDefinition } from "./metrics";

export type ChartType = "line" | "bar" | "pie" | "gauge";

export interface Chart {
  id: number;
  dashboard_id: number;
  title: string;
  chart_type: ChartType;
  time_range: string; // "15m" | "1h" | "24h"...
  created_at: string;
  metrics: MetricDefinition[];
}

export interface CreateChartDTO {
  dashboard_id: number;
  title: string;
  chart_type?: ChartType; // backend: domyślnie "line"
  time_range?: string;    // backend: domyślnie "1h"
  metric_ids: number[];
}

export interface UpdateChartDTO {
  title?: string;
  chart_type?: ChartType;
  time_range?: string;
  metric_ids?: number[];
}