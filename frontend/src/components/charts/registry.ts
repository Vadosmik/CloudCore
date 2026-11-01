import type { ComponentType } from "react";
import type { Chart, ChartType } from "../../types/charts";
import type { MetricDataPoint } from "../../types/metrics";

import LineChartView from "./renderers/LineChartView";
import UnsupportedChartView from "./renderers/UnsupportedChartView";

export const chartRegistry: Record<ChartType, ComponentType<{ chart: Chart, series: MetricDataPoint[] }>> = {
  line: LineChartView,
  bar: UnsupportedChartView,
  pie: UnsupportedChartView,
  gauge: UnsupportedChartView,
};