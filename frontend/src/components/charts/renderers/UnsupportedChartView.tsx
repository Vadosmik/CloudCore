import type { Chart } from "../../../types/charts";

export default function UnsupportedChartView({ chart }: { chart: Chart }) {
  return <p>Typ "{chart.chart_type}" nie jest jeszcze obsługiwany.</p>;
}