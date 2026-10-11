import { useEffect, useRef, useState, type ReactNode } from "react";
import { useT } from "@/components/treasury/state";
import * as Slider from "@radix-ui/react-slider";

export function useTween(target: number, ms = 280): number {
  const [value, setValue] = useState(target);
  const from = useRef(target);
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || Math.abs(from.current - target) < 1e-6) {
      from.current = target;
      setValue(target);
      return;
    }
    const start = performance.now();
    const origin = from.current;
    let frame = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / ms);
      const eased = 1 - (1 - t) ** 3;
      const next = origin + (target - origin) * eased;
      setValue(next);
      if (t < 1) frame = requestAnimationFrame(tick);
      else from.current = target;
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, ms]);
  return value;
}

export function Panel({
  id,
  index,
  title,
  lede,
  children,
}: {
  id: string;
  index: string;
  title: string;
  lede: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-40 min-w-0 rounded-xl border border-line bg-elevated p-5 shadow-lg md:p-7">
      <p className="text-xs font-medium text-faint">{index}</p>
      <h2 className="mt-1 font-serif text-2xl text-fg md:text-3xl">{title}</h2>
      <p className="mt-2 max-w-2xl text-sm text-muted">{lede}</p>
      <div className="mt-5">{children}</div>
    </section>
  );
}

export function Stat({
  label,
  value,
  hint,
  tone = "fg",
}: {
  label: ReactNode;
  value: string;
  hint?: string;
  tone?: "fg" | "up" | "down";
}) {
  const toneClass = tone === "up" ? "text-up" : tone === "down" ? "text-down" : "text-fg";
  return (
    <div className="rounded-lg border border-line bg-subtle px-4 py-4 shadow-lg">
      <div className="text-xs text-faint">{label}</div>
      <p className={`mt-2 font-serif text-3xl font-medium tabular-nums transition-colors duration-300 ${toneClass}`}>{value}</p>
      {hint ? <p className="mt-1 text-xs text-muted">{hint}</p> : null}
    </div>
  );
}

export function Term({ children, tip }: { children: ReactNode; tip: string }) {
  const [open, setOpen] = useState(false);
  return (
    <span className="inline">
      {children}
      <button
        type="button"
        aria-expanded={open}
        aria-label={tip}
        onClick={() => setOpen((value) => !value)}
        className="ml-1 inline-grid size-4 translate-y-0.5 place-items-center rounded-full border border-line text-[10px] leading-none text-faint"
      >
        ?
      </button>
      {open ? <span className="mt-1 block text-xs font-normal text-muted">{tip}</span> : null}
    </span>
  );
}

export function More({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const t = useT();
  return (
    <div className="mt-4">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="text-sm text-faint"
      >
        {open ? t.less : t.more}
      </button>
      {open ? <div className="mt-3 space-y-3 text-sm text-muted">{children}</div> : null}
    </div>
  );
}

export function Close({ children }: { children: ReactNode }) {
  return <p className="mt-5 border-t border-line pt-4 text-sm text-fg">{children}</p>;
}

export function WhenMounted({ children, className }: { children: ReactNode; className?: string }) {
  const [on, setOn] = useState(false);
  useEffect(() => setOn(true), []);
  return <div className={className}>{on ? children : null}</div>;
}

export function BpSlider({
  value,
  min,
  max,
  onChange,
}: {
  value: number;
  min: number;
  max: number;
  onChange: (next: number) => void;
}) {
  const clamped = Math.min(max, Math.max(min, value));
  const zero = ((0 - min) / (max - min)) * 100;
  const t = useT();
  const move = clamped > 0 ? t.shock.bpUp(clamped) : clamped < 0 ? t.shock.bpDown(Math.abs(clamped)) : t.shock.bpFlat;
  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between gap-3 text-xs text-faint">
        <span>{t.shock.nearZero}</span>
        <span className="font-medium text-fg tabular-nums">{move}</span>
        <span>{t.shock.plusMax(max)}</span>
      </div>
      <Slider.Root
        value={[clamped]}
        min={min}
        max={max}
        step={5}
        onValueChange={(next) => onChange(next[0] ?? 0)}
        aria-label={t.shock.sliderAria}
        className="relative flex h-11 w-full touch-none items-center select-none"
      >
        <Slider.Track className="relative h-px w-full grow bg-line">
          <span
            className="absolute top-1/2 h-3 w-px -translate-x-1/2 -translate-y-1/2 bg-faint"
            style={{ left: `${zero}%` }}
          />
        </Slider.Track>
        <Slider.Thumb className="block size-6 rounded-full border border-line bg-accent" />
      </Slider.Root>
      <div className="relative mt-1 h-4 text-xs text-faint">
        <span className="absolute -translate-x-1/2" style={{ left: `${zero}%` }}>
          {t.shock.todayMark}
        </span>
      </div>
    </div>
  );
}

export function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={
        active
          ? "h-11 rounded-md bg-accent px-3 text-sm font-medium text-accent-fg"
          : "h-11 rounded-md border border-line bg-subtle px-3 text-sm font-medium text-fg"
      }
    >
      {children}
    </button>
  );
}
