import ReactECharts from "echarts-for-react";
import type { EChartsOption, GaugeSeriesOption } from "echarts";
import type { Chart } from "../../../types/charts";
import type { MetricDataPoint } from "../../../types/metrics";
import {
  chartTokens,
  formatMetric,
  formatTime,
  seriesColor,
  tooltipStyle,
} from "../chartTheme";

export default function GaugeChartView({
  chart,
  series = [],
}: {
  chart: Chart;
  series?: MetricDataPoint[];
}) {
  const t = chartTokens();
  const metrics = chart.metrics;
  const count = metrics.length;

  const option: EChartsOption = {
    textStyle: { fontFamily: t.font },
    tooltip: { trigger: "item", ...tooltipStyle(t) },
    series: metrics.map((metric, index): GaugeSeriesOption => {
      // backend zwraca punkty rosnąco po czasie -> ostatni = najnowszy
      const latest = series.filter((point) => point.metric_definition_id === metric.id).at(-1);
      const hasData = latest !== undefined;
      const value = latest?.value ?? 0;

      const isPercent = metric.unit === "Percent";
      const max = isPercent ? 100 : Math.ceil(value * 1.5) || 1;
      const color = seriesColor(index);

      // przy kilku metrykach pierścienie są mniejsze, więc i tekst
      const scale = count > 1 ? Math.max(0.6, 1 / Math.sqrt(count)) : 1;

      return {
        name: metric.name,
        type: "gauge",
        center: [`${((index + 0.5) / count) * 100}%`, "55%"],
        radius: count > 1 ? `${Math.min(75, 90 / count)}%` : "85%",
        startAngle: 220,
        endAngle: -40,
        min: 0,
        max,
        // pierścień: tło + postęp z zaokrąglonymi końcami, bez wskazówki i podziałki
        pointer: { show: false },
        anchor: { show: false },
        axisTick: { show: false },
        splitLine: { show: false },
        axisLabel: { show: false },
        axisLine: { roundCap: true, lineStyle: { width: 12 * scale, color: [[1, t.divider]] } },
        progress: { show: hasData, roundCap: true, width: 12 * scale, itemStyle: { color } },
        title: {
          offsetCenter: [0, "32%"],
          fontSize: 11 * scale,
          color: t.subtle,
          lineHeight: 14 * scale,
        },
        detail: {
          offsetCenter: [0, "-4%"],
          fontSize: (hasData ? 26 : 14) * scale,
          fontWeight: 600,
          color: hasData ? t.text : t.subtle,
          formatter: (v) => (hasData ? formatMetric(Number(v), metric.unit) : "No data"),
        },
        data: [
          {
            value,
            name: hasData ? `${metric.name}\n${formatTime(latest.timestamp)}` : metric.name,
          },
        ],
      };
    }),
  };

  return <ReactECharts option={option} notMerge style={{ height: "100%" }} />;
}
