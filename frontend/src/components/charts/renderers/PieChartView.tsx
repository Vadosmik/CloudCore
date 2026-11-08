import ReactECharts from "echarts-for-react";
import type { DefaultLabelFormatterCallbackParams, EChartsOption } from "echarts";
import type { Chart } from "../../../types/charts";
import type { MetricDataPoint } from "../../../types/metrics";
import {
  CHART_COLORS,
  chartTokens,
  formatMetric,
  legendStyle,
  tooltipStyle,
} from "../chartTheme";

interface PieItem {
  name: string;
  value: number;
  unit: string;
}

export default function PieChartView({
  chart,
  series = [],
}: {
  chart: Chart;
  series?: MetricDataPoint[];
}) {
  const t = chartTokens();

  // backend zwraca punkty rosnąco po czasie -> ostatni = najnowszy
  const pieData: PieItem[] = chart.metrics.flatMap((metric) => {
    const latest = series.filter((point) => point.metric_definition_id === metric.id).at(-1);

    return latest ? [{ name: metric.name, value: latest.value, unit: metric.unit }] : [];
  });
  const hasData = pieData.length > 0;

  const formatItem = (params: DefaultLabelFormatterCallbackParams) => {
    const item = params.data as PieItem;
    return formatMetric(item.value, item.unit);
  };

  const option: EChartsOption = {
    color: CHART_COLORS,
    textStyle: { fontFamily: t.font },
    title: {
      show: !hasData,
      text: "No data",
      left: "center",
      top: "middle",
      textStyle: { fontSize: 14, fontWeight: "normal", color: t.subtle },
    },
    tooltip: {
      trigger: "item",
      ...tooltipStyle(t),
      formatter: (params) => {
        const p = params as DefaultLabelFormatterCallbackParams;
        return `${p.marker} ${p.name}<br/><b>${formatItem(p)}</b> (${p.percent}%)`;
      },
    },
    // podpisy w legendzie pod wykresem zamiast etykiet wokół pierścienia
    legend: { show: hasData, bottom: 0, type: "scroll", ...legendStyle(t) },
    series: [
      {
        type: "pie",
        radius: ["58%", "78%"],
        center: ["50%", "45%"],
        padAngle: 2,
        itemStyle: { borderRadius: 6 },
        label: { show: false },
        labelLine: { show: false },
        emphasis: { scale: true, scaleSize: 4 },
        // pusty szary pierścień, gdy brak danych
        emptyCircleStyle: { color: t.divider },
        data: pieData,
      },
    ],
  };

  return <ReactECharts option={option} notMerge style={{ height: "100%" }} />;
}
