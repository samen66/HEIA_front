import { useEffect, useMemo, useState } from "react";
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
import { OpportunityBadge } from "@/components/OpportunityBadge";
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
import { useDashboardData } from "@/hooks/useDashboardData";
import { api } from "@/lib/api";
import {
  BUSINESS_IMPACT_DEFAULTS,
  calculateBusinessImpact,
  defaultHighOpportunityCustomers,
  formatKztPlain,
} from "@/lib/businessImpact";
import { roleToApiLabel, scoreToPercent } from "@/lib/cardholder";
import {
  getTopScoredCardholder,
  productForSegment,
} from "@/lib/segmentStats";
import { cn, formatKzt } from "@/lib/utils";

const TOTAL_STEPS = 6;

const STEP_META = [
  {
    key: "detect",
    label: "DETECT",
    title: "Detect hidden entrepreneurs",
    subtitle:
      "HEIA analyzes the commercial card portfolio and surfaces high-opportunity cardholders at scale.",
    icon: Search,
  },
  {
    key: "explain",
    label: "EXPLAIN",
    title: "Explain the model decision",
    subtitle:
      "Every score is backed by human-readable reason codes sales and risk teams can trust.",
    icon: Lightbulb,
  },
  {
    key: "recommend",
    label: "RECOMMEND",
    title: "Recommend the next best action",
    subtitle:
      "Turn scores into concrete product and outreach actions for each cardholder.",
    icon: Target,
  },
  {
    key: "estimate",
    label: "ESTIMATE IMPACT",
    title: "Estimate business impact",
    subtitle:
      "Quantify portfolio ROI before launching a targeted SME campaign.",
    icon: Calculator,
  },
  {
    key: "act",
    label: "ACT",
    title: "Capture field feedback",
    subtitle:
      "Sales teams validate predictions — closing the loop between ML and revenue.",
    icon: CheckCircle2,
  },
  {
    key: "learn",
    label: "LEARN",
    title: "Learn and improve",
    subtitle:
      "Feedback flows back into the model so the next scoring cycle is sharper.",
    icon: Brain,
  },
] as const;

const DEMO_FEEDBACK_OPTIONS = ["Converted", "False positive"] as const;

function HeiaFooter() {
  return (
    <p className="border-t border-[var(--color-border)] pt-4 text-center text-xs text-[var(--color-muted-foreground)]">
      This is HEIA — Hidden Entrepreneur Intelligence Agent by Mastercard
    </p>
  );
}

function ProgressBar({ step }: { step: number }) {
  const pct = ((step + 1) / TOTAL_STEPS) * 100;
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs font-medium uppercase tracking-wide text-[var(--color-muted-foreground)]">
        <span>
          Step {step + 1} of {TOTAL_STEPS}
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

function LearnLoopDiagram() {
  const nodes = [
    "Predict",
    "Act",
    "Feedback",
    "Retrain",
    "Better Predict",
  ];
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center gap-4 py-4">
      <div className="relative flex h-52 w-52 items-center justify-center rounded-full border-2 border-dashed border-[#F79E1B]/60 bg-gradient-to-br from-orange-50/80 to-white">
        <div className="text-center">
          <RefreshCw className="mx-auto h-8 w-8 text-[#EB001B]" />
          <p className="mt-2 text-xs font-semibold text-[#EB001B]">
            Continuous learning loop
          </p>
        </div>
        {nodes.map((label, i) => {
          const angle = (i / nodes.length) * 2 * Math.PI - Math.PI / 2;
          const r = 96;
          const x = Math.cos(angle) * r;
          const y = Math.sin(angle) * r;
          return (
            <div
              key={label}
              className="absolute flex w-20 -translate-x-1/2 -translate-y-1/2 flex-col items-center"
              style={{ left: `calc(50% + ${x}px)`, top: `calc(50% + ${y}px)` }}
            >
              <span className="rounded-full border border-[#EB001B]/30 bg-white px-2 py-1 text-center text-[10px] font-semibold leading-tight text-[#EB001B] shadow-sm">
                {label}
              </span>
              <span className="mt-0.5 text-[14px] text-[#F79E1B]">→</span>
            </div>
          );
        })}
      </div>
      <p className="text-center text-xs text-[var(--color-muted-foreground)]">
        Predict → Act → Feedback → Retrain → Better Predict
      </p>
    </div>
  );
}

export function JudgeDemoPage() {
  const [step, setStep] = useState(0);
  const { role } = useRole();
  const data = useDashboardData();

  const topCardholder = useMemo(
    () => getTopScoredCardholder(data.scores),
    [data.scores],
  );

  const avgScore = useMemo(() => {
    if (data.scores.length === 0) return 0;
    return (
      data.scores.reduce((s, c) => s + c.commercial_activity_score, 0) /
      data.scores.length
    );
  }, [data.scores]);

  const highOpportunityCount = useMemo(
    () => data.scores.filter((s) => s.risk_segment === "High").length,
    [data.scores],
  );

  const [feedbackStatus, setFeedbackStatus] = useState<string>("Converted");
  const [feedbackSaving, setFeedbackSaving] = useState(false);
  const [feedbackSaved, setFeedbackSaved] = useState(false);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);

  const [customers, setCustomers] = useState(52);
  const [conversionRate, setConversionRate] = useState<number>(
    BUSINESS_IMPACT_DEFAULTS.conversion_rate_pct,
  );
  const [avgRevenue, setAvgRevenue] = useState<number>(
    BUSINESS_IMPACT_DEFAULTS.avg_annual_revenue_kzt,
  );
  const [campaignCost, setCampaignCost] = useState<number>(
    BUSINESS_IMPACT_DEFAULTS.campaign_cost_kzt,
  );
  const [impactInitialized, setImpactInitialized] = useState(false);

  useEffect(() => {
    if (!data.loading && data.segments.length > 0 && !impactInitialized) {
      setCustomers(defaultHighOpportunityCustomers(data.segments));
      const high = data.segments.find((s) => s.risk_segment === "High");
      if (high) {
        setConversionRate(Math.round(high.estimated_conversion_rate * 100));
      }
      setImpactInitialized(true);
    }
  }, [data.loading, data.segments, impactInitialized]);

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
  };

  const handleSaveFeedback = async () => {
    if (!topCardholder || !role) return;
    setFeedbackSaving(true);
    setFeedbackError(null);
    try {
      await api.postFeedback({
        card_id: topCardholder.card_id,
        user_role: roleToApiLabel(role),
        feedback_status: feedbackStatus,
        comment: "Judge demo walkthrough feedback",
      });
      await api.postAuditLog({
        card_id: topCardholder.card_id,
        user_role: roleToApiLabel(role),
        old_status: topCardholder.feedback_status,
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

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-6 py-8">
      <header className="space-y-1">
        <div className="flex items-center gap-2 text-[#EB001B]">
          <Sparkles className="h-5 w-5" />
          <h1 className="text-2xl font-bold tracking-tight">Judge Demo Mode</h1>
        </div>
        <p className="text-sm text-[var(--color-muted-foreground)]">
          Guided 6-step walkthrough for competition judges
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
              <CardTitle className="text-xl">{meta.title}</CardTitle>
              <CardDescription className="mt-1 text-sm">
                {meta.subtitle}
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <DataLoadState
            loading={data.loading}
            error={data.error}
            onRetry={data.reload}
            skeleton="dashboard"
          >
            {step === 0 && (
              <div className="grid gap-4 sm:grid-cols-3">
                <KpiCard
                  label="Total analyzed"
                  value={data.scores.length.toLocaleString()}
                  hint="Commercial cardholders scored"
                  icon={TrendingUp}
                />
                <KpiCard
                  label="High-opportunity"
                  value={highOpportunityCount.toLocaleString()}
                  hint="Hidden entrepreneur signals"
                  icon={Target}
                  accent
                />
                <KpiCard
                  label="Average score"
                  value={`${scoreToPercent(avgScore)}%`}
                  hint="Portfolio commercial activity"
                  icon={Search}
                />
              </div>
            )}

            {step === 1 && topCardholder && (
              <div className="grid gap-6 md:grid-cols-[auto_1fr]">
                <div className="flex justify-center">
                  <ScoreGauge score={topCardholder.commercial_activity_score} />
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-muted-foreground)]">
                      Top cardholder (highest score)
                    </p>
                    <p className="mt-1 font-mono text-lg font-semibold">
                      {topCardholder.card_id}
                    </p>
                    <p className="text-sm text-[var(--color-muted-foreground)]">
                      {topCardholder.bank_name} · {topCardholder.card_tier}
                    </p>
                    <div className="mt-2">
                      <OpportunityBadge segment={topCardholder.opportunity_segment} />
                    </div>
                  </div>
                  <div>
                    <p className="mb-2 text-sm font-semibold">Top 3 reasons</p>
                    <ol className="space-y-2">
                      {[
                        topCardholder.top_reason_1,
                        topCardholder.top_reason_2,
                        topCardholder.top_reason_3,
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

            {step === 2 && topCardholder && (
              <div className="space-y-4">
                <div className="rounded-xl border border-[#F79E1B]/40 bg-gradient-to-r from-white to-orange-50/50 p-5">
                  <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-muted-foreground)]">
                    Recommended action
                  </p>
                  <p className="mt-2 text-lg font-semibold text-[#EB001B]">
                    {topCardholder.recommended_action}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-5">
                  <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-muted-foreground)]">
                    Recommended product
                  </p>
                  <p className="mt-2 text-lg font-semibold">
                    {productForSegment(data.segments, topCardholder.risk_segment)}
                  </p>
                  <p className="mt-2 text-sm text-[var(--color-muted-foreground)]">
                    Opportunity segment:{" "}
                    <span className="font-medium text-[var(--color-foreground)]">
                      {topCardholder.opportunity_segment}
                    </span>
                    {" · "}
                    Expected value:{" "}
                    <span className="font-medium text-emerald-700">
                      {formatKzt(topCardholder.expected_value_kzt)}
                    </span>
                  </p>
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

            {step === 4 && topCardholder && (
              <div className="mx-auto max-w-md space-y-4">
                <div className="rounded-lg bg-slate-50 px-4 py-3 text-sm">
                  <span className="text-[var(--color-muted-foreground)]">
                    Cardholder:{" "}
                  </span>
                  <span className="font-mono font-medium">
                    {topCardholder.card_id}
                  </span>
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
                    ? "Feedback saved"
                    : feedbackSaving
                      ? "Saving…"
                      : "Save feedback"}
                </Button>
                {feedbackError && (
                  <p className="text-sm text-red-600">{feedbackError}</p>
                )}
                {feedbackSaved && (
                  <p className="text-center text-sm text-emerald-700">
                    Marked as &ldquo;{feedbackStatus}&rdquo; — ready for model
                    retraining.
                  </p>
                )}
              </div>
            )}

            {step === 5 && (
              <div className="space-y-6 text-center">
                <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 px-6 py-5">
                  <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-600" />
                  <p className="mt-3 text-base font-medium text-emerald-900">
                    Feedback saved → Used in next model retraining → Improved
                    predictions
                  </p>
                </div>
                <LearnLoopDiagram />
              </div>
            )}
          </DataLoadState>

          <HeiaFooter />
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
          Previous Step
        </Button>
        <Button
          type="button"
          disabled={isLast}
          onClick={() => setStep((s) => s + 1)}
        >
          Next Step
          <ArrowRight className="ml-1 h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="secondary"
          className="ml-auto"
          onClick={handleRestart}
        >
          <RefreshCw className="mr-1 h-4 w-4" />
          Restart Demo
        </Button>
      </div>

      {showToast && (
        <Toast
          message="Feedback saved. This result will be used in future model retraining."
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
