import ReactECharts from "echarts-for-react";
import type { EChartsOption, LineSeriesOption } from "echarts";
import type { Chart } from "../../../types/charts";
import type { MetricDataPoint } from "../../../types/metrics";
import { CHART_COLORS, formatBytes, formatMetric, TIME_RANGE_MS } from "../chartTheme";

export default function LineChartView({
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
  const isBytes = singleUnit === "Bytes";

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
    xAxis: {
      type: "time",
      min: Date.now() - TIME_RANGE_MS[chart.time_range],
      max: Date.now(),
      axisLabel: { hideOverlap: true },
    },
    yAxis: {
      type: "value",
      min: isPercent ? 0 : undefined,
      max: isPercent
        ? (value) => Math.min(100, Math.max(10, Math.ceil(value.max * 1.1)))
        : undefined,
      name: !isPercent && !isBytes && singleUnit ? singleUnit : undefined,
      axisLabel: {
        formatter: isPercent ? "{value}%" : isBytes ? (v: number) => formatBytes(v) : "{value}",
      },
      splitLine: { lineStyle: { type: [8, 6], color: "#e5e7eb" } },
    },
    dataZoom: [{ type: "inside", filterMode: "none", zoomOnMouseWheel: "ctrl" }],
    series: metrics.map(
      (metric): LineSeriesOption => ({
        name: metric.name,
        type: "line",
        showSymbol: false,
        lineStyle: { width: 2 },
        areaStyle: multi ? undefined : { opacity: 0.08 },
        emphasis: { focus: "series" },
        tooltip: {
          valueFormatter: (v) => formatMetric(Number(v), metric.unit),
        },
        data: series
          .filter((point) => point.metric_definition_id === metric.id)
          .map((point) => [point.timestamp, point.value]),
      }),
    ),
  };

  return <ReactECharts option={option} notMerge style={{ height: "100%" }} />;
}
