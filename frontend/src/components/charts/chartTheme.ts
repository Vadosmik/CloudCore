import type { TimeRange } from "../../types/charts";

// Paleta w stylu kolorów systemowych Apple (żywe, ale nie krzykliwe)
export const CHART_COLORS = [
  "#e1b034",
  "#64d2ff",
  "#ff375f",
  "#0a84ff",
  "#30d158",
  "#bf5af2",
  "#ff9f0a",
];

export function seriesColor(index: number): string {
  return CHART_COLORS[index % CHART_COLORS.length];
}

export function fade(hex: string, alpha: number): string {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
}

export function areaGradient(hex: string, alpha = 0.25) {
  return {
    type: "linear" as const,
    x: 0,
    y: 0,
    x2: 0,
    y2: 1,
    colorStops: [
      { offset: 0, color: fade(hex, alpha) },
      { offset: 1, color: fade(hex, 0) },
    ],
  };
}

function cssVar(name: string, fallback: string): string {
  if (typeof window === "undefined") return fallback;
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return value || fallback;
}

export function chartTokens() {
  return {
    text: cssVar("--color-text", "#1e1d1d"),
    subtle: cssVar("--color-text-subtle", "rgba(30, 29, 29, 0.5)"),
    divider: cssVar("--color-divider", "rgba(30, 29, 29, 0.12)"),
    surface: cssVar("--color-surface", "#ffffff"),
    font: cssVar("--font-body", "system-ui, sans-serif"),
  };
}

type Tokens = ReturnType<typeof chartTokens>;

// === Wspólny minimalistyczny styl ===
export function tooltipStyle(t: Tokens) {
  return {
    backgroundColor: t.surface,
    borderWidth: 0,
    padding: [8, 12] as [number, number],
    textStyle: { color: t.text, fontSize: 12, fontFamily: t.font },
    extraCssText: "border-radius: 12px; box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);",
  };
}

export function legendStyle(t: Tokens) {
  return {
    icon: "circle",
    itemWidth: 8,
    itemHeight: 8,
    itemGap: 16,
    textStyle: { color: t.subtle, fontSize: 11, fontFamily: t.font },
  };
}

export function axisStyle(t: Tokens) {
  return {
    axisLine: { show: false },
    axisTick: { show: false },
    axisLabel: { color: t.subtle, fontSize: 11, fontFamily: t.font },
  };
}

const hourFormatter = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit" });
const dayFormatter = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short" });

/** 15m / 1h / 24h -> "14:30", 7d / 30d -> "4 Nov" */
export function timeAxisFormatter(range: TimeRange) {
  const short = range === "15m" || range === "1h" || range === "24h";
  return (value: number) => (short ? hourFormatter : dayFormatter).format(new Date(value));
}

export function formatTime(iso: string): string {
  return hourFormatter.format(new Date(iso));
}

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
