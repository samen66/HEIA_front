import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { SegmentSummary } from "@/lib/api";
import { formatKzt } from "@/lib/utils";

const COLORS: Record<string, string> = {
  High: "#dc2626",
  Medium: "#d97706",
  Low: "#059669",
};

interface Props {
  segments: SegmentSummary[];
}

export function SegmentChart({ segments }: Props) {
  const pieData = segments.map((s) => ({
    name: s.risk_segment,
    value: s.number_of_cardholders,
  }));

  const barData = segments.map((s) => ({
    segment: s.risk_segment,
    opportunity: s.estimated_opportunity_value / 1_000_000,
    conversion: (s.estimated_conversion_rate * 100).toFixed(0),
  }));

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Portfolio by Risk Segment</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={90}
                label={({ name, percent }) =>
                  `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
                }
              >
                {pieData.map((entry) => (
                  <Cell key={entry.name} fill={COLORS[entry.name] ?? "#888"} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Opportunity Value (M KZT)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="segment" />
              <YAxis tickFormatter={(v) => `${v}M`} />
              <Tooltip
                formatter={(value) => [
                  formatKzt(Number(value ?? 0) * 1_000_000),
                  "Opportunity",
                ]}
              />
              <Bar dataKey="opportunity" radius={[4, 4, 0, 0]}>
                {barData.map((entry) => (
                  <Cell
                    key={entry.segment}
                    fill={COLORS[entry.segment] ?? "#888"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
