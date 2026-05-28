import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import { scoreToPercent } from "@/lib/cardholder";

interface Props {
  score: number;
  size?: number;
}

export function ScoreGauge({ score, size = 200 }: Props) {
  const pct = scoreToPercent(score);
  const data = [
    { name: "score", value: pct },
    { name: "remainder", value: 100 - pct },
  ];

  return (
    <div className="relative mx-auto" style={{ width: size, height: size * 0.65 }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="85%"
            startAngle={180}
            endAngle={0}
            innerRadius="70%"
            outerRadius="100%"
            paddingAngle={0}
            dataKey="value"
            stroke="none"
          >
            <Cell fill="#EB001B" />
            <Cell fill="var(--color-muted)" />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-end pb-2">
        <span className="text-4xl font-bold tabular-nums text-[#EB001B]">{pct}%</span>
        <span className="text-xs text-[var(--color-muted-foreground)]">
          Commercial Activity
        </span>
      </div>
    </div>
  );
}
