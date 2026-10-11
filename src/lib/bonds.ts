/** US Treasury teaching model: semi-annual, price per 100 face. Rates are decimals. */

const FREQ = 2;

export function periods(years: number): number {
  if (years <= 1e-8) return 0;
  return Math.max(1, Math.ceil(years * FREQ - 1e-9));
}

/** Clean price per 100 of face. At maturity, returns par. */
export function bondPrice(coupon: number, ytm: number, years: number): number {
  const n = periods(years);
  if (n === 0) return 100;
  const c = (coupon * 100) / FREQ;
  const r = ytm / FREQ;
  if (Math.abs(r) < 1e-12) return c * n + 100;
  let pv = 0;
  for (let k = 1; k <= n; k++) {
    pv += c / (1 + r) ** k;
  }
  pv += 100 / (1 + r) ** n;
  return pv;
}

/** Modified duration in years, at the given yield. */
export function modifiedDuration(coupon: number, ytm: number, years: number): number {
  const n = periods(years);
  if (n === 0) return 0;
  const c = (coupon * 100) / FREQ;
  const r = ytm / FREQ;
  const price = bondPrice(coupon, ytm, years);
  let weighted = 0;
  for (let k = 1; k <= n; k++) {
    const cf = k === n ? c + 100 : c;
    const pv = cf / (1 + r) ** k;
    weighted += (k / FREQ) * pv;
  }
  const macaulay = weighted / price;
  return macaulay / (1 + ytm / FREQ);
}

/** Bond convexity in years squared. Semi-annual compounding. */
export function convexity(coupon: number, ytm: number, years: number): number {
  const n = periods(years);
  if (n === 0) return 0;
  const price = bondPrice(coupon, ytm, years);
  const c = (coupon * 100) / FREQ;
  const r = ytm / FREQ;
  if (Math.abs(r) < 1e-12) return 0;
  let sum = 0;
  for (let k = 1; k <= n; k++) {
    const cf = k === n ? c + 100 : c;
    sum += (k * (k + 1) * cf) / (1 + r) ** (k + 2);
  }
  return sum / (price * FREQ * FREQ);
}

export function addMonths(iso: string, months: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1 + months, d));
  const mm = String(dt.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(dt.getUTCDate()).padStart(2, "0");
  return `${dt.getUTCFullYear()}-${mm}-${dd}`;
}

export function yearsBetween(earlier: string, later: string): number {
  const a = earlier.split("-").map(Number);
  const b = later.split("-").map(Number);
  const da = Date.UTC(a[0], a[1] - 1, a[2]);
  const db = Date.UTC(b[0], b[1] - 1, b[2]);
  return (db - da) / (365.25 * 86_400_000);
}

export type CashRow = {
  k: number;
  date: string;
  interest: number;
  principalBack: number;
};

/** Level coupon, par bond. `couponPct` is the annual coupon rate in percent. */
export function couponSchedule(
  start: string,
  tenorYears: number,
  couponPct: number,
  principal: number,
): CashRow[] {
  const semis = tenorYears * 2;
  const interest = (principal * couponPct) / 100 / 2;
  const rows: CashRow[] = [];
  for (let k = 1; k <= semis; k++) {
    rows.push({
      k,
      date: addMonths(start, k * 6),
      interest,
      principalBack: k === semis ? principal : 0,
    });
  }
  return rows;
}

export type HoldPoint = {
  k: number;
  label: string;
  price: number;
  coupons: number;
  market: number;
};

/**
 * One-off yield move, then that yield stays put.
 * Price is per 100 face and pulls to par. Coupons are dollars already received.
 */
export function holdPath(
  tenorYears: number,
  couponPct: number,
  ytmPct: number,
  principal: number,
): HoldPoint[] {
  const semis = tenorYears * 2;
  const semi = (principal * couponPct) / 100 / 2;
  const points: HoldPoint[] = [];
  for (let k = 0; k <= semis; k++) {
    const rem = (semis - k) / 2;
    const price = rem === 0 ? 100 : bondPrice(couponPct / 100, ytmPct / 100, rem);
    const year = k / 2;
    let label = "";
    if (k === 0) label = "buy";
    else if (k === semis) label = "mature";
    else if (Number.isInteger(year)) label = String(year);
    points.push({
      k,
      label,
      price,
      coupons: k * semi,
      market: (price / 100) * principal,
    });
  }
  return points;
}
