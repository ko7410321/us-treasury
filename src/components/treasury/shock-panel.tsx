import { useEffect, useMemo, useRef, useState } from "react";
import {
  Area,
  ComposedChart,
  Line,
  ReferenceDot,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { bondPrice, convexity, modifiedDuration, addMonths } from "@/lib/bonds";
import { yieldOf, type Tenor } from "@/lib/market";
import { money, pct, signedMoney } from "@/lib/money";
import { useDesk, useT } from "@/components/treasury/state";
import { axisTick } from "@/components/treasury/charts";
import { BpSlider, Close, More, Panel, Stat, Term, useTween, WhenMounted } from "@/components/treasury/ui";

const YIELD_FLOOR = 0.05;
const MAX_BP = 300;

function snap(bp: number): number {
  return Math.round(bp / 5) * 5;
}

function trough2020(tenor: Tenor, history: { d: string; y2: number; y5: number; y7: number; y10: number; y30: number }[]): { y: number; d: string } {
  let y = Infinity;
  let d = "2020-07-31";
  for (const point of history) {
    if (!point.d.startsWith("2020")) continue;
    const next = yieldOf(point, tenor);
    if (next < y) {
      y = next;
      d = point.d;
    }
  }
  return { y, d };
}

function vsPar(price: number): string {
  const gap = price - 100;
  if (Math.abs(gap) < 0.05) return "0%";
  const sign = gap > 0 ? "+" : "−";
  return `${sign}${Math.abs(gap).toFixed(1)}%`;
}

export function ShockPanel() {
  const { tenor, principal, shockBp, setShockBp, ccy, spot, asOf, book } = useDesk();
  const t = useT();
  const coupon = yieldOf(spot, tenor);
  const minBp = snap((YIELD_FLOOR - coupon) * 100);
  const low = trough2020(tenor, book.history);
  const lowBp = Math.max(minBp, snap((low.y - coupon) * 100));

  useEffect(() => {
    if (shockBp < minBp) setShockBp(minBp);
    else if (shockBp > MAX_BP) setShockBp(MAX_BP);
  }, [minBp, shockBp, setShockBp]);

  const bp = Math.min(MAX_BP, Math.max(minBp, shockBp));
  const nextYield = coupon + bp / 100;
  const price = bondPrice(coupon / 100, nextYield / 100, tenor);
  const pnl = ((price - 100) / 100) * principal;
  const parPct = vsPar(price);
  const dur = modifiedDuration(coupon / 100, coupon / 100, tenor);
  const upOne = bondPrice(coupon / 100, (coupon + 0.01) / 100, tenor);
  const perBp = ((bondPrice(coupon / 100, coupon / 100, tenor) - upOne) / 100) * principal;
  const maturity = addMonths(asOf, tenor * 12);
  const tone = pnl < -1 ? "down" : pnl > 1 ? "up" : "fg";
  const loss = price < 99.95;

  const curve = useMemo(() => {
    const steps = new Set<number>();
    for (let step = minBp; step <= MAX_BP; step += 25) steps.add(step);
    steps.add(minBp);
    steps.add(MAX_BP);
    steps.add(0);
    if (bp !== 0) {
      steps.add(bp);
      steps.add(bp > 0 ? bp + 0.01 : bp - 0.01);
    }
    const lo = Math.min(0, bp);
    const hi = Math.max(0, bp);
    return [...steps].sort((a, b) => a - b).map((step) => {
      const ytm = coupon + step / 100;
      const px = Math.round(bondPrice(coupon / 100, ytm / 100, tenor) * 100) / 100;
      const swept = bp !== 0 && step >= lo && step <= hi;
      return {
        bp: step,
        price: px,
        above: swept && px >= 100 ? px : 100,
        below: swept && px <= 100 ? px : 100,
      };
    });
  }, [coupon, tenor, minBp, bp]);

  const labelX = bp * 0.72;
  const labelPrice = bondPrice(coupon / 100, (coupon + labelX / 100) / 100, tenor);
  const yTicks = curve.map((row) => row.price);
  const yMin = Math.floor(Math.min(...yTicks, 100) / 25) * 25;
  const yMax = Math.ceil(Math.max(...yTicks, 100) / 25) * 25;
  const bandY = 100 + (labelPrice - 100) * 0.62;
  const xFrac = (labelX - minBp) / (MAX_BP - minBp);
  const yFrac = (yMax - bandY) / (yMax - yMin);
  const shownPrice = useTween(price, 240);
  const shownPnl = useTween(pnl, 240);
  const bend = convexity(coupon / 100, coupon / 100, tenor);
  const rise = bondPrice(coupon / 100, Math.max(0.0005, coupon / 100 - 0.01), tenor) - 100;
  const fall = 100 - bondPrice(coupon / 100, coupon / 100 + 0.01, tenor);
  const [playing, setPlaying] = useState(false);
  const playRef = useRef(bp);
  playRef.current = bp;
  useEffect(() => {
    if (!playing) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setPlaying(false);
      return;
    }
    let dir = 1;
    const id = window.setInterval(() => {
      let next = playRef.current + dir * 15;
      if (next >= MAX_BP) {
        next = MAX_BP;
        dir = -1;
      }
      if (next <= minBp) {
        setShockBp(minBp);
        setPlaying(false);
        return;
      }
      setShockBp(next);
    }, 90);
    return () => window.clearInterval(id);
  }, [playing, minBp, setShockBp]);
  const atLow = bondPrice(coupon / 100, low.y / 100, tenor);
  const presets = [
    { bp: minBp, label: t.shock.nearZero },
    { bp: lowBp, label: t.shock.low2020 },
    { bp: -100, label: "-100" },
    { bp: 0, label: "0" },
    { bp: 100, label: "+100" },
    { bp: 200, label: "+200" },
  ];

  return (
    <Panel id="shock" index="02" title={t.shock.title} lede={t.shock.lede}>
      <WhenMounted className="relative h-72 w-full min-w-0">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={curve} margin={{ top: 16, right: 8, left: 0, bottom: 0 }}>
            <XAxis
              dataKey="bp"
              type="number"
              domain={[minBp, MAX_BP]}
              tick={axisTick}
              axisLine={false}
              tickLine={false}
              tickFormatter={(value: number) => (value > 0 ? `+${value}` : String(value))}
            />
            <YAxis
              tick={axisTick}
              axisLine={false}
              tickLine={false}
              width={36}
              domain={[yMin, yMax]}
              tickFormatter={(value: number) => value.toFixed(0)}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                const row = payload?.find((item) => item.dataKey === "price");
                const px = typeof row?.value === "number" ? row.value : Number(row?.value);
                if (!active || !Number.isFinite(px)) return null;
                return (
                  <div className="rounded-md border border-line bg-elevated px-3 py-2 text-xs">
                    <p className="text-faint">
                      {t.shock.tipBp} {Number(label) > 0 ? `+${label}` : label}
                    </p>
                    <p className="mt-1 tabular-nums text-fg">
                      {t.shock.tipPrice} {px.toFixed(2)}
                    </p>
                    <p
                      className="mt-1 tabular-nums"
                      style={{ color: px >= 100 ? "var(--color-gain)" : "var(--color-loss)" }}
                    >
                      {t.shock.tipPct} {vsPar(px)}
                    </p>
                  </div>
                );
              }}
            />
            <ReferenceLine y={100} stroke="var(--color-faint)" strokeDasharray="4 4" />
            <ReferenceLine x={0} stroke="var(--color-line)" />
            <Area
              type="linear"
              dataKey="above"
              baseValue={100}
              stroke="none"
              fill="var(--color-gain)"
              fillOpacity={0.84}
              isAnimationActive={false}
              activeDot={false}
            />
            <Area
              type="linear"
              dataKey="below"
              baseValue={100}
              stroke="none"
              fill="var(--color-loss)"
              fillOpacity={0.84}
              isAnimationActive={false}
              activeDot={false}
            />
            <Line
              type="linear"
              dataKey="price"
              stroke="var(--color-fg)"
              strokeWidth={1.75}
              dot={false}
              isAnimationActive={false}
            />
            <ReferenceDot
              x={bp}
              y={price}
              r={5}
              fill={price >= 100 ? "var(--color-gain)" : "var(--color-loss)"}
              stroke="var(--color-fg)"
            />
          </ComposedChart>
        </ResponsiveContainer>
        {Math.abs(price - 100) >= 0.4 ? (
          <span
            className="pointer-events-none absolute text-[15px] font-semibold tabular-nums transition-[left,top] duration-300"
            style={{
              left: `calc(36px + (100% - 44px) * ${xFrac})`,
              top: `calc(16px + (100% - 36px) * ${yFrac})`,
              color: "#f7f8f8",
              textShadow: "0 1px 2px rgba(0,0,0,0.55)",
              transform: "translate(-50%, -50%)",
            }}
          >
            {parPct}
          </span>
        ) : null}
      </WhenMounted>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <Stat label={t.shock.yieldAfter} value={pct(nextYield)} hint={t.shock.today(pct(coupon))} />
        <Stat label={t.shock.price} value={shownPrice.toFixed(2)} hint={`${t.shock.per100} · ${t.shock.vsPar(parPct)}`} tone={tone} />
        <Stat
          label={<Term tip={t.tips.mark}>{t.shock.pnl}</Term>}
          value={signedMoney(shownPnl, ccy)}
          hint={t.shock.principalHint(money(principal, ccy))}
          tone={tone}
        />
      </div>
      <p className="mt-3 text-sm text-muted">{t.play.convexity(bend.toFixed(1), rise.toFixed(1), fall.toFixed(1))}</p>
      <div className="mt-5">
        <BpSlider
          value={bp}
          min={minBp}
          max={MAX_BP}
          onChange={(next) => {
            setPlaying(false);
            setShockBp(next);
          }}
        />
        <div className="mt-3 flex gap-2 overflow-x-auto">
          {presets.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => {
                setPlaying(false);
                setShockBp(item.bp);
              }}
              className={
                bp === item.bp
                  ? "h-11 shrink-0 rounded-md bg-accent px-3 text-sm font-medium text-accent-fg"
                  : "h-11 shrink-0 rounded-md border border-line px-3 text-sm text-fg"
              }
            >
              {item.label}
            </button>
          ))}
          <button type="button" onClick={() => { setPlaying(false); setShockBp(0); }} className="h-11 shrink-0 px-2 text-sm text-faint">
            {t.reset}
          </button>
          <button
            type="button"
            onClick={() => setPlaying((on) => !on)}
            className="h-11 shrink-0 rounded-md border border-line px-3 text-sm text-fg"
          >
            {playing ? t.play.pause : t.play.play}
          </button>
        </div>
      </div>
      <More>
        <p>{t.shock.caption}</p>
        <p>
          <Term tip={t.tips.basis}>
            {t.shock.mechanics(
              dur.toFixed(2),
              money(perBp * 100, ccy),
              money(perBp, ccy, 2),
              t.date(low.d),
              pct(low.y),
              atLow.toFixed(2),
              signedMoney(((atLow - 100) / 100) * principal, ccy),
            )}
          </Term>
        </p>
      </More>
      <Close>
        {loss
          ? t.shock.loss(money(Math.abs(pnl), ccy), t.date(maturity), money(principal, ccy))
          : price > 100.05
            ? t.shock.gain(money(pnl, ccy))
            : t.shock.flat}
      </Close>
    </Panel>
  );
}
