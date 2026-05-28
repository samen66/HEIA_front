import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
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
import { OpportunityDisclaimer } from "@/components/OpportunityDisclaimer";
import { API_UNAVAILABLE_MESSAGE } from "@/lib/apiErrors";
import { OpportunityBadge } from "@/components/OpportunityBadge";
import { PageShell } from "@/components/PageShell";
import { ScoreGauge } from "@/components/ScoreGauge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useRole } from "@/context/RoleContext";
import { api, type CardholderScore } from "@/lib/api";
import {
  canSubmitFeedback,
  confidenceLabel,
  displayCardId,
  productIconForAction,
} from "@/lib/cardholder";
import { ROUTES } from "@/lib/roles";
import { formatKzt } from "@/lib/utils";

const REASON_ICONS = [TrendingUp, Globe2, Lightbulb] as const;

const PRODUCT_ICONS: Record<string, typeof Package> = {
  credit: CreditCard,
  trade: Globe2,
  merchant: Building2,
  payroll: Users,
  treasury: Banknote,
  default: Wallet,
};

export function CardholderDetailPage() {
  const { card_id: cardIdParam } = useParams<{ card_id: string }>();
  const cardId = cardIdParam ? decodeURIComponent(cardIdParam) : "";
  const navigate = useNavigate();
  const { role } = useRole();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cardholder, setCardholder] = useState<CardholderScore | null>(null);

  const load = useCallback(async () => {
    if (!cardId) return;
    setLoading(true);
    setError(null);
    try {
      const rows = await api.getScores(cardId);
      setCardholder(rows[0] ?? null);
      if (!rows.length) {
        setError(`Cardholder not found: ${cardId}`);
      }
    } catch {
      setError(API_UNAVAILABLE_MESSAGE);
      setCardholder(null);
    } finally {
      setLoading(false);
    }
  }, [cardId]);

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

  return (
    <PageShell
      title="Cardholder Detail"
      description="Score drivers, recommended action, and field feedback for a single lead"
      className="pb-24"
    >
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="mb-2 w-fit"
        onClick={() => navigate(ROUTES.salesLeads)}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Sales Leads
      </Button>

      <DataLoadState
        loading={loading}
        error={error}
        onRetry={load}
        skeleton="detail"
      >
        {cardholder && role && (
          <div className="space-y-6">
            <Card>
              <CardContent className="grid gap-6 pt-6 md:grid-cols-[1fr_auto] md:items-center">
                <div className="space-y-3">
                  <p className="font-mono text-lg font-semibold">
                    {displayCardId(cardholder.card_id, role)}
                  </p>
                  <div className="flex flex-wrap gap-3 text-sm text-[var(--color-muted-foreground)]">
                    <span className="flex items-center gap-1">
                      <Building2 className="h-4 w-4" />
                      {cardholder.bank_name}
                    </span>
                    <span className="flex items-center gap-1">
                      <CreditCard className="h-4 w-4" />
                      {cardholder.card_tier}
                    </span>
                    <OpportunityBadge segment={cardholder.opportunity_segment} />
                  </div>
                </div>
                <ScoreGauge score={cardholder.commercial_activity_score} />
              </CardContent>
            </Card>

            <section>
              <h2 className="mb-3 text-lg font-semibold">Why flagged</h2>
              <div className="grid gap-3 sm:grid-cols-3">
                {reasons.map((reason, i) => {
                  const Icon = REASON_ICONS[i] ?? Lightbulb;
                  return (
                    <Card key={reason}>
                      <CardHeader className="pb-2">
                        <div className="flex items-center gap-2">
                          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--color-accent)] text-[#EB001B]">
                            <Icon className="h-5 w-5" />
                          </span>
                          <CardTitle className="text-sm">Reason {i + 1}</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent className="text-sm">{reason}</CardContent>
                    </Card>
                  );
                })}
              </div>
            </section>

            <Card className="border-[#EB001B]/30 bg-gradient-to-br from-red-50/80 to-orange-50/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#EB001B] text-white">
                    <ProductIcon className="h-5 w-5" />
                  </span>
                  Recommended Action
                </CardTitle>
                <CardDescription>Next-best product motion for this lead</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-medium">{cardholder.recommended_action}</p>
              </CardContent>
            </Card>

            <div className="grid gap-4 sm:grid-cols-2">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-[var(--color-muted-foreground)]">
                    Confidence Level
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Badge variant="secondary" className="text-sm">
                    {confidenceLabel(cardholder.confidence_level)} (
                    {(cardholder.confidence_level * 100).toFixed(0)}%)
                  </Badge>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-[var(--color-muted-foreground)]">
                    Expected Annual Value
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold tabular-nums">
                    {formatKzt(cardholder.expected_value_kzt)}
                  </p>
                  <p className="text-xs text-[var(--color-muted-foreground)]">KZT per year</p>
                </CardContent>
              </Card>
            </div>

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
                  . Field feedback can be submitted by Sales Manager, Risk, or Admin roles.
                </CardContent>
              </Card>
            )}
          </div>
        )}
        {!loading && !error && !cardholder && cardId && (
          <p className="text-sm text-[var(--color-muted-foreground)]">
            No cardholder found.{" "}
            <Link to={ROUTES.salesLeads} className="text-[#EB001B] underline">
              Return to sales leads
            </Link>
          </p>
        )}
      </DataLoadState>
      <OpportunityDisclaimer />
    </PageShell>
  );
}
