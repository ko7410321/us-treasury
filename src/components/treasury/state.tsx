import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { COPY, htmlLang, type Lang } from "@/lib/copy";
import { HISTORY, type YieldPoint } from "@/lib/history";
import { SPOT, SCENARIOS, type CurveBook, type ScenarioId, type Tenor } from "@/lib/market";
import type { CurvePayload, CurveSource } from "@/lib/curve";
import { refreshCurve } from "@/lib/curve.functions";
import type { Ccy } from "@/lib/money";

type DeskValue = {
  tenor: Tenor;
  setTenor: (tenor: Tenor) => void;
  principal: number;
  setPrincipal: (next: number) => void;
  shockBp: number;
  setShockBp: (next: number) => void;
  ccy: Ccy;
  setCcy: (next: Ccy) => void;
  lang: Lang;
  setLang: (next: Lang) => void;
  book: CurveBook;
  spot: YieldPoint;
  asOf: string;
  source: CurveSource;
  weights: Record<ScenarioId, number>;
  setWeight: (id: ScenarioId, percent: number) => void;
};

const DeskContext = createContext<DeskValue | null>(null);

export function useDesk(): DeskValue {
  const value = useContext(DeskContext);
  if (!value) throw new Error("Desk context missing");
  return value;
}

export function useT() {
  const { lang } = useDesk();
  return COPY[lang];
}

const FALLBACK: CurvePayload = {
  history: HISTORY,
  spot: SPOT,
  source: "bundled",
  fetchedAt: 0,
};

const DEFAULT_WEIGHTS: Record<ScenarioId, number> = {
  ease: SCENARIOS[0].prob,
  firm: SCENARIOS[1].prob,
  slump: SCENARIOS[2].prob,
};

export function DeskState({ children, initial }: { children: ReactNode; initial?: CurvePayload | null }) {
  const [tenor, setTenor] = useState<Tenor>(10);
  const [principal, setPrincipalRaw] = useState(100_000);
  const [shockBp, setShockBp] = useState(100);
  const [ccy, setCcy] = useState<Ccy>("USD");
  const [lang, setLangState] = useState<Lang>("zh-Hant");
  const [curve, setCurve] = useState<CurvePayload>(initial ?? FALLBACK);
  const [weights, setWeights] = useState<Record<ScenarioId, number>>(DEFAULT_WEIGHTS);

  const setPrincipal = useCallback((next: number) => {
    if (!Number.isFinite(next)) return;
    setPrincipalRaw(Math.min(100_000_000, Math.max(0, Math.round(next))));
  }, []);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    localStorage.setItem("treasury-lang", next);
  }, []);

  const setWeight = useCallback((id: ScenarioId, percent: number) => {
    setWeights((prev) => {
      const next = Math.min(100, Math.max(0, percent)) / 100;
      const others = (["ease", "firm", "slump"] as ScenarioId[]).filter((key) => key !== id);
      const rest = 1 - next;
      const sum = others.reduce((total, key) => total + prev[key], 0) || 1;
      const out = { ...prev, [id]: next };
      for (const key of others) out[key] = (rest * prev[key]) / sum;
      return out;
    });
  }, []);

  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const tenorN = Number(q.get("t"));
    if (tenorN === 2 || tenorN === 5 || tenorN === 7 || tenorN === 10 || tenorN === 30) setTenor(tenorN);
    const principalN = Number(q.get("p"));
    if (Number.isFinite(principalN) && principalN >= 1000) setPrincipal(principalN);
    const bp = Number(q.get("bp"));
    if (Number.isFinite(bp)) setShockBp(Math.round(bp));
    const currency = q.get("c");
    if (currency === "USD" || currency === "HKD") setCcy(currency);
    const langQ = q.get("lang");
    if (langQ === "zh-Hant" || langQ === "zh-Hans" || langQ === "en") setLangState(langQ);
    else {
      const saved = localStorage.getItem("treasury-lang");
      if (saved === "zh-Hant" || saved === "zh-Hans" || saved === "en") setLangState(saved);
    }
    const raw = q.get("w");
    if (raw) {
      const [ease, firm, slump] = raw.split(",").map(Number);
      if ([ease, firm, slump].every((n) => Number.isFinite(n))) {
        const sum = ease + firm + slump || 1;
        setWeights({ ease: ease / sum, firm: firm / sum, slump: slump / sum });
      }
    }
  }, [setPrincipal]);

  useEffect(() => {
    document.documentElement.lang = htmlLang(lang);
    document.title = COPY[lang].appName;
  }, [lang]);

  useEffect(() => {
    if (initial) setCurve(initial);
  }, [initial]);

  useEffect(() => {
    const fresh = Date.now() - curve.fetchedAt < 6 * 60 * 60 * 1000 && curve.source !== "bundled";
    if (fresh) return;
    let cancel = false;
    const apply = (next: CurvePayload | null | undefined) => {
      if (!cancel && next?.spot) setCurve(next);
    };
    refreshCurve()
      .then((next) => {
        if (next?.spot) apply(next);
        else return fetch(`${import.meta.env.BASE_URL}curve.json`).then((res) => (res.ok ? res.json() : null)).then(apply);
      })
      .catch(() => {
        fetch(`${import.meta.env.BASE_URL}curve.json`)
          .then((res) => (res.ok ? res.json() : null))
          .then(apply)
          .catch(() => undefined);
      });
    return () => {
      cancel = true;
    };
  }, [curve.fetchedAt, curve.source]);

  const book = useMemo(() => ({ history: curve.history, spot: curve.spot }), [curve.history, curve.spot]);

  const value = useMemo(
    () => ({
      tenor,
      setTenor,
      principal,
      setPrincipal,
      shockBp,
      setShockBp,
      ccy,
      setCcy,
      lang,
      setLang,
      book,
      spot: curve.spot,
      asOf: curve.spot.d,
      source: curve.source,
      weights,
      setWeight,
    }),
    [tenor, principal, setPrincipal, shockBp, ccy, lang, setLang, book, curve.spot, curve.source, weights, setWeight],
  );

  return <DeskContext.Provider value={value}>{children}</DeskContext.Provider>;
}