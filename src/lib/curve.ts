import type { YieldPoint } from "@/lib/history";

export type CurveSource = "FRED" | "Treasury" | "bundled";

export type CurvePayload = {
  history: YieldPoint[];
  spot: YieldPoint;
  source: CurveSource;
  fetchedAt: number;
};

/** Keep one print per month: the latest date we have. Order is chronological. */
export function mergeHistory(base: YieldPoint[], extra: YieldPoint[]): YieldPoint[] {
  const byDate = new Map<string, YieldPoint>();
  for (const point of base) byDate.set(point.d, point);
  for (const point of extra) byDate.set(point.d, roundPoint(point));
  const months = new Map<string, YieldPoint>();
  for (const point of [...byDate.values()].sort((a, b) => a.d.localeCompare(b.d))) {
    months.set(point.d.slice(0, 7), point);
  }
  return [...months.values()];
}

function roundPoint(point: YieldPoint): YieldPoint {
  const round = (n: number) => Math.round(n * 100) / 100;
  return {
    d: point.d,
    y2: round(point.y2),
    y5: round(point.y5),
    y7: round(point.y7),
    y10: round(point.y10),
    y30: round(point.y30),
  };
}
