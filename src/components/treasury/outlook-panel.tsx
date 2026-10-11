import { useMemo, useState } from "react";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import {
  HORIZONS,
  SCENARIOS,
  forwardPrice,
  outlookRows,
  weightedYield,
  yieldFan,
  yieldOf,
  type ScenarioId,
} from "@/lib/market";
import { pct, signedMoney } from "@/lib/money";
import { useDesk, useT } from "@/components/treasury/state";
import { ChartTip, axisTick } from "@/components/treasury/charts";
import { Close, Panel, Stat, WhenMounted } from "@/components/treasury/ui";

const STROKE: Record<ScenarioId, string> = {
  ease: "var(--color-up)",
  firm: "var(--color-down)",
  slump: "var(--color-fg)",
};

export function OutlookPanel() {
  const { tenor, principal, ccy, book, spot, weights, setWeight } = useDesk();
  const t = useT();
  const [id, setId] = useState<ScenarioId>("ease");
  const [months, setMonths] = useState(12);
  const [fanOn, setFanOn] = useState(false);
  const [seed, setSeed] = useState(11);
  const rowsBase = outlookRows(tenor, book);
  const fan = useMemo(
    () => (fanOn ? yieldFan(yieldOf(spot, tenor), tenor, 48, seed) : []),
    [fanOn, spot, tenor, seed],
  );
  const rows = rowsBase.map((row, index) => {
    const extra: Record<string, number> = {};
    fan.forEach((path, key) => {
      extra[`f${key}`] = path[index];
    });
    return { ...row, label: t.horizon(row.m), ...extra };
  });
  const scenario = SCENARIOS.find((item) => item.id === id) ?? SCENARIOS[0];
  const name = t.scenarios[scenario.id].name;
  const forward = forwardPrice(tenor, id, months, book);
  const pnl = ((forward.price - 100) / 100) * principal;
  const weighted = weightedYield(tenor, months, book, weights);

  return (
    <Panel id="outlook" index="05" title={t.outlook.title} lede={t.outlook.lede}>
      <div className="grid gap-2 sm:grid-cols-3">
        {SCENARIOS.map((item) => {
          const active = item.id === id;
          const text = t.scenarios[item.id];
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setId(item.id)}
              aria-pressed={active}
              className={
                active
                  ? "rounded-md border border-fg bg-subtle px-3 py-3 text-left"
                  : "rounded-md border border-line px-3 py-3 text-left"
              }
            >
              <span className="flex items-baseline justify-between">
                <span className="text-sm font-medium text-fg">{text.name}</span>
                <span className="font-serif text-xl tabular-nums">{Math.round(weights[item.id] * 100)}%</span>
              </span>
              <span className="mt-1 block text-xs text-muted">{text.blurb}</span>
              <input
                type="range"
                min={0}
                max={100}
                value={Math.round(weights[item.id] * 100)}
                aria-label={text.name}
                onChange={(event) => setWeight(item.id, Number(event.target.value))}
                className="mt-3 w-full accent-fg"
              />
            </button>
          );
        })}
      </div>

      <WhenMounted className="mt-5 h-64 w-full min-w-0">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={rows} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <XAxis dataKey="label" tick={axisTick} axisLine={false} tickLine={false} />
            <YAxis
              tick={axisTick}
              axisLine={false}
              tickLine={false}
              width={42}
              tickFormatter={(value: number) => value.toFixed(1)}
              domain={["dataMin - 0.2", "dataMax + 0.2"]}
            />
            <Tooltip
              content={({ active, payload, label }) => (
                <ChartTip
                  active={active}
                  label={typeof label === "string" ? label : undefined}
                  payload={(payload ?? [])
                    .filter((row) => !String(row.dataKey).startsWith("f"))
                    .map((row) => ({
                      name: typeof row.name === "string" ? row.name : String(row.dataKey ?? ""),
                      value: typeof row.value === "number" ? row.value : Number(row.value),
                      dataKey: String(row.dataKey ?? ""),
                    }))}
                  format={(value) => `${value.toFixed(2)}%`}
                />
              )}
            />
            {fan.map((_, index) => (
              <Line
                key={`f${index}`}
                type="monotone"
                dataKey={`f${index}`}
                stroke="var(--color-faint)"
                strokeWidth={1}
                strokeOpacity={0.28}
                dot={false}
                isAnimationActive={false}
                legendType="none"
              />
            ))}
            {SCENARIOS.map((item) => (
              <Line
                key={item.id}
                type="monotone"
                dataKey={item.id}
                name={`${t.scenarios[item.id].name} ${Math.round(weights[item.id] * 100)}%`}
                stroke={STROKE[item.id]}
                strokeWidth={item.id === id ? 2.5 : 1.25}
                strokeOpacity={item.id === id ? 1 : 0.45}
                dot={false}
                isAnimationActive={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </WhenMounted>

      <div className="mt-4 flex flex-wrap gap-2">
        {HORIZONS.map((item) => (
          <button
            key={item.m}
            type="button"
            onClick={() => setMonths(item.m)}
            className={
              months === item.m
                ? "h-11 rounded-md bg-accent px-3 text-sm font-medium text-accent-fg"
                : "h-11 rounded-md border border-line px-3 text-sm text-fg"
            }
          >
            {t.horizonAfter(item.m)}
          </button>
        ))}
        <button
          type="button"
          onClick={() => {
            setSeed((value) => value + 17);
            setFanOn(true);
          }}
          className="h-11 rounded-md border border-line px-3 text-sm text-fg"
        >
          {fanOn ? t.play.simulate : t.play.simulate}
        </button>
        {fanOn ? (
          <button type="button" onClick={() => setFanOn(false)} className="h-11 rounded-md border border-line px-3 text-sm text-faint">
            {t.play.simulateOff}
          </button>
        ) : null}
      </div>
      {fanOn ? <p className="mt-3 text-xs text-faint">{t.play.simulateNote}</p> : null}

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <Stat label={t.outlook.yield(name)} value={pct(forward.ytm)} hint={t.outlook.here} />
        <Stat
          label={forward.matured ? t.outlook.matured : t.outlook.priceThen}
          value={forward.matured ? "100" : forward.price.toFixed(2)}
          hint={forward.matured ? t.outlook.redeemed : t.outlook.per100}
          tone={forward.price < 99.5 ? "down" : forward.price > 100.5 ? "up" : "fg"}
        />
        <Stat
          label={t.outlook.pnl}
          value={forward.matured ? t.outlook.redeemedWord : signedMoney(pnl, ccy)}
          hint={t.outlook.weighted(pct(weighted))}
          tone={pnl < -1 && !forward.matured ? "down" : pnl > 1 ? "up" : "fg"}
        />
      </div>
      <Close>{forward.matured ? t.outlook.done : t.outlook.live(name, forward.price.toFixed(2))}</Close>
    </Panel>
  );
}
