import { bondPrice, addMonths, yearsBetween } from "@/lib/bonds";
import { HISTORY, type YieldPoint } from "@/lib/history";

export const TENORS = [2, 5, 7, 10, 30] as const;
export type Tenor = (typeof TENORS)[number];

export const SPOT: YieldPoint = HISTORY[HISTORY.length - 1];
export const AS_OF = SPOT.d;
export const PEG = 7.8;

export type CurveBook = { history: YieldPoint[]; spot: YieldPoint };

export function bookOf(book?: CurveBook): { history: YieldPoint[]; spot: YieldPoint; asOf: string } {
  const history = book?.history ?? HISTORY;
  const spot = book?.spot ?? SPOT;
  return { history, spot, asOf: spot.d };
}

export function yieldOf(point: YieldPoint, tenor: Tenor): number {
  switch (tenor) {
    case 2:
      return point.y2;
    case 5:
      return point.y5;
    case 7:
      return point.y7;
    case 10:
      return point.y10;
    case 30:
      return point.y30;
  }
}

const KNOTS: Tenor[] = [2, 5, 7, 10, 30];

/** Linear interpolation on the constant-maturity curve. Percent. */
export function curveYield(point: YieldPoint, years: number): number {
  const ys = KNOTS.map((tenor) => yieldOf(point, tenor));
  if (years <= KNOTS[0]) return ys[0];
  if (years >= 30) return ys[ys.length - 1];
  for (let i = 0; i < KNOTS.length - 1; i++) {
    const left = KNOTS[i];
    const right = KNOTS[i + 1];
    if (years <= right) {
      const t = (years - left) / (right - left);
      return ys[i] + t * (ys[i + 1] - ys[i]);
    }
  }
  return ys[ys.length - 1];
}

export type ScenarioId = "ease" | "firm" | "slump";

type Knot = { m: number; d: Record<Tenor, number> };

export type Scenario = {
  id: ScenarioId;
  name: string;
  prob: number;
  blurb: string;
  knots: Knot[];
};

const MONTHS = [0, 6, 12, 18, 24, 36] as const;

function knots(deltas: Record<Tenor, number[]>): Knot[] {
  return MONTHS.map((m, i) => ({
    m,
    d: {
      2: deltas[2][i],
      5: deltas[5][i],
      7: deltas[7][i],
      10: deltas[10][i],
      30: deltas[30][i],
    },
  }));
}

export const SCENARIOS: Scenario[] = [
  {
    id: "ease",
    name: "溫和回落",
    prob: 0.45,
    blurb: "通脹逐步回落，聯邦基金利率由約 3.9% 慢慢下調。長債跌幅小於短債，期限溢價仍然存在。",
    knots: knots({
      2: [0, -0.35, -0.7, -0.9, -1.05, -1.1],
      5: [0, -0.29, -0.58, -0.74, -0.85, -0.9],
      7: [0, -0.25, -0.5, -0.65, -0.75, -0.82],
      10: [0, -0.22, -0.47, -0.62, -0.72, -0.78],
      30: [0, -0.15, -0.35, -0.48, -0.55, -0.6],
    }),
  },
  {
    id: "firm",
    name: "高息延續",
    prob: 0.3,
    blurb: "通脹黏性較高，國債供應推升期限溢價。孳息再上一個台階，其後才輕微回落。這是帳面價格受損最大的路徑。",
    knots: knots({
      2: [0, 0.35, 0.65, 0.55, 0.4, 0.3],
      5: [0, 0.45, 0.82, 0.78, 0.68, 0.58],
      7: [0, 0.48, 0.88, 0.84, 0.74, 0.64],
      10: [0, 0.5, 0.95, 0.9, 0.8, 0.7],
      30: [0, 0.42, 0.85, 0.82, 0.74, 0.65],
    }),
  },
  {
    id: "slump",
    name: "增長失速",
    prob: 0.25,
    blurb: "增長明顯轉弱，減息加快。兩年期跌幅最大，三十年期受期限溢價支撐，跌幅小得多。",
    knots: knots({
      2: [0, -1.2, -1.9, -2.1, -1.95, -1.7],
      5: [0, -1, -1.6, -1.7, -1.55, -1.4],
      7: [0, -0.85, -1.4, -1.48, -1.35, -1.2],
      10: [0, -0.78, -1.28, -1.35, -1.18, -1.05],
      30: [0, -0.55, -0.92, -0.98, -0.88, -0.75],
    }),
  },
];

export const HORIZONS = [
  { m: 6, label: "6個月" },
  { m: 12, label: "1年" },
  { m: 24, label: "2年" },
  { m: 36, label: "3年" },
] as const;

function deltaAt(scenario: Scenario, tenor: Tenor, month: number): number {
  const knotsOf = scenario.knots;
  if (month <= 0) return 0;
  const last = knotsOf[knotsOf.length - 1];
  if (month >= last.m) return last.d[tenor];
  for (let i = 0; i < knotsOf.length - 1; i++) {
    const a = knotsOf[i];
    const b = knotsOf[i + 1];
    if (month <= b.m) {
      const t = (month - a.m) / (b.m - a.m);
      return a.d[tenor] + t * (b.d[tenor] - a.d[tenor]);
    }
  }
  return last.d[tenor];
}

/** Scenario yield in percent. Anchored on today's constant-maturity print. */
export function scenarioYield(id: ScenarioId, tenor: Tenor, month: number, book?: CurveBook): number {
  const { spot } = bookOf(book);
  const scenario = SCENARIOS.find((item) => item.id === id);
  if (!scenario) return yieldOf(spot, tenor);
  const y = yieldOf(spot, tenor) + deltaAt(scenario, tenor, month);
  return Math.round(y * 100) / 100;
}

export type OutlookRow = {
  label: string;
  m: number;
  ease: number;
  firm: number;
  slump: number;
};

export function outlookRows(tenor: Tenor, book?: CurveBook): OutlookRow[] {
  const marks = [
    { m: 0, label: "而家" },
    { m: 6, label: "6個月" },
    { m: 12, label: "1年" },
    { m: 18, label: "1.5年" },
    { m: 24, label: "2年" },
    { m: 36, label: "3年" },
  ];
  return marks.map((mark) => ({
    label: mark.label,
    m: mark.m,
    ease: scenarioYield("ease", tenor, mark.m, book),
    firm: scenarioYield("firm", tenor, mark.m, book),
    slump: scenarioYield("slump", tenor, mark.m, book),
  }));
}

export function weightedYield(
  tenor: Tenor,
  month: number,
  book?: CurveBook,
  weights?: Partial<Record<ScenarioId, number>>,
): number {
  const parts = SCENARIOS.map((scenario) => ({
    id: scenario.id,
    w: weights?.[scenario.id] ?? scenario.prob,
  }));
  const sum = parts.reduce((total, part) => total + part.w, 0) || 1;
  return parts.reduce((total, part) => total + (part.w / sum) * scenarioYield(part.id, tenor, month, book), 0);
}

/** Illustrative yield paths. Not a forecast. Yields are in percent. */
export function yieldFan(startPct: number, tenor: number, count: number, seed: number): number[][] {
  const marks = [0, 6, 12, 18, 24, 36];
  const vol = 0.55 * Math.sqrt(10 / Math.max(tenor, 2));
  let state = (seed % 2147483646) + 1;
  const rand = () => {
    state = (state * 16807) % 2147483647;
    return state / 2147483647;
  };
  const normal = () => {
    const u = Math.max(1e-9, rand());
    const v = rand();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  };
  return Array.from({ length: count }, () => {
    let y = startPct;
    return marks.map((month, index) => {
      if (index === 0) return Math.round(y * 100) / 100;
      const dt = (month - marks[index - 1]) / 12;
      y = Math.min(12, Math.max(0.05, y + normal() * vol * Math.sqrt(dt)));
      return Math.round(y * 100) / 100;
    });
  });
}

export type Vintage = {
  year: number;
  bought: string;
  maturity: string;
  entry: number;
  matured: boolean;
  remaining: number;
  price: number;
  semisPaid: number;
  semisTotal: number;
  couponsPer100: number;
  ytmNow: number;
  wealthPer100: number;
};

export function yearEndPoints(book?: CurveBook): YieldPoint[] {
  const { history } = bookOf(book);
  const map = new Map<string, YieldPoint>();
  for (const point of history) {
    const year = point.d.slice(0, 4);
    if (year >= "2015" && year <= "2025") map.set(year, point);
  }
  return [...map.keys()]
    .sort()
    .map((year) => map.get(year)!);
}

export function analyzeVintage(tenor: Tenor, boughtPoint: YieldPoint, book?: CurveBook): Vintage {
  const { spot, asOf } = bookOf(book);
  const entry = yieldOf(boughtPoint, tenor);
  const bought = boughtPoint.d;
  const maturity = addMonths(bought, tenor * 12);
  const semisTotal = tenor * 2;
  const matured = asOf >= maturity;
  let semisPaid = 0;
  if (matured) {
    semisPaid = semisTotal;
  } else {
    for (let k = 1; k <= semisTotal; k++) {
      if (addMonths(bought, k * 6) <= asOf) semisPaid += 1;
      else break;
    }
  }
  const couponsPer100 = semisPaid * (entry / 2);
  if (matured) {
    return {
      year: Number(bought.slice(0, 4)),
      bought,
      maturity,
      entry,
      matured: true,
      remaining: 0,
      price: 100,
      semisPaid,
      semisTotal,
      couponsPer100,
      ytmNow: entry,
      wealthPer100: 100 + couponsPer100,
    };
  }
  const remaining = Math.max(0, yearsBetween(asOf, maturity));
  const ytmNow = curveYield(spot, remaining);
  const price = bondPrice(entry / 100, ytmNow / 100, remaining);
  return {
    year: Number(bought.slice(0, 4)),
    bought,
    maturity,
    entry,
    matured: false,
    remaining,
    price,
    semisPaid,
    semisTotal,
    couponsPer100,
    ytmNow,
    wealthPer100: price + couponsPer100,
  };
}

export type PathPoint = { d: string; price: number };

export function vintagePricePath(tenor: Tenor, boughtPoint: YieldPoint, book?: CurveBook): PathPoint[] {
  const { history, spot, asOf } = bookOf(book);
  const entry = yieldOf(boughtPoint, tenor) / 100;
  const maturity = addMonths(boughtPoint.d, tenor * 12);
  const out: PathPoint[] = [{ d: boughtPoint.d, price: 100 }];
  for (const row of history) {
    if (row.d <= boughtPoint.d) continue;
    if (row.d > asOf || row.d >= maturity) break;
    const rem = yearsBetween(row.d, maturity);
    const ytm = curveYield(row, rem) / 100;
    out.push({ d: row.d, price: bondPrice(entry, ytm, rem) });
  }
  if (asOf >= maturity) {
    out.push({ d: maturity, price: 100 });
  } else if (out[out.length - 1]?.d !== asOf) {
    const rem = yearsBetween(asOf, maturity);
    out.push({ d: asOf, price: bondPrice(entry, curveYield(spot, rem) / 100, rem) });
  }
  return out;
}

export function richerMonths(tenor: Tenor, book?: CurveBook): { higher: number; total: number; max: number; maxDate: string } {
  const { history, spot, asOf } = bookOf(book);
  const now = yieldOf(spot, tenor);
  let higher = 0;
  let max = now;
  let maxDate = asOf;
  const slice = history.filter((point) => point.d >= "2015-01-01" && point.d < asOf);
  for (const point of slice) {
    const y = yieldOf(point, tenor);
    if (y > now + 0.005) higher += 1;
    if (y > max) {
      max = y;
      maxDate = point.d;
    }
  }
  return { higher, total: slice.length, max, maxDate };
}

/** Mark-to-market of a bond bought today, after `months`, if the scenario yield prints. */
export function forwardPrice(
  tenor: Tenor,
  id: ScenarioId,
  months: number,
  book?: CurveBook,
): { price: number; matured: boolean; ytm: number } {
  const { spot } = bookOf(book);
  const yearsGone = months / 12;
  if (yearsGone >= tenor - 1e-9) {
    return { price: 100, matured: true, ytm: scenarioYield(id, tenor, months, book) };
  }
  const ytm = scenarioYield(id, tenor, months, book);
  const price = bondPrice(yieldOf(spot, tenor) / 100, ytm / 100, tenor - yearsGone);
  return { price, matured: false, ytm };
}
