import ReactECharts from "echarts-for-react";
import type { EChartsOption, LineSeriesOption } from "echarts";
import type { Chart } from "../../../types/charts";
import type { MetricDataPoint } from "../../../types/metrics";
import {
  areaGradient,
  axisStyle,
  chartTokens,
  formatBytes,
  formatMetric,
  legendStyle,
  seriesColor,
  TIME_RANGE_MS,
  timeAxisFormatter,
  tooltipStyle,
} from "../chartTheme";

export default function LineChartView({
  chart,
  series = [],
}: {
  chart: Chart;
  series?: MetricDataPoint[];
}) {
  const t = chartTokens();
  const metrics = chart.metrics;
  const multi = metrics.length > 1;

  const units = [...new Set(metrics.map((m) => m.unit))];
  const singleUnit = units.length === 1 ? units[0] : null;
  const isPercent = singleUnit === "Percent";
  const isBytes = singleUnit === "Bytes";
  const axis = axisStyle(t);

  const option: EChartsOption = {
    textStyle: { fontFamily: t.font },
    grid: {
      left: 4,
      right: 8,
      top: multi ? 36 : 12,
      bottom: 4,
      containLabel: true,
    },
    legend: { show: multi, top: 0, left: 0, type: "scroll", ...legendStyle(t) },
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "line", lineStyle: { color: t.divider, width: 1 } },
      ...tooltipStyle(t),
    },
    xAxis: {
      type: "time",
      min: Date.now() - TIME_RANGE_MS[chart.time_range],
      max: Date.now(),
      ...axis,
      axisLabel: {
        ...axis.axisLabel,
        hideOverlap: true,
        formatter: timeAxisFormatter(chart.time_range),
      },
      splitLine: { show: false },
    },
    yAxis: {
      type: "value",
      min: isPercent ? 0 : undefined,
      max: isPercent
        ? (value) => Math.min(100, Math.max(10, Math.ceil(value.max * 1.1)))
        : undefined,
      splitNumber: 4,
      name: !isPercent && !isBytes && singleUnit ? singleUnit : undefined,
      nameTextStyle: { color: t.subtle, fontSize: 11 },
      ...axis,
      axisLabel: {
        ...axis.axisLabel,
        formatter: isPercent ? "{value}%" : isBytes ? (v: number) => formatBytes(v) : "{value}",
      },
      splitLine: { lineStyle: { color: t.divider } },
    },
    dataZoom: [{ type: "inside", filterMode: "none", zoomOnMouseWheel: "ctrl" }],
    series: metrics.map((metric, index): LineSeriesOption => {
      const color = seriesColor(index);

      return {
        name: metric.name,
        type: "line",
        color,
        smooth: 0.3,
        showSymbol: false,
        symbolSize: 6,
        lineStyle: { width: 2 },
        areaStyle: { color: areaGradient(color, multi ? 0.12 : 0.25) },
        emphasis: { focus: "series" },
        tooltip: {
          valueFormatter: (v) => formatMetric(Number(v), metric.unit),
        },
        data: series
          .filter((point) => point.metric_definition_id === metric.id)
          .map((point) => [point.timestamp, point.value]),
      };
    }),
  };

  return <ReactECharts option={option} notMerge style={{ height: "100%" }} />;
}
