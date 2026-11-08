import type { Chart } from "../../../types/charts";

export default function UnsupportedChartView({ chart }: { chart: Chart }) {
  return <p>Chart type "{chart.chart_type}" is not supported yet.</p>;
}