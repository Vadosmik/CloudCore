import { FiSettings } from "react-icons/fi";
import type { Chart } from "../../types/charts";
import type { MetricDataPoint } from "../../types/metrics";
import IconButton from "../ui/button/IconButton";
import "./ChartCard.css";

import { TIME_RANGE_LABELS } from "./chartTheme";
import { chartRegistry } from "./registry";
import { useHashModal } from "../modal/useHashModal";

export default function ChartCard({ chart, series }: { chart: Chart; series: MetricDataPoint[] }) {
  const View = chartRegistry[chart.chart_type];
  const range = TIME_RANGE_LABELS[chart.time_range];
  const { open } = useHashModal();

  return (
    <div className="chart-card">
      <div className="chart-card__header">
        <div className="chart-card__header-top">
          <span className="chart-card__title">{chart.title}</span>
          <div className="chart-card__actions">
            <IconButton
              title="Chart setting"
              icon={<FiSettings />}
              onClick={() => open("edit-chart", { chart_id: String(chart.id) })}
            />
          </div>
        </div>
        <span className="chart-card__subtitle">
          {[range, chart.metrics.map((m) => m.name).join(", ")].filter(Boolean).join(" · ")}
        </span>
      </div>
      <div className="chart-card__body">
        <View chart={chart} series={series} />
      </div>
    </div>
  );
}
