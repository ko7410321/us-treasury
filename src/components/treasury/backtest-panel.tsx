import { useEffect, useMemo, useState } from "react";
import { Line, LineChart, ReferenceDot, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis, Bar, BarChart, Cell } from "recharts";
import {
  analyzeVintage,
  richerMonths,
  vintagePricePath,
  yearEndPoints,
  yieldOf,
  type Vintage,
} from "@/lib/market";
import { money, pct, shortDate } from "@/lib/money";
import { useDesk, useT } from "@/components/treasury/state";
import { ChartTip, axisTick, gridStroke } from "@/components/treasury/charts";
import { Close, Panel, Stat, WhenMounted } from "@/components/treasury/ui";

function worstOpen(rows: Vintage[]): Vintage | undefined {
  return [...rows].filter((row) => !row.matured).sort((a, b) => a.price - b.price)[0];
}

export function BacktestPanel() {
  const { tenor, principal, ccy, book, spot, asOf } = useDesk();
  const t = useT();
  const y = yieldOf(spot, tenor);
  const rows = useMemo(() => yearEndPoints(book).map((point) => analyzeVintage(tenor, point, book)), [tenor, book]);
  const [picked, setPicked] = useState<number | null>(null);
  const selected = rows.find((row) => row.year === picked) ?? worstOpen(rows) ?? rows[rows.length - 1];
  const boughtPoint = yearEndPoints(book).find((point) => point.d.startsWith(String(selected.year)));
  const path = useMemo(
    () => (boughtPoint ? vintagePricePath(tenor, boughtPoint, book) : []),
    [tenor, boughtPoint, book],
  );
  const richer = richerMonths(tenor, book);
  const beat = rows.filter((row) => y > row.entry + 0.005).length;
  const underwater = rows.filter((row) => !row.matured && row.price < 99.5).length;
  const minPrice = path.length ? Math.min(...path.map((point) => point.price)) : 100;
  const annualNow = (principal * y) / 100;
  const annualThen = (principal * selected.entry) / 100;
  const gap = annualNow - annualThen;

  const bars = rows.map((row) => ({ year: String(row.year), entry: row.entry, y: row.year }));
  const line = path.map((point) => ({
    d: shortDate(point.d),
    price: Math.round(point.price * 100) / 100,
  }));
  const [frame, setFrame] = useState(0);
  const [replaying, setReplaying] = useState(false);
  useEffect(() => {
    setFrame(Math.max(0, line.length - 1));
    setReplaying(false);
  }, [line.length, selected.year]);
  useEffect(() => {
    if (!replaying) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setFrame(Math.max(0, line.length - 1));
      setReplaying(false);
      return;
    }
    const id = window.setInterval(() => {
      setFrame((value) => {
        if (value >= line.length - 1) {
          setReplaying(false);
          return Math.max(0, line.length - 1);
        }
        return value + 1;
      });
    }, 160);
    return () => window.clearInterval(id);
  }, [replaying, line.length]);
  const played = line.slice(0, Math.min(line.length, frame + 1));
  const head = played[played.length - 1];

  return (
    <Panel id="backtest" index="04" title={t.backtest.title} lede={t.backtest.lede}>
      <div className="grid gap-3 sm:grid-cols-3">
        <Stat label={t.backtest.locked} value={pct(y)} hint={t.backtest.beat(rows.length, beat)} />
        <Stat
          label={t.backtest.underwater}
          value={String(underwater)}
          hint={t.backtest.stillPar}
          tone={underwater ? "down" : "fg"}
        />
        <Stat
          label={t.backtest.richer}
          value={t.backtest.count(richer.higher)}
          hint={
            richer.higher ? t.backtest.richest(pct(richer.max), t.date(richer.maxDate)) : t.backtest.richestNow
          }
        />
      </div>

      <h3 className="mt-6 text-sm font-medium text-fg">{t.backtest.barTitle}</h3>
      <WhenMounted className="mt-3 h-52 w-full min-w-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={bars} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <XAxis dataKey="year" tick={axisTick} axisLine={false} tickLine={false} />
            <YAxis tick={axisTick} axisLine={false} tickLine={false} width={36} />
            <Tooltip content={<ChartTip format={(value) => `${value.toFixed(2)}%`} />} />
            <ReferenceLine y={y} stroke="var(--color-fg)" strokeDasharray="4 4" />
            <Bar
              dataKey="entry"
              name={t.chart.entry}
              radius={[4, 4, 0, 0]}
              onClick={(item) => {
                const year = Number((item as { y?: number }).y);
                if (Number.isFinite(year)) setPicked(year);
              }}
            >
              {bars.map((bar) => (
                <Cell
                  key={bar.year}
                  fill={bar.y === selected.year ? "var(--color-fg)" : "var(--color-faint)"}
                  cursor="pointer"
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </WhenMounted>
      <p className="mt-2 text-xs text-faint">{t.backtest.barNote}</p>

      <div className="mt-5 grid gap-2 sm:grid-cols-2">
        {rows.map((row) => {
          const ahead = y - row.entry;
          const active = row.year === selected.year;
          return (
            <button
              key={row.year}
              type="button"
              onClick={() => setPicked(row.year)}
              className={
                active
                  ? "rounded-md border border-fg bg-subtle px-3 py-3 text-left"
                  : "rounded-md border border-line px-3 py-3 text-left"
              }
            >
              <span className="flex items-baseline justify-between gap-3">
                <span className="text-sm font-medium text-fg">{t.backtest.yearEnd(row.year)}</span>
                <span className="font-serif text-xl tabular-nums">{pct(row.entry)}</span>
              </span>
              <span className="mt-1 block text-xs text-muted">
                {row.matured
                  ? t.backtest.matured(t.date(row.maturity))
                  : t.backtest.open(row.price.toFixed(2), money((row.couponsPer100 / 100) * principal, ccy))}
              </span>
              <span className={`mt-1 block text-xs ${ahead > 0.005 ? "text-up" : "text-muted"}`}>
                {ahead > 0.005
                  ? t.backtest.more(money((principal * ahead) / 100, ccy))
                  : ahead < -0.005
                    ? t.backtest.thenHigher
                    : t.backtest.similar}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-6 rounded-md border border-line p-3">
        <h3 className="text-sm font-medium text-fg">{t.backtest.pathTitle(selected.year, tenor)}</h3>
        <p className="mt-2 text-sm text-muted">
          {selected.matured
            ? t.backtest.pathDone(minPrice.toFixed(2), pct(selected.entry), pct(y))
            : t.backtest.pathOpen(
                pct(selected.entry),
                selected.remaining.toFixed(1),
                selected.price.toFixed(2),
                minPrice.toFixed(2),
                t.date(selected.maturity),
                pct(selected.entry),
              )}
        </p>
        <p className="mt-2 text-sm text-fg">
          {gap > 1
            ? t.backtest.gapWin(money(principal, ccy), money(annualNow, ccy), selected.year, money(gap, ccy))
            : gap < -1
              ? t.backtest.gapLose(selected.year)
              : t.backtest.gapFlat}
        </p>
        <WhenMounted className="mt-3 h-52 w-full min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={played} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <XAxis dataKey="d" tick={axisTick} axisLine={false} tickLine={false} minTickGap={24} />
              <YAxis
                domain={["dataMin - 1", "dataMax + 1"]}
                tick={axisTick}
                axisLine={false}
                tickLine={false}
                width={36}
              />
              <Tooltip content={<ChartTip format={(value) => value.toFixed(2)} />} />
              <ReferenceLine y={100} stroke={gridStroke} />
              <Line
                type="monotone"
                dataKey="price"
                name={t.chart.price}
                stroke="var(--color-fg)"
                strokeWidth={1.5}
                dot={false}
                isAnimationActive={false}
              />
              {head ? <ReferenceDot x={head.d} y={head.price} r={4} fill="var(--color-fg)" /> : null}
            </LineChart>
          </ResponsiveContainer>
        </WhenMounted>
        <p className="mt-2 text-xs text-faint">
          {t.backtest.pathNote(selected.matured ? t.backtest.untilEnd : t.date(asOf))}
        </p>
        {line.length > 1 ? (
          <div className="mt-3 flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                if (replaying) {
                  setReplaying(false);
                  return;
                }
                setFrame(0);
                setReplaying(true);
              }}
              className="h-11 shrink-0 rounded-md border border-line px-3 text-sm text-fg"
            >
              {replaying ? t.play.pause : t.play.replay}
            </button>
            <input
              type="range"
              min={0}
              max={line.length - 1}
              value={Math.min(frame, line.length - 1)}
              aria-label={t.play.replay}
              onChange={(event) => {
                setReplaying(false);
                setFrame(Number(event.target.value));
              }}
              className="w-full accent-fg"
            />
          </div>
        ) : null}
      </div>
      <Close>{t.backtest.close}</Close>
    </Panel>
  );
}
