import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ArrowLeft,
  ArrowRight,
  Brain,
  Calculator,
  CheckCircle2,
  Lightbulb,
  RefreshCw,
  Search,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";
import { DataLoadState } from "@/components/DataLoadState";
import { ScoreGauge } from "@/components/ScoreGauge";
import { Toast } from "@/components/Toast";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRole } from "@/context/RoleContext";
import {
  api,
  type CardholderScore,
  type KpiSummary,
  type LeadsListResponse,
} from "@/lib/api";
import { API_UNAVAILABLE_MESSAGE } from "@/lib/apiErrors";
import {
  BUSINESS_IMPACT_DEFAULTS,
  calculateBusinessImpact,
  formatKztPlain,
} from "@/lib/businessImpact";
import { reasonToRecommendedProduct, roleToApiLabel, scoreToPercent } from "@/lib/cardholder";
import { cn } from "@/lib/utils";

const TOTAL_STEPS = 6;
const JUDGE_API_ROLE = "judge";

const STEP_META = [
  {
    key: "detect",
    label: "DETECT",
    subtitle:
      "HEIS scores the full consumer card portfolio and surfaces hidden-entrepreneur signals at scale.",
    icon: Search,
  },
  {
    key: "explain",
    label: "EXPLAIN",
    subtitle:
      "Every flag is backed by human-readable reason codes sales and risk teams can trust.",
    icon: Lightbulb,
  },
  {
    key: "recommend",
    label: "RECOMMEND",
    subtitle:
      "Turn behavioral signals into concrete product and outreach actions for each cardholder.",
    icon: Target,
  },
  {
    key: "estimate",
    label: "ESTIMATE IMPACT",
    subtitle:
      "Quantify portfolio ROI before launching a targeted SME campaign.",
    icon: Calculator,
  },
  {
    key: "act",
    label: "ACT",
    subtitle:
      "Sales teams validate predictions — closing the loop between ML and revenue.",
    icon: CheckCircle2,
  },
  {
    key: "learn",
    label: "LEARN",
    subtitle:
      "Feedback flows back into the model so the next scoring cycle is sharper.",
    icon: Brain,
  },
] as const;

const DEMO_FEEDBACK_OPTIONS = ["Converted", "False positive"] as const;

function stepTitle(step: number, kpi: KpiSummary | null): string {
  switch (step) {
    case 0:
      return `We analyzed ${(kpi?.total_scored_consumers ?? 0).toLocaleString()} consumer cardholders`;
    case 1:
      return "Here is why this cardholder is flagged";
    case 2:
      return "This is our recommended action";
    case 3:
      return "Here is the estimated business value";
    case 4:
      return "Sales team marks outcome";
    case 5:
      return "Feedback improves the next model version";
    default:
      return "";
  }
}

function HeisFooter() {
  return (
    <p className="border-t border-[var(--color-border)] pt-4 text-center text-xs text-[var(--color-muted-foreground)]">
      This is HEIS — Hidden Entrepreneur Intelligence System by Mastercard
    </p>
  );
}

function ProgressBar({ step }: { step: number }) {
  const { t } = useTranslation();
  const pct = ((step + 1) / TOTAL_STEPS) * 100;
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs font-medium uppercase tracking-wide text-[var(--color-muted-foreground)]">
        <span>
          {t("judge.step_of", { current: step + 1, total: TOTAL_STEPS })}
        </span>
        <span className="text-[#EB001B]">{STEP_META[step].label}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#EB001B] to-[#F79E1B] transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="hidden gap-1 sm:grid sm:grid-cols-6">
        {STEP_META.map((meta, i) => (
          <div
            key={meta.key}
            className={cn(
              "rounded-md px-1 py-1.5 text-center text-[10px] font-semibold uppercase tracking-tight",
              i === step
                ? "bg-[#EB001B] text-white"
                : i < step
                  ? "bg-orange-100 text-[#EB001B]"
                  : "bg-slate-100 text-slate-400",
            )}
          >
            {meta.label}
          </div>
        ))}
      </div>
    </div>
  );
}

function LearnLoopSvg() {
  const nodes = [
    { label: "Predict", angle: -90 },
    { label: "Act", angle: -18 },
    { label: "Feedback", angle: 54 },
    { label: "Retrain", angle: 126 },
    { label: "Better Predict", angle: 198 },
  ];
  const cx = 160;
  const cy = 160;
  const r = 108;

  return (
    <svg
      viewBox="0 0 320 320"
      className="mx-auto h-auto w-full max-w-sm"
      role="img"
      aria-label="Predict, Act, Feedback, Retrain, Better Predict continuous learning loop"
    >
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke="#F79E1B"
        strokeWidth="2"
        strokeDasharray="6 4"
        opacity={0.55}
      />
      {nodes.map((node, i) => {
        const rad = (node.angle * Math.PI) / 180;
        const x = cx + r * Math.cos(rad);
        const y = cy + r * Math.sin(rad);
        const next = nodes[(i + 1) % nodes.length];
        const nrad = (next.angle * Math.PI) / 180;
        const nx = cx + r * Math.cos(nrad);
        const ny = cy + r * Math.sin(nrad);
        const midAngle = ((node.angle + next.angle) / 2) * (Math.PI / 180);
        const ax = cx + (r + 14) * Math.cos(midAngle);
        const ay = cy + (r + 14) * Math.sin(midAngle);
        return (
          <g key={node.label}>
            <line
              x1={x}
              y1={y}
              x2={nx}
              y2={ny}
              stroke="#EB001B"
              strokeWidth="1.5"
              opacity={0.35}
            />
            <polygon
              points={`${ax},${ay} ${ax - 5},${ay - 3} ${ax - 5},${ay + 3}`}
              fill="#F79E1B"
            />
            <circle cx={x} cy={y} r={36} fill="white" stroke="#EB001B" strokeWidth="1.5" />
            <text
              x={x}
              y={y}
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-[#EB001B] text-[9px] font-semibold"
              style={{ fontSize: node.label.length > 12 ? 8 : 9 }}
            >
              {node.label.split(" ").map((word, wi) => (
                <tspan key={wi} x={x} dy={wi === 0 ? -4 : 11}>
                  {word}
                </tspan>
              ))}
            </text>
          </g>
        );
      })}
      <circle cx={cx} cy={cy} r={42} fill="#fff7ed" stroke="#F79E1B" strokeWidth="1" />
      <text
        x={cx}
        y={cy - 6}
        textAnchor="middle"
        className="fill-[#EB001B] text-[10px] font-bold"
      >
        HEIS
      </text>
      <text
        x={cx}
        y={cy + 10}
        textAnchor="middle"
        className="fill-[#6b7280] text-[8px]"
      >
        learning loop
      </text>
    </svg>
  );
}

function isLeadsList(
  res: LeadsListResponse | { view: string },
): res is LeadsListResponse {
  return "leads" in res;
}

export function JudgeDemoPage() {
  const { t } = useTranslation();
  const [step, setStep] = useState(0);
  const { role } = useRole();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [kpi, setKpi] = useState<KpiSummary | null>(null);
  const [topLead, setTopLead] = useState<CardholderScore | null>(null);

  const [feedbackStatus, setFeedbackStatus] = useState<string>("Converted");
  const [feedbackSaving, setFeedbackSaving] = useState(false);
  const [feedbackSaved, setFeedbackSaved] = useState(false);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);

  const [customers, setCustomers] = useState(800);
  const [conversionRate, setConversionRate] = useState<number>(
    BUSINESS_IMPACT_DEFAULTS.conversion_rate_pct,
  );
  const [avgRevenue, setAvgRevenue] = useState<number>(
    BUSINESS_IMPACT_DEFAULTS.avg_annual_revenue_kzt,
  );
  const [campaignCost, setCampaignCost] = useState<number>(
    BUSINESS_IMPACT_DEFAULTS.campaign_cost_kzt,
  );

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [kpiData, leadsRes, assumptions] = await Promise.all([
        api.getKpis(JUDGE_API_ROLE),
        api.getLeads({
          role: JUDGE_API_ROLE,
          sort: "score_desc",
          limit: 1,
        }),
        api.getImpactAssumptions(),
      ]);
      setKpi(kpiData);
      if (isLeadsList(leadsRes) && leadsRes.leads.length > 0) {
        setTopLead(leadsRes.leads[0]);
      } else {
        setTopLead(null);
      }
      setCustomers(
        kpiData.top_1_percent_candidates ??
          kpiData.top_5_percent_candidates ??
          800,
      );
      if (assumptions.conversion_rate_pct != null) {
        setConversionRate(assumptions.conversion_rate_pct);
      }
      if (assumptions.avg_annual_revenue_kzt != null) {
        setAvgRevenue(assumptions.avg_annual_revenue_kzt);
      }
      if (assumptions.campaign_cost_kzt != null) {
        setCampaignCost(assumptions.campaign_cost_kzt);
      }
    } catch {
      setError(API_UNAVAILABLE_MESSAGE);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const productMatches = useMemo(() => {
    if (!topLead) return [];
    return [
      topLead.top_reason_1,
      topLead.top_reason_2,
      topLead.top_reason_3,
    ].map((signal) => ({
      signal,
      product: reasonToRecommendedProduct(signal),
    }));
  }, [topLead]);

  const impactResults = useMemo(
    () =>
      calculateBusinessImpact({
        high_opportunity_customers: customers,
        conversion_rate_pct: conversionRate,
        avg_annual_revenue_kzt: avgRevenue,
        campaign_cost_kzt: campaignCost,
      }),
    [customers, conversionRate, avgRevenue, campaignCost],
  );

  const handleRestart = () => {
    setStep(0);
    setFeedbackSaved(false);
    setFeedbackError(null);
    setFeedbackStatus("Converted");
    setShowToast(false);
  };

  const handleSaveFeedback = async () => {
    if (!topLead || !role) return;
    setFeedbackSaving(true);
    setFeedbackError(null);
    try {
      await api.postFeedback({
        card_id: topLead.card_id,
        user_role: roleToApiLabel(role),
        feedback_status: feedbackStatus,
        comment: "Judge demo walkthrough feedback",
      });
      await api.postAuditLog({
        card_id: topLead.card_id,
        user_role: roleToApiLabel(role),
        old_status: topLead.feedback_status,
        new_status: feedbackStatus,
        timestamp: new Date().toISOString(),
      });
      setFeedbackSaved(true);
      setShowToast(true);
    } catch {
      setFeedbackError("Could not save feedback. Ensure the backend is running.");
    } finally {
      setFeedbackSaving(false);
    }
  };

  const meta = STEP_META[step];
  const StepIcon = meta.icon;
  const isFirst = step === 0;
  const isLast = step === TOTAL_STEPS - 1;
  const title = stepTitle(step, kpi);

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-6 py-8">
      <header className="space-y-1">
        <div className="flex items-center gap-2 text-[#EB001B]">
          <Sparkles className="h-5 w-5" />
          <h1 className="text-2xl font-bold tracking-tight">{t("judge.title")}</h1>
        </div>
        <p className="text-sm text-[var(--color-muted-foreground)]">
          Guided 6-step HEIS walkthrough for competition judges
        </p>
      </header>

      <ProgressBar step={step} />

      <Card className="border-[#F79E1B]/30 shadow-sm">
        <CardHeader className="space-y-3 pb-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#EB001B] to-[#F79E1B] text-white">
              <StepIcon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[#EB001B]">
                {meta.label}
              </p>
              <CardTitle className="text-xl">{title}</CardTitle>
              <CardDescription className="mt-1 text-sm">
                {meta.subtitle}
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <DataLoadState
            loading={loading}
            error={error}
            onRetry={load}
            skeleton="dashboard"
          >
            {step === 0 && kpi && (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <KpiCard
                  label="Total scored"
                  value={kpi.total_scored_consumers.toLocaleString()}
                  hint="Consumer cardholders analyzed"
                  icon={TrendingUp}
                />
                <KpiCard
                  label="Top 1% count"
                  value={(kpi.top_1_percent_candidates ?? 0).toLocaleString()}
                  hint="Highest-priority hidden entrepreneurs"
                  icon={Target}
                  accent
                />
                <KpiCard
                  label="Top 5% count"
                  value={(kpi.top_5_percent_candidates ?? 0).toLocaleString()}
                  hint="Expanded priority cohort"
                  icon={Search}
                />
                <KpiCard
                  label="Average score"
                  value={`${scoreToPercent(kpi.average_score)}%`}
                  hint="Portfolio commercial activity index"
                  icon={TrendingUp}
                />
              </div>
            )}

            {step === 1 && topLead && (
              <div className="grid gap-6 md:grid-cols-[auto_1fr]">
                <div className="flex justify-center">
                  <ScoreGauge score={topLead.commercial_activity_score} />
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-muted-foreground)]">
                      Card ID
                    </p>
                    <p className="mt-1 font-mono text-lg font-semibold">
                      {topLead.card_id}
                    </p>
                    <p className="text-sm text-[var(--color-muted-foreground)]">
                      {topLead.bank_name} · {topLead.card_tier} ·{" "}
                      {topLead.opportunity_segment}
                    </p>
                  </div>
                  <div>
                    <p className="mb-2 text-sm font-semibold">Top 3 reasons</p>
                    <ol className="space-y-2">
                      {[
                        topLead.top_reason_1,
                        topLead.top_reason_2,
                        topLead.top_reason_3,
                      ].map((reason, i) => (
                        <li
                          key={reason}
                          className="flex gap-3 rounded-lg border border-slate-100 bg-slate-50/80 px-3 py-2.5 text-sm"
                        >
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#EB001B] text-xs font-bold text-white">
                            {i + 1}
                          </span>
                          <span>{reason}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>
              </div>
            )}

            {step === 2 && topLead && (
              <div className="space-y-4">
                <div className="rounded-xl border border-[#F79E1B]/40 bg-gradient-to-r from-white to-orange-50/50 p-5">
                  <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-muted-foreground)]">
                    Recommended action
                  </p>
                  <p className="mt-2 text-lg font-semibold text-[#EB001B]">
                    {topLead.recommended_action}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-5">
                  <p className="mb-3 text-xs font-medium uppercase tracking-wide text-[var(--color-muted-foreground)]">
                    Product match logic — behavior signal → product
                  </p>
                  <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs uppercase tracking-wide text-[var(--color-muted-foreground)]">
                          <th className="px-3 py-2 font-medium">Behavior signal</th>
                          <th className="px-3 py-2 font-medium">Matched product</th>
                        </tr>
                      </thead>
                      <tbody>
                        {productMatches.map((row) => (
                          <tr
                            key={row.signal}
                            className="border-b border-slate-50 last:border-0"
                          >
                            <td className="px-3 py-2.5 text-[var(--color-foreground)]">
                              {row.signal}
                            </td>
                            <td className="px-3 py-2.5 font-medium text-[#EB001B]">
                              {row.product}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-3 rounded-lg border border-slate-200 p-4">
                  <p className="text-sm font-semibold">Assumptions</p>
                  <MiniField label="High-opportunity customers">
                    <Input
                      type="number"
                      min={0}
                      value={customers}
                      onChange={(e) =>
                        setCustomers(Math.max(0, Number(e.target.value) || 0))
                      }
                    />
                  </MiniField>
                  <MiniField label={`Conversion rate: ${conversionRate}%`}>
                    <input
                      type="range"
                      min={1}
                      max={30}
                      value={conversionRate}
                      onChange={(e) =>
                        setConversionRate(Number(e.target.value))
                      }
                      className="h-2 w-full accent-[#EB001B]"
                    />
                  </MiniField>
                  <MiniField label="Avg annual revenue (KZT)">
                    <Input
                      type="number"
                      min={0}
                      value={avgRevenue}
                      onChange={(e) =>
                        setAvgRevenue(Math.max(0, Number(e.target.value) || 0))
                      }
                    />
                  </MiniField>
                  <MiniField label="Campaign cost (KZT)">
                    <Input
                      type="number"
                      min={0}
                      value={campaignCost}
                      onChange={(e) =>
                        setCampaignCost(Math.max(0, Number(e.target.value) || 0))
                      }
                    />
                  </MiniField>
                </div>
                <div className="space-y-3 rounded-lg border border-emerald-200 bg-emerald-50/40 p-4">
                  <p className="text-sm font-semibold text-emerald-900">
                    Live ROI estimate
                  </p>
                  <ImpactLine
                    label="Gross revenue"
                    value={formatKztPlain(impactResults.estimated_gross_revenue_kzt)}
                  />
                  <ImpactLine
                    label="Net business impact"
                    value={formatKztPlain(impactResults.net_business_impact_kzt)}
                    highlight
                  />
                  <ImpactLine
                    label="ROI"
                    value={`${impactResults.roi_pct.toFixed(0)}%`}
                    highlight
                  />
                  <ImpactLine
                    label="Converted customers"
                    value={Math.round(
                      impactResults.converted_customers,
                    ).toLocaleString()}
                  />
                </div>
              </div>
            )}

            {step === 4 && topLead && (
              <div className="mx-auto max-w-md space-y-4">
                {feedbackSaved && (
                  <div
                    className="flex flex-col items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-6 py-6 animate-in zoom-in-95 fade-in duration-500"
                    role="status"
                  >
                    <CheckCircle2 className="h-14 w-14 text-emerald-600 animate-in zoom-in-50 duration-700" />
                    <p className="text-center text-base font-semibold text-emerald-900">
                      Feedback saved successfully
                    </p>
                  </div>
                )}
                <div className="rounded-lg bg-slate-50 px-4 py-3 text-sm">
                  <span className="text-[var(--color-muted-foreground)]">
                    Cardholder:{" "}
                  </span>
                  <span className="font-mono font-medium">{topLead.card_id}</span>
                </div>
                <div className="space-y-2">
                  <Label>Feedback status</Label>
                  <Select
                    value={feedbackStatus}
                    onValueChange={setFeedbackStatus}
                    disabled={feedbackSaved}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DEMO_FEEDBACK_OPTIONS.map((opt) => (
                        <SelectItem key={opt} value={opt}>
                          {opt}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  type="button"
                  className="w-full"
                  disabled={feedbackSaving || feedbackSaved}
                  onClick={handleSaveFeedback}
                >
                  {feedbackSaved
                    ? "Demo feedback saved"
                    : feedbackSaving
                      ? "Saving…"
                      : "Save Demo Feedback"}
                </Button>
                {feedbackError && (
                  <p className="text-sm text-red-600">{feedbackError}</p>
                )}
              </div>
            )}

            {step === 5 && (
              <div className="space-y-6">
                <LearnLoopSvg />
                <p className="text-center text-sm text-[var(--color-muted-foreground)]">
                  Predict → Act → Feedback → Retrain → Better Predict
                </p>
                <HeisFooter />
              </div>
            )}
          </DataLoadState>
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center gap-3">
        <Button
          type="button"
          variant="outline"
          disabled={isFirst}
          onClick={() => setStep((s) => s - 1)}
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          {t("judge.previous")}
        </Button>
        <Button
          type="button"
          disabled={isLast}
          onClick={() => setStep((s) => s + 1)}
        >
          {t("judge.next")}
          <ArrowRight className="ml-1 h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="secondary"
          className="ml-auto"
          onClick={handleRestart}
        >
          <RefreshCw className="mr-1 h-4 w-4" />
          {t("judge.restart")}
        </Button>
      </div>

      {showToast && (
        <Toast
          message={t("cardholder.feedback_saved")}
          onDismiss={() => setShowToast(false)}
        />
      )}
    </div>
  );
}

function KpiCard({
  label,
  value,
  hint,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string;
  hint: string;
  icon: typeof TrendingUp;
  accent?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border p-4",
        accent
          ? "border-[#EB001B]/30 bg-gradient-to-br from-red-50/80 to-orange-50/40"
          : "border-slate-200 bg-white",
      )}
    >
      <Icon
        className={cn("h-5 w-5", accent ? "text-[#EB001B]" : "text-slate-400")}
      />
      <p className="mt-3 text-2xl font-bold tabular-nums tracking-tight">
        {value}
      </p>
      <p className="mt-1 text-sm font-medium">{label}</p>
      <p className="mt-0.5 text-xs text-[var(--color-muted-foreground)]">
        {hint}
      </p>
    </div>
  );
}

function MiniField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
      {children}
    </div>
  );
}

function ImpactLine({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-2 border-b border-emerald-100/80 pb-2 last:border-0">
      <span className="text-xs text-emerald-800/80">{label}</span>
      <span
        className={cn(
          "text-sm font-semibold tabular-nums",
          highlight && "text-[#EB001B]",
        )}
      >
        {value}
      </span>
    </div>
  );
}
