import { useEffect, useRef, useState } from "react";
import { TENORS, yieldOf } from "@/lib/market";
import { money, pct } from "@/lib/money";
import { modifiedDuration } from "@/lib/bonds";
import { DeskState, useDesk, useT } from "@/components/treasury/state";
import { HeroChart } from "@/components/treasury/hero-chart";
import { ShockPanel } from "@/components/treasury/shock-panel";
import { CashflowPanel } from "@/components/treasury/cashflow-panel";
import { BacktestPanel } from "@/components/treasury/backtest-panel";
import { OutlookPanel } from "@/components/treasury/outlook-panel";
import { HoldPanel } from "@/components/treasury/hold-panel";
import { AccessPanel } from "@/components/treasury/access-panel";
import { More, Term } from "@/components/treasury/ui";
import { useTween } from "@/components/treasury/ui";
import type { YieldPoint } from "@/lib/history";
import type { CurvePayload } from "@/lib/curve";
import type { Lang } from "@/lib/copy";

const LANGS: { id: Lang; label: string }[] = [
  { id: "zh-Hant", label: "繁體" },
  { id: "zh-Hans", label: "简体" },
  { id: "en", label: "EN" },
];

function ladderBook(principal: number, spot: YieldPoint) {
  const tenors = [2, 5, 10, 30] as const;
  const each = principal / tenors.length;
  let semi = 0;
  let interest = 0;
  let dur = 0;
  for (const tenor of tenors) {
    const coupon = yieldOf(spot, tenor);
    semi += (each * coupon) / 100 / 2;
    interest += (each * coupon * tenor) / 100;
    dur += modifiedDuration(coupon / 100, coupon / 100, tenor) * each;
  }
  return { semi, total: principal + interest, dur: principal > 0 ? dur / principal : 0 };
}

export function Desk({ initial }: { initial?: CurvePayload | null }) {
  return (
    <DeskState initial={initial}>
      <DeskView />
    </DeskState>
  );
}

function DeskView() {
  const { tenor, setTenor, principal, setPrincipal, ccy, setCcy, lang, setLang, setShockBp, shockBp, spot, asOf, source, weights } = useDesk();
  const t = useT();
  const y = yieldOf(spot, tenor);
  const shownY = useTween(y, 320);
  const [copied, setCopied] = useState(false);
  const [ladder, setLadder] = useState(false);
  const jumpAccess = useRef(false);
  const openAccess = () => {
    jumpAccess.current = true;
    setLang("zh-Hans");
  };
  useEffect(() => {
    if (!jumpAccess.current || lang !== "zh-Hans") return;
    jumpAccess.current = false;
    document.getElementById("access")?.scrollIntoView({ block: "start" });
  }, [lang]);
  const semi = (principal * y) / 100 / 2;
  const interest = (principal * y * tenor) / 100;
  const dur = modifiedDuration(y / 100, y / 100, tenor);
  const jumps = [
    ["#cash", t.jumps.cash],
    ["#shock", t.jumps.shock],
    ["#hold", t.jumps.hold],
    ["#backtest", t.jumps.backtest],
    ["#outlook", t.jumps.outlook],
  ] as const;
  const presets = [100_000, 250_000, 1_000_000];

  return (
    <main className="min-h-screen pb-20">
      <header className="mx-auto max-w-6xl px-4 pt-6 md:px-8 md:pt-10">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-medium tracking-widest text-faint">{t.kicker}</p>
          <div className="flex items-center rounded-md border border-line bg-subtle p-0.5" role="group" aria-label={t.langAria}>
            {LANGS.map((item) => (
              <button
                key={item.id}
                type="button"
                aria-pressed={lang === item.id}
                onClick={() => setLang(item.id)}
                className={
                  lang === item.id
                    ? "h-7 rounded px-2 text-xs text-fg bg-elevated"
                    : "h-7 rounded px-2 text-xs text-faint"
                }
              >
                {item.label}
              </button>
            ))}
            <span className="mx-0.5 h-4 w-px bg-line" aria-hidden="true" />
            <button
              type="button"
              onClick={() => {
                const q = new URLSearchParams();
                q.set("t", String(tenor));
                q.set("p", String(principal));
                q.set("bp", String(shockBp));
                q.set("c", ccy);
                q.set("lang", lang);
                q.set(
                  "w",
                  [weights.ease, weights.firm, weights.slump].map((n) => Math.round(n * 100)).join(","),
                );
                const url = `${window.location.origin}${window.location.pathname}?${q}`;
                navigator.clipboard.writeText(url).then(
                  () => {
                    setCopied(true);
                    window.setTimeout(() => setCopied(false), 1600);
                  },
                  () => undefined,
                );
              }}
              className="h-7 rounded px-2 text-xs text-faint"
            >
              {copied ? t.play.copied : t.play.share}
            </button>
          </div>
        </div>
        <h1 className="mt-4 font-serif text-4xl text-fg md:text-5xl">{t.appName}</h1>
        <p className="mt-3 max-w-xl text-base text-muted">{t.lede}</p>
        <p className="mt-6 text-xs text-faint">
          <span className="mr-2 inline-block size-1.5 rounded-full bg-up align-middle motion-safe:animate-pulse" />
          {t.asOf(tenor, t.date(asOf))}
        </p>
        <p className="font-serif text-6xl tabular-nums text-fg md:text-7xl">
          {shownY.toFixed(2)}
          <span className="text-3xl text-muted">%</span>
        </p>
        <p className="mt-2 max-w-xl text-xs text-faint">{t.feed[source]}</p>
      </header>

      <div className="sticky top-0 z-30 mt-6 border-y border-line bg-bg/95 backdrop-blur-md">
        <div className="mx-auto grid max-w-6xl grid-cols-5 gap-2 px-4 py-3 md:px-8" role="tablist" aria-label={t.tenorAria}>
          {TENORS.map((item) => {
            const active = item === tenor;
            return (
              <button
                key={item}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setTenor(item)}
                className={
                  active
                    ? "flex h-12 flex-col items-center justify-center rounded-md bg-accent text-accent-fg"
                    : "flex h-12 flex-col items-center justify-center rounded-md border border-line text-fg"
                }
              >
                <span className="text-sm font-medium leading-none">{t.tenor(item)}</span>
                <span className="mt-1 text-xs tabular-nums leading-none opacity-70">{pct(yieldOf(spot, item))}</span>
              </button>
            );
          })}
        </div>
        <nav className="mx-auto flex max-w-6xl items-center gap-4 overflow-x-auto px-4 pb-3 text-sm md:px-8" aria-label={t.navAria}>
          {jumps.map(([href, label]) => (
            <a key={href} href={href} className="shrink-0 text-muted">
              {label}
            </a>
          ))}
          {lang === "zh-Hans" ? (
            <a href="#access" className="shrink-0 text-muted">
              途径
            </a>
          ) : null}
          <button type="button" onClick={() => setShockBp(0)} className="ml-auto shrink-0 text-faint">
            {t.reset}
          </button>
        </nav>
      </div>

      <div className="mx-auto mt-8 max-w-6xl px-4 md:px-8">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <article className="rounded-lg border border-line bg-elevated px-4 py-4 shadow-lg">
            <p className="text-xs text-faint">{t.principal}</p>
            <p className="mt-2 font-serif text-2xl tabular-nums text-fg md:text-3xl">{money(principal, ccy)}</p>
          </article>
          <article className="rounded-lg border border-line bg-elevated px-4 py-4 shadow-lg">
            <p className="text-xs text-faint">{t.semi}</p>
            <p className="mt-2 font-serif text-2xl tabular-nums text-up md:text-3xl">{money(semi, ccy, 2)}</p>
          </article>
          <article className="rounded-lg border border-line bg-elevated px-4 py-4 shadow-lg">
            <p className="text-xs text-faint">{t.cash.total}</p>
            <p className="mt-2 font-serif text-2xl tabular-nums text-fg md:text-3xl">{money(principal + interest, ccy)}</p>
          </article>
          <article className="rounded-lg border border-line bg-elevated px-4 py-4 shadow-lg">
            <p className="text-xs text-faint">
              <Term tip={t.tips.duration}>{t.modDur}</Term>
            </p>
            <p className="mt-2 font-serif text-2xl tabular-nums text-fg md:text-3xl">{t.years(dur.toFixed(1))}</p>
          </article>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2">
          {presets.map((value) => {
            const preview = (value * y) / 100 / 2;
            const active = principal === value;
            return (
              <button
                key={value}
                type="button"
                onClick={() => setPrincipal(value)}
                className={
                  active
                    ? "rounded-lg border border-fg bg-subtle px-3 py-3 text-left shadow-lg"
                    : "rounded-lg border border-line bg-elevated px-3 py-3 text-left"
                }
              >
                <span className="block text-sm font-medium text-fg">{t.preset(value)}</span>
                <span className="mt-1 block text-xs tabular-nums text-muted">{t.presetHint(money(preview, ccy, 2))}</span>
              </button>
            );
          })}
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <label className="flex h-11 items-center gap-2 rounded-md border border-line px-3 text-sm">
            <span className="text-faint">{t.principal}</span>
            <input
              type="number"
              min={1000}
              max={100000000}
              step={1000}
              value={principal}
              aria-label={t.principalAria}
              onChange={(event) => {
                const next = event.target.valueAsNumber;
                if (Number.isFinite(next)) setPrincipal(next);
              }}
              onBlur={() => {
                if (principal < 1000) setPrincipal(1000);
              }}
              className="w-28 bg-transparent text-fg tabular-nums outline-none"
            />
            <span className="text-faint">{t.usd}</span>
          </label>
          <div className="flex h-11 rounded-md border border-line p-1">
            {(["USD", "HKD"] as const).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setCcy(item)}
                aria-pressed={ccy === item}
                className={
                  ccy === item
                    ? "rounded-sm bg-accent px-3 text-sm font-medium text-accent-fg"
                    : "px-3 text-sm text-muted"
                }
              >
                {item === "USD" ? t.usd : t.hkd}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-4">
          <button
            type="button"
            aria-pressed={ladder}
            onClick={() => setLadder((on) => !on)}
            className={
              ladder
                ? "h-11 rounded-md bg-accent px-3 text-sm font-medium text-accent-fg"
                : "h-11 rounded-md border border-line px-3 text-sm text-fg"
            }
          >
            {t.play.ladder}
          </button>
          {ladder ? (
            <p className="mt-3 max-w-2xl text-sm text-muted">
              {t.play.ladderNote(
                money(ladderBook(principal, spot).semi, ccy, 2),
                money(ladderBook(principal, spot).total, ccy),
                t.years(ladderBook(principal, spot).dur.toFixed(1)),
              )}
            </p>
          ) : null}
        </div>

        <p className="mt-6 max-w-2xl text-sm text-muted">{t.intro}</p>
        <More>
          <p>{t.introMore}</p>
        </More>
        <HeroChart />
      </div>

      <div className="mx-auto mt-10 grid min-w-0 max-w-6xl gap-8 px-4 md:px-8">
        <CashflowPanel />
        <ShockPanel />
        <HoldPanel />
        <BacktestPanel />
        <OutlookPanel />
        <AccessPanel />
      </div>

      <footer className="mx-auto mt-12 max-w-6xl px-4 text-xs text-faint md:px-8">
        {lang !== "zh-Hans" ? (
          <p className="mb-4 text-sm text-muted">
            {lang === "en"
              ? "If you are a mainland client and want to know how to buy US Treasuries, "
              : "如果你是國內客戶，想了解購買美國國債的方法，"}
            <button type="button" onClick={openAccess} className="text-fg underline">
              {lang === "en" ? "click here" : "請點擊這裡"}
            </button>
            {lang === "en" ? "." : "。"}
          </p>
        ) : null}
        <p>{t.footer(t.date(asOf))}</p>
      </footer>
    </main>
  );
}
