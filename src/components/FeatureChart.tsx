import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { FeatureImportance } from "@/lib/api";
import { cn } from "@/lib/utils";

interface Props {
  features: FeatureImportance[];
  viewMode?: "full" | "summary";
}

const TOP_FEATURE_COLOR = "#EB001B";
const OTHER_FEATURE_COLOR = "#9ca3af";

function formatFeatureLabel(name: string): string {
  return name.replace(/_/g, " ");
}

export function FeatureChart({ features, viewMode = "full" }: Props) {
  const isFull = viewMode === "full";
  const sorted = [...features].sort(
    (a, b) => b.importance_value - a.importance_value,
  );
  const displayFeatures = isFull ? sorted : sorted.slice(0, 5);

  const chartData = displayFeatures.map((f, index) => ({
    name: formatFeatureLabel(f.feature_name),
    importance: Number((f.importance_value * 100).toFixed(1)),
    rank: index + 1,
    meaning: f.business_meaning,
    feature_name: f.feature_name,
    importance_value: f.importance_value,
  }));

  return (
    <div className="space-y-6">
      <p className="rounded-lg border border-[var(--color-border)] bg-[var(--color-accent)]/40 px-4 py-3 text-sm text-[var(--color-foreground)]">
        These features explain why certain cardholders are flagged as potential
        hidden entrepreneurs.
      </p>

      <Card>
        <CardHeader>
          <CardTitle>Feature importance</CardTitle>
          <CardDescription>
            {isFull
              ? "All model drivers ranked by LightGBM gain"
              : "Top 5 drivers — executive summary"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={isFull ? 360 : 260}>
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ left: 8, right: 24, top: 8, bottom: 8 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis
                type="number"
                unit="%"
                domain={[0, "dataMax"]}
                tick={{ fontSize: 11 }}
              />
              <YAxis
                type="category"
                dataKey="name"
                width={isFull ? 160 : 140}
                tick={{ fontSize: 10 }}
              />
              <Tooltip
                formatter={(value) => [`${value}%`, "Importance"]}
                labelFormatter={(_, payload) => {
                  if (!isFull) return payload?.[0]?.payload?.name ?? "";
                  return payload?.[0]?.payload?.meaning ?? "";
                }}
              />
              <Bar dataKey="importance" radius={[0, 4, 4, 0]}>
                {chartData.map((entry) => (
                  <Cell
                    key={entry.feature_name}
                    fill={
                      entry.rank <= 3 ? TOP_FEATURE_COLOR : OTHER_FEATURE_COLOR
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Feature reference</CardTitle>
          {!isFull && (
            <CardDescription>
              Business meaning hidden for executive view
            </CardDescription>
          )}
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full min-w-[480px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)] text-left">
                <th className="pb-3 pr-4 font-semibold text-[var(--color-muted-foreground)]">
                  Feature
                </th>
                <th className="pb-3 pr-4 font-semibold text-[var(--color-muted-foreground)]">
                  Importance
                </th>
                {isFull && (
                  <th className="pb-3 font-semibold text-[var(--color-muted-foreground)]">
                    Business meaning
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {displayFeatures.map((f, index) => (
                <tr
                  key={f.feature_name}
                  className="border-b border-[var(--color-border)]/60 last:border-0"
                >
                  <td className="py-3 pr-4 font-medium">
                    <span
                      className={cn(
                        index < 3 && "text-[#EB001B]",
                      )}
                    >
                      {formatFeatureLabel(f.feature_name)}
                    </span>
                  </td>
                  <td className="py-3 pr-4 tabular-nums">
                    {(f.importance_value * 100).toFixed(1)}%
                  </td>
                  {isFull && (
                    <td className="py-3 text-[var(--color-muted-foreground)]">
                      {f.business_meaning}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
