import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { TENORS, yieldOf } from "@/lib/market";
import { useDesk, useT } from "@/components/treasury/state";
import { ChartTip, axisTick } from "@/components/treasury/charts";
import { WhenMounted } from "@/components/treasury/ui";

export function HeroChart() {
  const { setTenor, spot } = useDesk();
  const t = useT();
  const data = TENORS.map((item) => ({
    name: t.tenor(item),
    tenor: item,
    y: yieldOf(spot, item),
  }));

  return (
    <WhenMounted className="mt-6 h-36 w-full min-w-0">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
          onClick={(state) => {
            const next = state?.activePayload?.[0]?.payload?.tenor as number | undefined;
            if (next === 2 || next === 5 || next === 7 || next === 10 || next === 30) setTenor(next);
          }}
        >
          <XAxis dataKey="name" tick={axisTick} axisLine={false} tickLine={false} />
          <YAxis
            domain={["dataMin - 0.3", "dataMax + 0.3"]}
            tick={axisTick}
            axisLine={false}
            tickLine={false}
            width={42}
            tickFormatter={(value: number) => value.toFixed(1)}
          />
          <Tooltip content={<ChartTip format={(value) => `${value.toFixed(2)}%`} />} />
          <Line
            type="monotone"
            dataKey="y"
            name={t.chart.yield}
            stroke="var(--color-fg)"
            strokeWidth={1.5}
            dot={{ r: 4, fill: "var(--color-fg)", stroke: "var(--color-bg)", strokeWidth: 1 }}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </WhenMounted>
  );
}
