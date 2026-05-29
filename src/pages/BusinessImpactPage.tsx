import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
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
import { DataLoadState } from "@/components/DataLoadState";
import { PageShell } from "@/components/PageShell";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  api,
  type BusinessImpactAssumptions,
  type BusinessImpactCalculateResponse,
  type SegmentSummary,
} from "@/lib/api";
import { API_UNAVAILABLE_MESSAGE } from "@/lib/apiErrors";
import {
  BUSINESS_IMPACT_DEFAULTS,
  calculateBusinessImpact,
  formatKztPlain,
  highPriorityCustomersFromSegments,
  scenariosFromAssumptions,
} from "@/lib/businessImpact";
import { cn } from "@/lib/utils";

const CHART_COLORS = {
  gross: "#EB001B",
  campaign: "#6b7280",
  net: "#059669",
};

export function BusinessImpactPage() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [assumptions, setAssumptions] = useState<BusinessImpactAssumptions | null>(
    null,
  );
  const [segments, setSegments] = useState<SegmentSummary[]>([]);
  const [initialized, setInitialized] = useState(false);

  const [customers, setCustomers] = useState(0);
  const [conversionRate, setConversionRate] = useState<number>(
    BUSINESS_IMPACT_DEFAULTS.conversion_rate_pct,
  );
  const [avgRevenue, setAvgRevenue] = useState<number>(
    BUSINESS_IMPACT_DEFAULTS.avg_annual_revenue_kzt,
  );
  const [campaignCost, setCampaignCost] = useState<number>(
    BUSINESS_IMPACT_DEFAULTS.campaign_cost_kzt,
  );
  const [activeScenario, setActiveScenario] = useState<string | null>("base");

  const [apiLoading, setApiLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [apiResult, setApiResult] = useState<BusinessImpactCalculateResponse | null>(
    null,
  );

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [assumptionsData, segmentsData] = await Promise.all([
        api.getImpactAssumptions(),
        api.getSegments(),
      ]);
      setAssumptions(assumptionsData);
      setSegments(segmentsData);
    } catch {
      setError(API_UNAVAILABLE_MESSAGE);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const scenarios = useMemo(
    () => scenariosFromAssumptions(assumptions),
    [assumptions],
  );

  const defaultCustomers = useMemo(
    () => highPriorityCustomersFromSegments(segments),
    [segments],
  );

  useEffect(() => {
    if (!loading && !error && !initialized) {
      setCustomers(defaultCustomers);
      setConversionRate(
        assumptions?.conversion_rate_pct ??
          assumptions?.conversion_rate_base ??
          BUSINESS_IMPACT_DEFAULTS.conversion_rate_pct,
      );
      setAvgRevenue(
        assumptions?.avg_annual_revenue_kzt ??
          BUSINESS_IMPACT_DEFAULTS.avg_annual_revenue_kzt,
      );
      setCampaignCost(
        assumptions?.campaign_cost_kzt ?? BUSINESS_IMPACT_DEFAULTS.campaign_cost_kzt,
      );
      setInitialized(true);
    }
  }, [loading, error, initialized, assumptions, defaultCustomers]);

  const results = useMemo(
    () =>
      calculateBusinessImpact({
        high_opportunity_customers: customers,
        conversion_rate_pct: conversionRate,
        avg_annual_revenue_kzt: avgRevenue,
        campaign_cost_kzt: campaignCost,
      }),
    [customers, conversionRate, avgRevenue, campaignCost],
  );

  const handleCalculateViaApi = async () => {
    setApiLoading(true);
    setApiError(null);
    try {
      const response = await api.calculateBusinessImpact({
        high_opportunity_customers: customers,
        conversion_rate_pct: conversionRate,
        avg_annual_revenue_kzt: avgRevenue,
        campaign_cost_kzt: campaignCost,
      });
      setApiResult(response);
    } catch {
      setApiError(API_UNAVAILABLE_MESSAGE);
      setApiResult(null);
    } finally {
      setApiLoading(false);
    }
  };

  const chartData = [
    {
      name: "Gross Revenue",
      value: results.estimated_gross_revenue_kzt,
      fill: CHART_COLORS.gross,
    },
    {
      name: "Campaign Cost",
      value: results.campaign_cost_kzt,
      fill: CHART_COLORS.campaign,
    },
    {
      name: "Net Impact",
      value: Math.abs(results.net_business_impact_kzt),
      fill:
        results.net_business_impact_kzt >= 0 ? CHART_COLORS.net : "#dc2626",
    },
  ];

  const displayResults = apiResult ?? results;

  return (
    <PageShell
      title={t("impact.title")}
      description={t("impact.page_description")}
    >
      <DataLoadState
        loading={loading}
        error={error}
        onRetry={load}
        skeleton="chart"
      >
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Inputs</CardTitle>
              <CardDescription>
                Adjust assumptions to model revenue and ROI
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Field
                id="customers"
                label={t("impact.leads_count")}
                hint={
                  segments.length > 0
                    ? `Default from Top 1% + Top 5%: ${defaultCustomers.toLocaleString()}`
                    : undefined
                }
              >
                <Input
                  id="customers"
                  type="number"
                  min={0}
                  value={customers}
                  onChange={(e) => {
                    setActiveScenario(null);
                    setApiResult(null);
                    setCustomers(Math.max(0, Number(e.target.value) || 0));
                  }}
                />
              </Field>

              <Field
                id="conversion"
                label={`Conversion rate %: ${conversionRate}%`}
              >
                <input
                  id="conversion"
                  type="range"
                  min={1}
                  max={30}
                  step={1}
                  value={conversionRate}
                  onChange={(e) => {
                    setActiveScenario(null);
                    setApiResult(null);
                    setConversionRate(Number(e.target.value));
                  }}
                  className="h-2 w-full cursor-pointer accent-[#EB001B]"
                />
                <div className="mt-1 flex justify-between text-xs text-[var(--color-muted-foreground)]">
                  <span>1%</span>
                  <span>30%</span>
                </div>
              </Field>

              <Field
                id="avg-revenue"
                label={t("impact.avg_revenue")}
              >
                <Input
                  id="avg-revenue"
                  type="number"
                  min={0}
                  value={avgRevenue}
                  onChange={(e) => {
                    setActiveScenario(null);
                    setApiResult(null);
                    setAvgRevenue(Math.max(0, Number(e.target.value) || 0));
                  }}
                />
              </Field>

              <Field id="campaign-cost" label={t("impact.campaign_cost")}>
                <Input
                  id="campaign-cost"
                  type="number"
                  min={0}
                  value={campaignCost}
                  onChange={(e) => {
                    setActiveScenario(null);
                    setApiResult(null);
                    setCampaignCost(Math.max(0, Number(e.target.value) || 0));
                  }}
                />
              </Field>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Results</CardTitle>
              <CardDescription>
                {apiResult
                  ? "Values returned from POST /api/business-impact/calculate"
                  : "Live estimates from your inputs"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div>
                <p className="text-sm text-[var(--color-muted-foreground)]">
                  {t("impact.gross_revenue")}
                </p>
                <p className="mt-1 text-3xl font-bold tabular-nums tracking-tight text-[#EB001B]">
                  {formatKztPlain(displayResults.estimated_gross_revenue_kzt)}
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <ResultMetric
                  label={t("impact.net_impact")}
                  value={formatKztPlain(displayResults.net_business_impact_kzt)}
                  className={cn(
                    "font-semibold",
                    displayResults.net_business_impact_kzt >= 0
                      ? "text-emerald-600"
                      : "text-red-600",
                  )}
                />
                <ResultMetric
                  label={t("impact.roi")}
                  value={`${displayResults.roi_pct.toFixed(0)}%`}
                />
                <ResultMetric
                  label={t("impact.converted")}
                  value={Math.round(
                    displayResults.converted_customers,
                  ).toLocaleString("en-US")}
                  className="sm:col-span-2"
                />
              </div>

              <p className="text-xs text-[var(--color-muted-foreground)]">
                {t("impact.disclaimer")}
              </p>

              <div className="flex flex-wrap items-center gap-3">
                <Button
                  type="button"
                  onClick={handleCalculateViaApi}
                  disabled={apiLoading}
                >
                  {apiLoading ? "Calculating…" : "Calculate via API"}
                </Button>
                {apiError && (
                  <p className="text-sm text-red-600">{apiError}</p>
                )}
                {apiResult && !apiError && (
                  <p className="text-sm text-emerald-600">
                    API result matches live calculation
                  </p>
                )}
              </div>

              <div className="pt-2">
                <p className="mb-3 text-sm font-medium">Revenue vs cost</p>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart
                    data={chartData}
                    margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis
                      tickFormatter={(v) =>
                        v >= 1_000_000
                          ? `${(v / 1_000_000).toFixed(0)}M`
                          : `${(v / 1000).toFixed(0)}K`
                      }
                      width={48}
                    />
                    <Tooltip
                      formatter={(value) => [
                        formatKztPlain(Number(value ?? 0)),
                        "Amount",
                      ]}
                    />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {chartData.map((entry) => (
                        <Cell key={entry.name} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>What if</CardTitle>
            <CardDescription>
              Preset conversion scenarios — click to apply
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            {scenarios.map((scenario) => (
              <Button
                key={scenario.id}
                type="button"
                variant={activeScenario === scenario.id ? "default" : "outline"}
                onClick={() => {
                  setConversionRate(scenario.conversion_rate_pct);
                  setActiveScenario(scenario.id);
                  setApiResult(null);
                }}
              >
                {scenario.label} ({scenario.conversion_rate_pct}%)
              </Button>
            ))}
          </CardContent>
        </Card>
      </DataLoadState>
    </PageShell>
  );
}

function Field({
  id,
  label,
  hint,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {hint && (
        <p className="text-xs text-[var(--color-muted-foreground)]">{hint}</p>
      )}
    </div>
  );
}

function ResultMetric({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-muted)]/30 px-4 py-3">
      <p className="text-xs text-[var(--color-muted-foreground)]">{label}</p>
      <p className={cn("mt-1 text-lg tabular-nums", className)}>{value}</p>
    </div>
  );
}
