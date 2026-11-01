import type { Chart } from "../../types/charts";
import type { MetricDataPoint } from "../../types/metrics";
import "./ChartCard.css";

import { TIME_RANGE_LABELS } from "./chartTheme";
import { chartRegistry } from "./registry";


export default function ChartCard({ chart, series }: { chart: Chart, series: MetricDataPoint[] }) {
  const View = chartRegistry[chart.chart_type];
  const range = TIME_RANGE_LABELS[chart.time_range] ?? chart.time_range;

  return (
    <div className="chart-card">
      <div className="chart-card-header">
        <span className="section-title lg">{chart.title}</span>
        <span className="chart-card-subtitle">
          {[range, chart.metrics.map(m => m.name).join(", ")].filter(Boolean).join(" · ")}
        </span>
      </div>
      <View chart={chart} series={series} />
    </div>
  );
}