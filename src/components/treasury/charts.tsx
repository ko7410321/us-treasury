type TipRow = { name?: string; value?: number | string; color?: string; dataKey?: string | number };

export function ChartTip({
  active,
  payload,
  label,
  format,
}: {
  active?: boolean;
  payload?: TipRow[];
  label?: string;
  format: (value: number, key: string) => string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-md border border-line bg-elevated px-3 py-2 text-xs">
      <p className="text-faint">{label}</p>
      <ul className="mt-1 space-y-1">
        {payload.map((row) => {
          const key = String(row.dataKey ?? row.name ?? "");
          const raw = typeof row.value === "number" ? row.value : Number(row.value);
          return (
            <li key={key} className="flex items-center justify-between gap-4 text-fg">
              <span className="text-muted">{row.name}</span>
              <span className="tabular-nums">{Number.isFinite(raw) ? format(raw, key) : "—"}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export const axisTick = { fill: "var(--color-faint)", fontSize: 11 };
export const gridStroke = "var(--color-line)";
