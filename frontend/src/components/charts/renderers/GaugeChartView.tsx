import ReactECharts from "echarts-for-react";
import type { EChartsOption, GaugeSeriesOption } from "echarts";
import type { Chart } from "../../../types/charts";
import type { MetricDataPoint } from "../../../types/metrics";
import { CHART_COLORS, formatMetric } from "../chartTheme";

export default function GaugeChartView({
  chart,
  series = [],
}: {
  chart: Chart;
  series?: MetricDataPoint[];
}) {
  const metrics = chart.metrics;
  const count = metrics.length;

  const option: EChartsOption = {
    color: CHART_COLORS,
    tooltip: { trigger: "item" },
    series: metrics.map((metric, index): GaugeSeriesOption => {
      // backend zwraca punkty rosnąco po czasie -> ostatni = najnowszy
      const latest = series.filter((point) => point.metric_definition_id === metric.id).at(-1);
      const hasData = latest !== undefined;
      const value = latest?.value ?? 0;

      const isPercent = metric.unit === "Percent";
      const max = isPercent ? 100 : Math.ceil(value * 1.5) || 1;

      const time = latest
        ? new Date(latest.timestamp).toLocaleTimeString("pl-PL", {
            hour: "2-digit",
            minute: "2-digit",
          })
        : "";

      return {
        name: metric.name,
        type: "gauge",
        center: [`${((index + 0.5) / count) * 100}%`, "55%"],
        radius: count > 1 ? `${Math.min(75, 90 / count)}%` : "90%",
        min: 0,
        max,
        pointer: { show: hasData },
        progress: { show: hasData, width: 10 },
        axisLine: { lineStyle: { width: 10 } },
        axisLabel: {
          distance: 15,
          fontSize: 10,
          formatter: (v: number) => formatMetric(v, metric.unit),
        },
        title: { offsetCenter: [0, "75%"], fontSize: 12 },
        detail: {
          offsetCenter: [0, "40%"],
          fontSize: 16,
          formatter: (v) => (hasData ? formatMetric(Number(v), metric.unit) : "No data"),
        },
        data: [
          {
            value,
            name: hasData ? `${metric.name}\nas of ${time}` : metric.name,
          },
        ],
      };
    }),
  };

  return <ReactECharts option={option} notMerge style={{ height: "100%" }} />;
}
