const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});


/** "2026-10-18T07:44:26.804469Z" -> "18 paź 2026, 09:44" */
export function formatDate(iso: string): string {
  return dateFormatter.format(new Date(iso));
}

const relativeFormatter = new Intl.RelativeTimeFormat("en-GB", { numeric: "auto" });

const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ["year", 31_536_000],
  ["month", 2_592_000],
  ["week", 604_800],
  ["day", 86_400],
  ["hour", 3_600],
  ["minute", 60],
  ["second", 1],
];

/** "2026-10-18T07:44:26Z" -> "wczoraj", "3 godziny temu", "2 tygodnie temu" */
export function formatRelative(iso: string): string {
  const diffSeconds = (new Date(iso).getTime() - Date.now()) / 1000;
  for (const [unit, seconds] of UNITS) {
    if (Math.abs(diffSeconds) >= seconds || unit === "second") {
      return relativeFormatter.format(Math.round(diffSeconds / seconds), unit);
    }
  }
  return "";
}