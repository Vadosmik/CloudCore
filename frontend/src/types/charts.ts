import type { MetricDefinition } from "./metrics";

export type ChartType = "line" | "bar" | "pie" | "gauge";
export type TimeRange = "15m" | "1h" | "24h" | "7d" | "30d";

export interface Chart {
  id: number;
  dashboard_id: number;

  pos_x: number;
  pos_y: number;
  width: number;
  height: number;

  title: string;
  chart_type: ChartType;
  time_range: TimeRange;
  created_at: string;
  metrics: MetricDefinition[];
}

export interface ChartLayoutItem {
  chart_id: number;
  pos_x: number;
  pos_y: number;
  width: number;
  height: number;
}

export interface CreateChartDTO {
  dashboard_id: number;
  title: string;
  chart_type?: ChartType;
  time_range?: TimeRange;
  metric_ids: number[];
}

export interface UpdateChartDTO {
  title?: string;
  chart_type?: ChartType;
  time_range?: TimeRange;
  metric_ids?: number[];
}
