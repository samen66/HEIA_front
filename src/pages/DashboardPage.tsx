import {
  AlertCircle,
  Banknote,
  Building2,
  Gauge,
  Target,
  TrendingUp,
  Users,
} from "lucide-react";
import type { TFunction } from "i18next";
import { useTranslation } from "react-i18next";
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
import type { SegmentSummary } from "@/lib/api";
import { translateSegment } from "@/lib/i18nLabels";
import {
  cn,
  formatKzt,
  formatMillionsKzt,
  formatPercent,
} from "@/lib/utils";

const BAND_ORDER = [
  "Top 1% highest priority",
  "Top 5% priority",
  "Top 10% review",
  "Standard monitoring",
] as const;

const BAND_COLORS: Record<string, string> = {
  "Top 1% highest priority": "#7f1d1d",
  "Top 5% priority": "#dc2626",
  "Top 10% review": "#ea580c",
  "Standard monitoring": "#6b7280",
};

const BAND_SHORT_LABELS: Record<string, string> = {
  "Top 1% highest priority": "Top 1%",
  "Top 5% priority": "Top 5%",
  "Top 10% review": "Top 10%",
  "Standard monitoring": "Standard",
};

function segmentBand(row: SegmentSummary): string {
  return row.opportunity_segment ?? row.risk_segment;
}

export function DashboardPage() {
  const { t } = useTranslation();
  const { loading, error, kpi, segments, banks, products, reload } =
    useDirectorDashboardData();

  const pieData = BAND_ORDER.map((band) => {
    const row = segments.find((s) => segmentBand(s) === band);
    return {
      name: BAND_SHORT_LABELS[band] ?? band,
      band,
      value: row?.number_of_cardholders ?? 0,
    };
  }).filter((d) => d.value > 0);

  const topBanks = [...banks]
    .map((b) => ({
      bank: b.bank_name,
      value: b.estimated_opportunity_value,
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

  const productLeadData = [...products]
    .filter((p) => p.recommended_action !== "Monitor only")
    .map((p) => ({
      action: p.recommended_action,
      count: p.number_of_cardholders,
    }))
    .sort((a, b) => b.count - a.count);

  const sortedSegments = [...segments].sort(
    (a, b) =>
      BAND_ORDER.indexOf(
        segmentBand(a) as (typeof BAND_ORDER)[number],
      ) -
      BAND_ORDER.indexOf(segmentBand(b) as (typeof BAND_ORDER)[number]),
  );

  return (
    <PageShell
      title={t("dashboard.title")}
      description={t("dashboard.description")}
      className="pb-10"
    >
      <DataLoadState
        loading={loading}
        error={error}
        onRetry={reload}
        skeleton="dashboard"
      >
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <KpiCard
            icon={Users}
            label={t("dashboard.total_scored")}
            value={(kpi?.total_scored_consumers ?? 0).toLocaleString()}
            accent="bg-blue-50 text-blue-700"
          />
          <KpiCard
            icon={Target}
            label={t("dashboard.top1_priority")}
            value={(kpi?.top_1_percent_candidates ?? 0).toLocaleString()}
            accent="bg-red-100 text-red-900"
          />
          <KpiCard
            icon={TrendingUp}
            label={t("dashboard.top5_priority")}
            value={(kpi?.top_5_percent_candidates ?? 0).toLocaleString()}
            accent="bg-red-50 text-red-700"
          />
          <KpiCard
            icon={TrendingUp}
            label={t("dashboard.top10_review")}
            value={(kpi?.top_10_percent_candidates ?? 0).toLocaleString()}
            accent="bg-orange-50 text-orange-700"
          />
          <KpiCard
            icon={Banknote}
            label={t("dashboard.total_opportunity")}
            value={formatMillionsKzt(kpi?.estimated_total_opportunity_kzt ?? 0)}
            accent="bg-amber-50 text-amber-800"
          />
          <KpiCard
            icon={Gauge}
            label={t("dashboard.avg_score")}
            value={formatPercent(kpi?.average_score ?? 0, 1)}
            accent="bg-slate-100 text-slate-700"
          />
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>{t("dashboard.opportunity_distribution")}</CardTitle>
              <CardDescription>
                Cardholders by priority band across the analyzed portfolio
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
                        key={entry.band}
                        fill={BAND_COLORS[entry.band] ?? "#888"}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value, _name, item) => [
                      `${Number(value ?? 0).toLocaleString()} cardholders`,
                      String(item.payload?.band ?? _name),
                    ]}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>{t("dashboard.top_banks")}</CardTitle>
              <CardDescription>
                Issuing banks ranked by total estimated opportunity (KZT)
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
                  <XAxis
                    type="number"
                    tickFormatter={(v) => formatMillionsKzt(Number(v))}
                  />
                  <YAxis
                    type="category"
                    dataKey="bank"
                    width={110}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip
                    formatter={(value) => [
                      formatKzt(Number(value ?? 0)),
                      "Estimated value",
                    ]}
                  />
                  <Bar
                    dataKey="value"
                    fill="#dc2626"
                    radius={[0, 4, 4, 0]}
                    name="Opportunity value"
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>{t("dashboard.recommended_actions")}</CardTitle>
            <CardDescription>
              Product actions ranked by number of cardholders in each lead pool
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart
                data={productLeadData}
                margin={{ bottom: 80, left: 8, right: 16 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="action"
                  tick={{ fontSize: 11 }}
                  interval={0}
                  angle={-28}
                  textAnchor="end"
                  height={90}
                />
                <YAxis allowDecimals={false} />
                <Tooltip
                  formatter={(value) => [
                    `${Number(value ?? 0).toLocaleString()} cardholders`,
                    "Lead count",
                  ]}
                />
                <Bar
                  dataKey="count"
                  fill="#2563eb"
                  radius={[4, 4, 0, 0]}
                  name="Lead count"
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-start justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-[#EB001B]" />
                Segment Summary
              </CardTitle>
              <CardDescription>
                Portfolio bands with recommended products and conversion outlook
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="overflow-x-auto p-0 pb-6">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="border-b border-[var(--color-border)] bg-slate-50/80 text-left text-xs font-semibold uppercase tracking-wide text-[var(--color-muted-foreground)]">
                  <th className="px-6 py-3">Band</th>
                  <th className="px-4 py-3 text-right">Count</th>
                  <th className="px-4 py-3 text-right">Avg Score</th>
                  <th className="px-4 py-3">Recommended Product</th>
                  <th className="px-4 py-3 text-right">Conv. Rate</th>
                  <th className="px-6 py-3 text-right">Opportunity Value (KZT)</th>
                </tr>
              </thead>
              <tbody>
                {sortedSegments.map((row) => (
                  <SegmentTableRow
                    key={segmentBand(row)}
                    row={row}
                    t={t}
                  />
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
          <p>{t("warnings.main")}</p>
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

function SegmentTableRow({
  row,
  t,
}: {
  row: SegmentSummary;
  t: TFunction;
}) {
  const band = segmentBand(row);
  const rowStyles: Record<string, string> = {
    "Top 1% highest priority": "bg-red-100/70 border-l-4 border-l-red-900",
    "Top 5% priority": "bg-red-50/70 border-l-4 border-l-red-500",
    "Top 10% review": "bg-orange-50/60 border-l-4 border-l-orange-500",
    "Standard monitoring": "bg-slate-50 border-l-4 border-l-slate-400",
  };

  return (
    <tr
      className={cn(
        "border-b border-[var(--color-border)] transition-colors",
        rowStyles[band] ?? "",
      )}
    >
      <td className="px-6 py-4 font-semibold">{translateSegment(t, band)}</td>
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
