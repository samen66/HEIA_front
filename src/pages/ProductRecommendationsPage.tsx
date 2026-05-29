import { useTranslation } from "react-i18next";
import { DataLoadState } from "@/components/DataLoadState";
import { PageShell } from "@/components/PageShell";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useDashboardData } from "@/hooks/useDashboardData";
import { formatKzt } from "@/lib/utils";

export function ProductRecommendationsPage() {
  const { t } = useTranslation();
  const { loading, error, segments, products, reload } = useDashboardData();

  const bySegment = (seg: string) =>
    segments
      .filter((s) => s.risk_segment === seg)
      .reduce((sum, s) => sum + s.number_of_cardholders, 0);

  const topProducts = [...products]
    .sort((a, b) => b.estimated_opportunity_value - a.estimated_opportunity_value)
    .filter((p) => p.recommended_action !== "Monitor only")
    .slice(0, 4);

  return (
    <PageShell
      title={t("products.title")}
      description={t("products.description")}
    >
      <DataLoadState
        loading={loading}
        error={error}
        onRetry={reload}
        skeleton="cards"
      >
        <div className="grid gap-4 md:grid-cols-3">
          <SegmentCount label="High" count={bySegment("High")} />
          <SegmentCount label="Medium" count={bySegment("Medium")} />
          <SegmentCount label="Low" count={bySegment("Low")} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {topProducts.map((rec) => (
            <Card key={rec.recommended_action}>
              <CardHeader>
                <CardTitle className="text-base">
                  {rec.recommended_product ?? rec.recommended_action}
                </CardTitle>
                <CardDescription>
                  {rec.number_of_cardholders.toLocaleString()} cardholders · avg
                  score {(rec.average_score * 100).toFixed(0)}%
                </CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-[var(--color-muted-foreground)]">
                Estimated opportunity:{" "}
                <span className="font-medium text-[var(--color-foreground)]">
                  {formatKzt(rec.estimated_opportunity_value)}
                </span>
              </CardContent>
            </Card>
          ))}
        </div>
      </DataLoadState>
    </PageShell>
  );
}

function SegmentCount({ label, count }: { label: string; count: number }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm text-[var(--color-muted-foreground)]">
          {label} segment
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold">{count.toLocaleString()} cardholders</p>
      </CardContent>
    </Card>
  );
}
