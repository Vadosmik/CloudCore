import ReactECharts from "echarts-for-react";
import type { EChartsOption, BarSeriesOption } from "echarts";
import type { Chart } from "../../../types/charts";
import type { MetricDataPoint } from "../../../types/metrics";
import { CHART_COLORS, formatValue, unitSymbol } from "../chartTheme";

export default function BarChartView({
  chart,
  series = [],
}: {
  chart: Chart;
  series?: MetricDataPoint[];
}) {
  const metrics = chart.metrics;
  const multi = metrics.length > 1;

  const units = [...new Set(metrics.map((m) => m.unit))];
  const singleUnit = units.length === 1 ? units[0] : null;
  const isPercent = singleUnit === "Percent";

  const option: EChartsOption = {
    color: CHART_COLORS,
    grid: {
      left: 8,
      right: 16,
      top: multi ? 40 : 16,
      bottom: 50,
      containLabel: true,
    },
    legend: { show: multi, top: 0, type: "scroll" },
    tooltip: { trigger: "axis" },
    xAxis: { type: "time", axisLabel: { hideOverlap: true } },
    yAxis: {
      type: "value",
      min: isPercent ? 0 : undefined,
      max: isPercent
        ? (value) => Math.min(100, Math.max(10, Math.ceil(value.max * 1.1)))
        : undefined,
      name: !isPercent && singleUnit ? singleUnit : undefined,
      axisLabel: { formatter: isPercent ? "{value}%" : "{value}" },
      splitLine: { lineStyle: { type: [8, 6], color: "#e5e7eb" } },
    },
    dataZoom: [
      { type: "inside", filterMode: "none", zoomOnMouseWheel: "ctrl" },
    ],
    series: metrics.map(
      (metric): BarSeriesOption => ({
        name: metric.name,
        type: "bar",
        barMaxWidth: 16,
        emphasis: { focus: "series" },
        tooltip: {
          valueFormatter: (v) =>
            `${formatValue(Number(v))}${unitSymbol(metric.unit)}`,
        },
        data: series
          .filter((point) => point.metric_definition_id === metric.id)
          .map((point) => [point.timestamp, point.value]),
      }),
    ),
  };

  return <ReactECharts option={option} notMerge style={{ height: "100%" }} />;
}
