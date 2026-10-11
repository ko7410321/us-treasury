import { useEffect, useMemo, useState } from "react";
import { couponSchedule } from "@/lib/bonds";
import { yieldOf } from "@/lib/market";
import { money, pct } from "@/lib/money";
import { useDesk, useT } from "@/components/treasury/state";
import { Close, Panel, Stat } from "@/components/treasury/ui";

export function CashflowPanel() {
  const { tenor, principal, ccy, spot, asOf } = useDesk();
  const t = useT();
  const coupon = yieldOf(spot, tenor);
  const rows = useMemo(
    () => couponSchedule(asOf, tenor, coupon, principal),
    [asOf, tenor, coupon, principal],
  );
  const [showAll, setShowAll] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [cursor, setCursor] = useState(4);
  const interest = rows.reduce((sum, row) => sum + row.interest, 0);
  const semi = rows[0]?.interest ?? 0;
  let running = 0;
  const withTotal = rows.map((row) => {
    running += row.interest + row.principalBack;
    return { ...row, cumulative: running };
  });
  const visible = playing || showAll ? withTotal.slice(0, cursor) : withTotal.slice(0, 4);
  useEffect(() => {
    if (!playing) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setCursor(rows.length);
      setShowAll(true);
      setPlaying(false);
      return;
    }
    const id = window.setInterval(() => {
      setCursor((value) => {
        if (value >= rows.length) {
          setPlaying(false);
          return rows.length;
        }
        return value + 1;
      });
    }, 280);
    return () => window.clearInterval(id);
  }, [playing, rows.length]);
  const maturity = rows[rows.length - 1]?.date ?? asOf;

  return (
    <Panel
      id="cash"
      index="01"
      title={t.cash.title}
      lede={t.cash.lede(pct(coupon), t.date(asOf))}
    >
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label={t.cash.principal} value={money(principal, ccy)} hint={t.cash.parBack} />
        <Stat label={t.cash.semi} value={money(semi, ccy, 2)} hint={t.cash.semiHint(rows.length)} />
        <Stat label={t.cash.interest} value={money(interest, ccy)} hint={t.cash.hold(tenor)} />
        <Stat label={t.cash.total} value={money(principal + interest, ccy)} hint={t.date(maturity)} />
      </div>

      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[32rem] text-left text-sm">
          <thead className="text-xs text-faint">
            <tr className="border-b border-line">
              <th className="py-2 pr-3 font-medium">{t.cash.period}</th>
              <th className="py-2 pr-3 font-medium">{t.cash.date}</th>
              <th className="py-2 pr-3 text-right font-medium">{t.cash.interestCol}</th>
              <th className="py-2 pr-3 text-right font-medium">{t.cash.principalCol}</th>
              <th className="py-2 text-right font-medium">{t.cash.sumCol}</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((row) => (
              <tr key={row.k} className={row.k === cursor && playing ? "border-b border-line bg-subtle" : "border-b border-line"}>
                <td className="py-2 pr-3 tabular-nums text-muted">{row.k}</td>
                <td className="py-2 pr-3 tabular-nums">{t.date(row.date)}</td>
                <td className="py-2 pr-3 text-right tabular-nums">{money(row.interest, ccy, 2)}</td>
                <td className="py-2 pr-3 text-right tabular-nums text-muted">
                  {row.principalBack ? money(row.principalBack, ccy) : "—"}
                </td>
                <td className="py-2 text-right tabular-nums">
                  {money(row.cumulative, ccy, 2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {rows.length > 4 ? (
          <button
            type="button"
            onClick={() => {
              setPlaying(false);
              setShowAll((open) => !open);
              setCursor(rows.length);
            }}
            className="h-11 rounded-md border border-line px-4 text-sm text-fg"
          >
            {showAll ? t.cash.collapse : t.cash.expand(rows.length)}
          </button>
        ) : null}
        <button
          type="button"
          onClick={() => {
            if (playing) {
              setPlaying(false);
              return;
            }
            setShowAll(true);
            setCursor(1);
            setPlaying(true);
          }}
          className="h-11 rounded-md border border-line px-4 text-sm text-fg"
        >
          {playing ? t.play.pause : t.play.play}
        </button>
      </div>
      <Close>{t.cash.note(money(semi, ccy, 2), money(principal, ccy))}</Close>
    </Panel>
  );
}
