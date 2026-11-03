import type { TimeRange } from "../../types/charts";

export const CHART_COLORS = [
  "#e1b034",
  "#6ed0e0",
  "#ec4899",
  "#0072b2",
  "#59a14f",
  "#8b5cf6",
  "#f97316",
];

export const TIME_RANGE_LABELS: Record<TimeRange, string> = {
  "15m": "Last 15 min",
  "1h": "Last hour",
  "24h": "Last 24 hours",
  "7d": "Last 7 days",
  "30d": "Last 30 days",
};

export const TIME_RANGE_MS: Record<TimeRange, number> = {
  "15m": 15 * 60_000,
  "1h": 60 * 60_000,
  "24h": 24 * 60 * 60_000,
  "7d": 7 * 24 * 60 * 60_000,
  "30d": 30 * 24 * 60 * 60_000,
};

export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.min(Math.max(Math.floor(Math.log(bytes) / Math.log(1024)), 0), sizes.length - 1);
  return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
}

export function formatMetric(value: number, unit: string): string {
  if (unit === "Bytes") return formatBytes(value);
  return `${formatValue(value)}${unitSymbol(unit)}`;
}

export function formatValue(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(3);
}

export function unitSymbol(unit: string): string {
  switch (unit) {
    case "Percent":
      return "%";
    case "Bytes":
      return " B";
    default:
      return unit ? ` ${unit}` : "";
  }
}
