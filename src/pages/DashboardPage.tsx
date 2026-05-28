import {
  AlertCircle,
  Banknote,
  Building2,
  Gauge,
  TrendingUp,
  Users,
} from "lucide-react";
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
import { DataLoadState } from "@/components/DataLoadState";
import { PageShell } from "@/components/PageShell";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useDirectorDashboardData } from "@/hooks/useDirectorDashboardData";
import type { CardholderScore, SegmentSummary } from "@/lib/api";
import {
  cn,
  formatKzt,
  formatMillionsKzt,
  formatPercent,
} from "@/lib/utils";

const SEGMENT_COLORS: Record<string, string> = {
  High: "#dc2626",
  Medium: "#d97706",
  Low: "#6b7280",
};

const SEGMENT_ORDER = ["High", "Medium", "Low"] as const;

export function DashboardPage() {
  const { loading, error, scores, segments, reload } =
    useDirectorDashboardData();

  const totalCardholders = scores.length;
  const hiddenEntrepreneurs = scores.filter(
    (s) => s.risk_segment === "High",
  ).length;
  const highRevenueOpportunity = scores
    .filter((s) => s.risk_segment === "High")
    .reduce((sum, s) => sum + s.expected_value_kzt, 0);
  const avgConfidence =
    scores.length > 0
      ? scores.reduce((sum, s) => sum + s.commercial_activity_score, 0) /
        scores.length
      : 0;

  const pieData = SEGMENT_ORDER.map((segment) => ({
    name: segment,
    value: scores.filter((s) => s.risk_segment === segment).length,
  })).filter((d) => d.value > 0);

  const topBanks = getTopBanksByHighOpportunity(scores);

  const sortedSegments = [...segments].sort(
    (a, b) =>
      SEGMENT_ORDER.indexOf(a.risk_segment as (typeof SEGMENT_ORDER)[number]) -
      SEGMENT_ORDER.indexOf(b.risk_segment as (typeof SEGMENT_ORDER)[number]),
  );

  return (
    <PageShell
      title="Director Dashboard"
      description="Executive view of hidden entrepreneur signals and portfolio opportunity across Kazakhstan"
      className="pb-10"
    >
      <DataLoadState
        loading={loading}
        error={error}
        onRetry={reload}
        skeleton="dashboard"
      >
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <KpiCard
            icon={Users}
            label="Total Consumer Cardholders Analyzed"
            value={totalCardholders.toLocaleString()}
            accent="bg-blue-50 text-blue-700"
          />
          <KpiCard
            icon={TrendingUp}
            label="Potential Hidden Entrepreneurs"
            value={hiddenEntrepreneurs.toLocaleString()}
            accent="bg-red-50 text-red-700"
          />
          <KpiCard
            icon={Banknote}
            label="Estimated Revenue Opportunity"
            value={formatMillionsKzt(highRevenueOpportunity)}
            accent="bg-amber-50 text-amber-800"
          />
          <KpiCard
            icon={Gauge}
            label="Average Confidence Score"
            value={formatPercent(avgConfidence, 1)}
            accent="bg-slate-100 text-slate-700"
          />
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Opportunity Distribution</CardTitle>
              <CardDescription>
                Cardholders by risk segment across the analyzed portfolio
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={95}
                    paddingAngle={2}
                    label={({ name, percent }) =>
                      `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
                    }
                  >
                    {pieData.map((entry) => (
                      <Cell
                        key={entry.name}
                        fill={SEGMENT_COLORS[entry.name] ?? "#888"}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value, name) => [
                      `${Number(value ?? 0)} cardholders`,
                      String(name),
                    ]}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Top Banks by High-Opportunity Customers</CardTitle>
              <CardDescription>
                Issuing banks with the most High-segment cardholders
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={topBanks}
                  layout="vertical"
                  margin={{ left: 8, right: 16 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" allowDecimals={false} />
                  <YAxis
                    type="category"
                    dataKey="bank"
                    width={110}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip
                    formatter={(value) => [
                      `${Number(value ?? 0)} high-opportunity`,
                      "Cardholders",
                    ]}
                  />
                  <Bar
                    dataKey="count"
                    fill="#dc2626"
                    radius={[0, 4, 4, 0]}
                    name="High segment"
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-start justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-[#EB001B]" />
                Segment Summary
              </CardTitle>
              <CardDescription>
                Portfolio segmentation with recommended products and conversion
                outlook
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="overflow-x-auto p-0 pb-6">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="border-b border-[var(--color-border)] bg-slate-50/80 text-left text-xs font-semibold uppercase tracking-wide text-[var(--color-muted-foreground)]">
                  <th className="px-6 py-3">Segment</th>
                  <th className="px-4 py-3 text-right">Cardholders</th>
                  <th className="px-4 py-3 text-right">Avg Score</th>
                  <th className="px-4 py-3">Recommended Product</th>
                  <th className="px-4 py-3 text-right">Conv. Rate</th>
                  <th className="px-6 py-3 text-right">Opportunity Value (KZT)</th>
                </tr>
              </thead>
              <tbody>
                {sortedSegments.map((row) => (
                  <SegmentTableRow key={row.risk_segment} row={row} />
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        <div
          role="note"
          className="flex items-start gap-3 rounded-lg border border-amber-200/80 bg-amber-50/90 px-5 py-4 text-sm text-amber-950 shadow-sm"
        >
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />
          <p>
            This system provides a business opportunity signal, not a final
            legal or compliance decision.
          </p>
        </div>
      </DataLoadState>
    </PageShell>
  );
}

function KpiCard({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  accent: string;
}) {
  return (
    <Card className="overflow-hidden shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 space-y-2">
            <p className="text-xs font-medium leading-snug text-[var(--color-muted-foreground)]">
              {label}
            </p>
            <p className="text-2xl font-bold tracking-tight tabular-nums text-[var(--color-foreground)]">
              {value}
            </p>
          </div>
          <div
            className={cn(
              "flex h-11 w-11 shrink-0 items-center justify-center rounded-lg",
              accent,
            )}
          >
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function SegmentTableRow({ row }: { row: SegmentSummary }) {
  const segment = row.risk_segment;
  const rowStyles: Record<string, string> = {
    High: "bg-red-50/70 border-l-4 border-l-red-500",
    Medium: "bg-orange-50/60 border-l-4 border-l-orange-500",
    Low: "bg-slate-50 border-l-4 border-l-slate-400",
  };

  return (
    <tr
      className={cn(
        "border-b border-[var(--color-border)] transition-colors",
        rowStyles[segment] ?? "",
      )}
    >
      <td className="px-6 py-4 font-semibold">{segment}</td>
      <td className="px-4 py-4 text-right tabular-nums">
        {row.number_of_cardholders.toLocaleString()}
      </td>
      <td className="px-4 py-4 text-right tabular-nums">
        {formatPercent(row.average_score, 0)}
      </td>
      <td className="px-4 py-4">{row.recommended_product}</td>
      <td className="px-4 py-4 text-right tabular-nums">
        {formatPercent(row.estimated_conversion_rate, 0)}
      </td>
      <td className="px-6 py-4 text-right font-medium tabular-nums">
        {formatKzt(row.estimated_opportunity_value)}
      </td>
    </tr>
  );
}

function getTopBanksByHighOpportunity(scores: CardholderScore[]) {
  const counts = new Map<string, number>();
  for (const s of scores) {
    if (s.risk_segment !== "High") continue;
    counts.set(s.bank_name, (counts.get(s.bank_name) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([bank, count]) => ({ bank, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
}
