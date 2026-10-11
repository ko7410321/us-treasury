import { HISTORY, type YieldPoint } from "@/lib/history";
import { mergeHistory, type CurvePayload } from "@/lib/curve";

const TTL_MS = 6 * 60 * 60 * 1000;
const FRED = [
  ["y2", "DGS2"],
  ["y5", "DGS5"],
  ["y7", "DGS7"],
  ["y10", "DGS10"],
  ["y30", "DGS30"],
] as const;

let cache: { at: number; payload: CurvePayload } | null = null;

export async function loadCurve(): Promise<CurvePayload> {
  if (cache && Date.now() - cache.at < TTL_MS) return cache.payload;
  const [fred, treasury] = await Promise.all([fetchFred("2024-01-01"), fetchTreasuryLatest()]);
  if (fred.length === 0 && !treasury) throw new Error("yield feeds unavailable");
  let history = mergeHistory(HISTORY, fred);
  let source: CurvePayload["source"] = "FRED";
  const fredLast = fred.length ? fred[fred.length - 1].d : "";
  if (treasury && treasury.d > (history[history.length - 1]?.d ?? "") && treasury.d > fredLast) {
    history = mergeHistory(history, [treasury]);
    source = "Treasury";
  }
  const payload: CurvePayload = {
    history,
    spot: history[history.length - 1],
    source,
    fetchedAt: Date.now(),
  };
  cache = { at: payload.fetchedAt, payload };
  return payload;
}

async function fetchFred(from: string): Promise<YieldPoint[]> {
  try {
    const maps = await Promise.all(FRED.map(async ([key, id]) => [key, await fredSeries(id, from)] as const));
    const dates = new Set<string>();
    for (const [, map] of maps) for (const date of map.keys()) dates.add(date);
    const rows: YieldPoint[] = [];
    for (const date of [...dates].sort()) {
      const point = { d: date, y2: 0, y5: 0, y7: 0, y10: 0, y30: 0 };
      let complete = true;
      for (const [key, map] of maps) {
        const value = map.get(date);
        if (value == null) {
          complete = false;
          break;
        }
        point[key] = value;
      }
      if (complete) rows.push(point);
    }
    return rows;
  } catch (error) {
    console.error("FRED yield fetch failed", error);
    return [];
  }
}

async function fredSeries(id: string, from: string): Promise<Map<string, number>> {
  const url = `https://fred.stlouisfed.org/graph/fredgraph.csv?id=${id}&cosd=${from}`;
  const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
  if (!res.ok) throw new Error(`FRED ${id} ${res.status}`);
  const map = new Map<string, number>();
  for (const line of (await res.text()).trim().split(/\n/).slice(1)) {
    const [date, raw] = line.split(",");
    if (!date || !raw || raw === ".") continue;
    const value = Number(raw);
    if (Number.isFinite(value)) map.set(date, value);
  }
  return map;
}

async function fetchTreasuryLatest(): Promise<YieldPoint | null> {
  try {
    const year = new Date().getUTCFullYear();
    const url = `https://home.treasury.gov/resource-center/data-chart-center/interest-rates/pages/xml?data=daily_treasury_yield_curve&field_tdr_date_value=${year}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) throw new Error(`Treasury ${res.status}`);
    const xml = await res.text();
    let latest: YieldPoint | null = null;
    for (const chunk of xml.split("<m:properties>").slice(1)) {
      const date = chunk.match(/<d:NEW_DATE[^>]*>(\d{4}-\d{2}-\d{2})/)?.[1];
      const read = (tag: string) => Number(chunk.match(new RegExp(`<d:${tag}[^>]*>([-0-9.]+)`))?.[1]);
      const y2 = read("BC_2YEAR");
      const y5 = read("BC_5YEAR");
      const y7 = read("BC_7YEAR");
      const y10 = read("BC_10YEAR");
      const y30 = read("BC_30YEAR");
      if (!date || [y2, y5, y7, y10, y30].some((n) => !Number.isFinite(n))) continue;
      if (!latest || date > latest.d) latest = { d: date, y2, y5, y7, y10, y30 };
    }
    return latest;
  } catch (error) {
    console.error("Treasury yield fetch failed", error);
    return null;
  }
}
