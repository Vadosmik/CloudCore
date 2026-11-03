import type { ComponentType } from "react";
import type { Chart, ChartType } from "../../types/charts";
import type { MetricDataPoint } from "../../types/metrics";

import LineChartView from "./renderers/LineChartView";
import BarChartView from "./renderers/BarChartView";
import GaugeChartView from "./renderers/GaugeChartView";
import PieChartView from "./renderers/PieChartView";
// import UnsupportedChartView from "./renderers/UnsupportedChartView";

export const chartRegistry: Record<
  ChartType,
  ComponentType<{ chart: Chart; series: MetricDataPoint[] }>
> = {
  line: LineChartView,
  bar: BarChartView,
  pie: PieChartView,
  gauge: GaugeChartView,
};
