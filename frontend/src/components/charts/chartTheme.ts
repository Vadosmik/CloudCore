export const CHART_COLORS = ["#e1b034", "#6ed0e0", "#ec4899", "#0072b2", "#59a14f", "#8b5cf6"];

export const TIME_RANGE_LABELS: Record<string, string> = {
  "15m": "Last 15 min",
  "1h": "Last hour",
  "24h": "Last 24 hours",
};

export function unitSymbol(unit: string): string {
  switch (unit) {
    case "Percent": return "%";
    case "Bytes": return " B";
    default: return unit ? ` ${unit}` : "";
  }
}