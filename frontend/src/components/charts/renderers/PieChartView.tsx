import ReactECharts from "echarts-for-react";
import type { DefaultLabelFormatterCallbackParams, EChartsOption } from "echarts";
import type { Chart } from "../../../types/charts";
import type { MetricDataPoint } from "../../../types/metrics";
import { CHART_COLORS, formatValue, unitSymbol } from "../chartTheme";

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
  // backend zwraca punkty rosnąco po czasie -> ostatni = najnowszy
  const pieData: PieItem[] = chart.metrics.flatMap((metric) => {
    const latest = series
      .filter((point) => point.metric_definition_id === metric.id)
      .at(-1);

    return latest ? [{ name: metric.name, value: latest.value, unit: metric.unit }] : [];
  });

  const formatItem = (params: DefaultLabelFormatterCallbackParams) => {
    const item = params.data as PieItem;
    return `${formatValue(item.value)}${unitSymbol(item.unit)}`;
  };

  const option: EChartsOption = {
    color: CHART_COLORS,
    title: {
      show: pieData.length === 0,
      text: "No data",
      left: "center",
      top: "middle",
      textStyle: { fontSize: 14, fontWeight: "normal", color: "#6b7280" },
    },
    tooltip: {
      trigger: "item",
      formatter: (params) => {
        const p = params as DefaultLabelFormatterCallbackParams;
        return `${p.name}<br/><b>${formatItem(p)}</b> (${p.percent}%)`;
      },
    },
    legend: {
      show: pieData.length > 1,
      bottom: 0,
      type: "scroll",
    },
    series: [
      {
        type: "pie",
        radius: ["45%", "70%"],
        center: ["50%", "45%"],
        avoidLabelOverlap: true,
        itemStyle: {
          borderRadius: 6,
          borderColor: "#fff",
          borderWidth: 2,
        },
        label: {
          show: true,
          formatter: (params) => `${params.name}: ${formatItem(params)}`,
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 14,
            fontWeight: "bold",
          },
        },
        data: pieData,
      },
    ],
  };

  return <ReactECharts option={option} notMerge style={{ height: "100%" }} />;
}
