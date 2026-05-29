import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ArrowLeft,
  Banknote,
  Building2,
  CreditCard,
  Globe2,
  Lightbulb,
  Package,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";
import { CardholderFeedbackForm } from "@/components/CardholderFeedbackForm";
import { DataLoadState } from "@/components/DataLoadState";
import { OpportunityBadge } from "@/components/OpportunityBadge";
import { PageShell } from "@/components/PageShell";
import { PropensityScoreWarning } from "@/components/PropensityScoreWarning";
import { ScoreGauge } from "@/components/ScoreGauge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useRole } from "@/context/RoleContext";
import { api, type CardholderDetail } from "@/lib/api";
import { API_UNAVAILABLE_MESSAGE } from "@/lib/apiErrors";
import {
  canSubmitFeedback,
  confidenceBadgeClass,
  confidenceLabel,
  displayCardId,
  isCardholderDetailRestricted,
  productIconForAction,
  recommendationLogicNote,
} from "@/lib/cardholder";
import { ROUTES } from "@/lib/roles";
import { formatKzt, formatPercent } from "@/lib/utils";

const REASON_ICONS = [TrendingUp, Globe2, Lightbulb] as const;

const PRODUCT_ICONS: Record<string, typeof Package> = {
  credit: CreditCard,
  trade: Globe2,
  merchant: Building2,
  payroll: Users,
  treasury: Banknote,
  default: Wallet,
};

function num(value: unknown): number | undefined {
  if (value === undefined || value === null || value === "") return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}

function StatCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-xs font-medium text-[var(--color-muted-foreground)]">
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-lg font-semibold tabular-nums">{value}</p>
      </CardContent>
    </Card>
  );
}

export function CardholderDetailPage() {
  const { t } = useTranslation();
  const { card_id: cardIdParam } = useParams<{ card_id: string }>();
  const cardId = cardIdParam ? decodeURIComponent(cardIdParam) : "";
  const navigate = useNavigate();
  const { role } = useRole();
  const restricted = isCardholderDetailRestricted(role);

  const [loading, setLoading] = useState(!restricted);
  const [error, setError] = useState<string | null>(null);
  const [cardholder, setCardholder] = useState<CardholderDetail | null>(null);

  const load = useCallback(async () => {
    if (!cardId || !role || restricted) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await api.getCardholder(cardId, role);
      if (result.status === 403) {
        setCardholder(null);
        setError(null);
        return;
      }
      setCardholder(result.data ?? null);
      if (!result.data) {
        setError(`Cardholder not found: ${cardId}`);
      }
    } catch {
      setError(API_UNAVAILABLE_MESSAGE);
      setCardholder(null);
    } finally {
      setLoading(false);
    }
  }, [cardId, role, restricted]);

  useEffect(() => {
    load();
  }, [load]);

  const productKey = cardholder
    ? productIconForAction(cardholder.recommended_action)
    : "default";
  const ProductIcon = PRODUCT_ICONS[productKey] ?? Package;
  const reasons = cardholder
    ? [cardholder.top_reason_1, cardholder.top_reason_2, cardholder.top_reason_3]
    : [];

  const behaviorStats = cardholder
    ? [
        {
          label: t("cardholder.total_amount"),
          value: formatKzt(num(cardholder.total_amount_kzt) ?? 0),
        },
        {
          label: t("cardholder.median_amount"),
          value: formatKzt(num(cardholder.median_transaction_amount_kzt) ?? 0),
        },
        {
          label: t("cardholder.amount_per_day"),
          value: formatKzt(num(cardholder.amount_per_active_day_kzt) ?? 0),
        },
        {
          label: t("cardholder.online_share"),
          value: formatPercent(num(cardholder.online_amount_share) ?? 0),
        },
        {
          label: t("cardholder.pos_share"),
          value: formatPercent(num(cardholder.pos_amount_share) ?? 0),
        },
        {
          label: t("cardholder.recurring_share"),
          value: formatPercent(num(cardholder.recurring_amount_share) ?? 0),
        },
        {
          label: t("cardholder.weekend_share"),
          value: formatPercent(num(cardholder.weekend_transaction_share) ?? 0),
        },
        {
          label: t("cardholder.night_share"),
          value: formatPercent(num(cardholder.night_amount_share) ?? 0),
        },
      ]
    : [];

  return (
    <PageShell
      title={t("cardholder.page_title")}
      description={t("cardholder.page_description")}
      className="pb-8"
    >
      <PropensityScoreWarning />

      <Button
        type="button"
        variant="outline"
        size="sm"
        className="mt-4 w-fit"
        onClick={() => navigate(ROUTES.salesLeads)}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Sales Leads
      </Button>

      {restricted ? (
        <Card className="mt-6 border-[var(--color-border)]">
          <CardHeader>
            <CardTitle>{t("leads.access_restricted_title")}</CardTitle>
            <CardDescription>{t("cardholder.access_restricted")}</CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <DataLoadState
          loading={loading}
          error={error}
          onRetry={load}
          skeleton="detail"
        >
          {cardholder && role && (
            <div className="mt-6 space-y-6">
              <Card>
                <CardContent className="grid gap-6 pt-6 lg:grid-cols-[1fr_auto] lg:items-center">
                  <div className="space-y-4">
                    <p className="font-mono text-xl font-semibold tracking-tight">
                      {displayCardId(cardholder.card_id, role)}
                    </p>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-[var(--color-muted-foreground)]">
                      <span className="flex items-center gap-1.5">
                        <Building2 className="h-4 w-4 shrink-0" />
                        {cardholder.bank_name}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <CreditCard className="h-4 w-4 shrink-0" />
                        {cardholder.card_tier}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <OpportunityBadge segment={cardholder.opportunity_segment} />
                      <span
                        className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${confidenceBadgeClass(cardholder.confidence_level)}`}
                      >
                        {confidenceLabel(cardholder.confidence_level)}
                        {typeof cardholder.confidence_level === "number" && (
                          <> · {(cardholder.confidence_level * 100).toFixed(0)}%</>
                        )}
                      </span>
                    </div>
                  </div>
                  <ScoreGauge score={cardholder.commercial_activity_score} size={220} />
                </CardContent>
              </Card>

              <section>
                <h2 className="mb-3 text-lg font-semibold">{t("cardholder.why_flagged")}</h2>
                <div className="grid gap-3 sm:grid-cols-3">
                  {reasons.map((reason, i) => {
                    const Icon = REASON_ICONS[i] ?? Lightbulb;
                    return (
                      <Card key={`reason-${i}`}>
                        <CardHeader className="pb-2">
                          <div className="flex items-center gap-2">
                            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--color-accent)] text-[#EB001B]">
                              <Icon className="h-5 w-5" />
                            </span>
                            <CardTitle className="text-sm">
                              Driver {i + 1}
                            </CardTitle>
                          </div>
                        </CardHeader>
                        <CardContent className="text-sm leading-relaxed">
                          {reason}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </section>

              <section>
                <h2 className="mb-3 text-lg font-semibold">
                  {t("cardholder.behavior_indicators")}
                </h2>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {behaviorStats.map((stat) => (
                    <StatCard key={stat.label} label={stat.label} value={stat.value} />
                  ))}
                </div>
              </section>

              <Card className="border-[#EB001B]/40 bg-gradient-to-br from-red-50/90 to-orange-50/60 shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#EB001B] text-white">
                      <ProductIcon className="h-5 w-5" />
                    </span>
                    Recommendation
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-xl font-semibold leading-snug">
                    {cardholder.recommended_action}
                  </p>
                  <p className="text-2xl font-bold tabular-nums text-[#EB001B]">
                    {formatKzt(cardholder.expected_value_kzt)}
                    <span className="ml-2 text-sm font-normal text-[var(--color-muted-foreground)]">
                      expected value (KZT)
                    </span>
                  </p>
                  <p className="rounded-md border border-[#EB001B]/20 bg-white/60 px-3 py-2 text-sm text-[var(--color-muted-foreground)]">
                    {recommendationLogicNote({
                      online_amount_share: num(cardholder.online_amount_share),
                      pos_amount_share: num(cardholder.pos_amount_share),
                      recurring_amount_share: num(
                        cardholder.recurring_amount_share,
                      ),
                      weekend_transaction_share: num(
                        cardholder.weekend_transaction_share,
                      ),
                      night_amount_share: num(cardholder.night_amount_share),
                    })}
                  </p>
                </CardContent>
              </Card>

              {canSubmitFeedback(role) ? (
                <CardholderFeedbackForm
                  cardId={cardholder.card_id}
                  initialStatus={cardholder.feedback_status}
                  role={role}
                  onSaved={(newStatus) =>
                    setCardholder((prev) =>
                      prev ? { ...prev, feedback_status: newStatus } : prev,
                    )
                  }
                />
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Feedback</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-[var(--color-muted-foreground)]">
                    Current status:{" "}
                    <span className="font-medium text-[var(--color-foreground)]">
                      {cardholder.feedback_status}
                    </span>
                    . Status updates can be submitted by Sales Manager, Risk, or
                    Admin roles.
                  </CardContent>
                </Card>
              )}
            </div>
          )}
          {!loading && !error && !cardholder && cardId && (
            <p className="mt-6 text-sm text-[var(--color-muted-foreground)]">
              No cardholder found.{" "}
              <Link to={ROUTES.salesLeads} className="text-[#EB001B] underline">
                Return to sales leads
              </Link>
            </p>
          )}
        </DataLoadState>
      )}
    </PageShell>
  );
}
