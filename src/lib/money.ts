import { PEG } from "@/lib/market";

export type Ccy = "USD" | "HKD";

export function money(usd: number, ccy: Ccy, digits?: number): string {
  const value = ccy === "HKD" ? usd * PEG : usd;
  const fraction =
    digits ?? (Math.abs(value) >= 1000 && Math.abs(value - Math.round(value)) < 0.02 ? 0 : 2);
  return new Intl.NumberFormat("zh-HK", {
    style: "currency",
    currency: ccy,
    minimumFractionDigits: fraction,
    maximumFractionDigits: fraction,
  }).format(value);
}

export function signedMoney(usd: number, ccy: Ccy, digits?: number): string {
  const text = money(Math.abs(usd), ccy, digits);
  if (usd > 0.004) return `+${text}`;
  if (usd < -0.004) return `−${text}`;
  return money(0, ccy, digits);
}

export function zhDate(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${y}年${Number(m)}月${Number(d)}日`;
}

export function shortDate(iso: string): string {
  const [y, m] = iso.split("-");
  return `${y.slice(2)}/${m}`;
}

export function pct(value: number, digits = 2): string {
  return `${value.toFixed(digits)}%`;
}
