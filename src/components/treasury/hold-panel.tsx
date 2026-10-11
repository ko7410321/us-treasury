import { useMemo, useState } from "react";
import { Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { holdPath } from "@/lib/bonds";
import { yieldOf } from "@/lib/market";
import { money, pct, signedMoney } from "@/lib/money";
import { useDesk, useT } from "@/components/treasury/state";
import { ChartTip, axisTick } from "@/components/treasury/charts";
import { Close, Panel, WhenMounted } from "@/components/treasury/ui";

export function HoldPanel() {
  const { tenor, principal, shockBp, ccy, spot } = useDesk();
  const t = useT();
  const coupon = yieldOf(spot, tenor);
  const ytm = coupon + shockBp / 100;
  const points = useMemo(
    () => holdPath(tenor, coupon, ytm, principal),
    [tenor, coupon, ytm, principal],
  );
  const now = points[0];
  const semi = (principal * coupon) / 100 / 2;
  const totalInterest = semi * tenor * 2;
  const loss = now.price < 99.95;
  const lows = Math.min(...points.map((point) => point.price));
  const chart = points
    .filter((point) => point.label !== "")
    .map((point) => ({
      label:
        point.label === "buy"
          ? t.axisBuy
          : point.label === "mature"
            ? t.axisMature
            : t.axisYear(Number(point.label)),
      price: Math.round(point.price * 100) / 100,
    }));
  const move = shockBp === 0 ? t.hold.flatMove : shockBp > 0 ? t.hold.upMove(shockBp) : t.hold.downMove(Math.abs(shockBp));
  const [sellYear, setSellYear] = useState(0);
  const sold = points[Math.min(points.length - 1, sellYear * 2)] ?? now;
  const when = sellYear === 0 ? t.axisBuy : sellYear >= tenor ? t.axisMature : t.axisYear(sellYear);
  const soldLoss = sold.price < 99.95;
  const soldGain = sold.price > 100.05;
  const soldTone = soldLoss ? t.hold.sellLoss : soldGain ? t.hold.sellGain : t.hold.sellFlat;
  const missed = [soldTone[0], t.hold.sellRest(money(Math.max(0, totalInterest - sold.coupons), ccy)), soldTone[2]];

  return (
    <Panel id="hold" index="03" title={t.hold.title} lede={t.hold.lede}>
      <p className="font-serif text-2xl text-fg md:text-3xl">{loss ? t.hold.lossLead : t.hold.flatLead}</p>
      <p className="mt-3 max-w-2xl text-sm text-muted">{t.hold.setup(move, pct(ytm))}</p>

      <WhenMounted className="mt-5 h-64 w-full min-w-0">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chart} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <XAxis dataKey="label" tick={axisTick} axisLine={false} tickLine={false} minTickGap={28} />
            <YAxis
              domain={[Math.floor(lows - 1), Math.ceil(Math.max(...points.map((point) => point.price)) + 1)]}
              tick={axisTick}
              axisLine={false}
              tickLine={false}
              width={36}
            />
            <Tooltip content={<ChartTip format={(value) => value.toFixed(2)} />} />
            <ReferenceLine y={100} stroke="var(--color-faint)" strokeDasharray="4 4" />
            <Line
              type="monotone"
              dataKey="price"
              name={t.chart.price}
              stroke="var(--color-fg)"
              strokeWidth={1.75}
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </WhenMounted>
      <p className="mt-2 text-xs text-faint">{t.hold.note}</p>

      <div className="mt-5 grid gap-3 md:grid-cols-2">
        <article className="rounded-md border border-line p-4">
          <h3 className="text-sm font-medium text-fg">{t.play.sellWhen(when)}</h3>
          <p className="mt-3 font-serif text-3xl tabular-nums text-fg">{money(sold.market, ccy)}</p>
          <p className={`mt-1 text-sm tabular-nums ${soldLoss ? "text-down" : soldGain ? "text-up" : "text-fg"}`}>
            {t.hold.vsPrincipal} {signedMoney(sold.market - principal, ccy)}
          </p>
          <input
            type="range"
            min={0}
            max={tenor}
            step={1}
            value={sellYear}
            aria-label={t.play.sellWhen(when)}
            onChange={(event) => setSellYear(Number(event.target.value))}
            className="mt-4 w-full accent-fg"
          />
          <ul className="mt-4 space-y-2 text-sm text-muted">
            {missed.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </article>
        <article className="rounded-md border border-fg p-4">
          <h3 className="text-sm font-medium text-fg">{t.hold.keep}</h3>
          <p className="mt-3 font-serif text-3xl tabular-nums text-fg">{money(principal + totalInterest, ccy)}</p>
          <p className="mt-1 text-sm text-up tabular-nums">{t.hold.keepSub(signedMoney(totalInterest, ccy))}</p>
          <ul className="mt-4 space-y-2 text-sm text-muted">
            {t.hold.keepPoints(money(semi, ccy, 2), tenor * 2, money(principal, ccy)).map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </article>
      </div>
      <Close>{t.hold.close}</Close>
    </Panel>
  );
}
