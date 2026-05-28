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

const RECOMMENDATIONS = [
  {
    product: "SME Business Credit Line",
    segment: "High",
    rationale: "Strong transaction velocity + recurring B2B merchants",
  },
  {
    product: "Payroll & Expense Bundle",
    segment: "Medium",
    rationale: "Growing employee card usage patterns",
  },
  {
    product: "Cross-border Trade Facility",
    segment: "High",
    rationale: "FX spend concentration in import categories",
  },
  {
    product: "Digital Invoicing Add-on",
    segment: "Low",
    rationale: "Early-stage entrepreneur signals; nurture track",
  },
];

export function ProductRecommendationsPage() {
  const { loading, error, scores, reload } = useDashboardData();

  const bySegment = (seg: string) =>
    scores.filter((s) => s.risk_segment === seg).length;

  return (
    <PageShell
      title="Product Recommendations"
      description="Next-best product actions aligned to HEIA opportunity segments"
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
          {RECOMMENDATIONS.map((rec) => (
            <Card key={rec.product}>
              <CardHeader>
                <CardTitle className="text-base">{rec.product}</CardTitle>
                <CardDescription>
                  Target segment:{" "}
                  <span className="font-medium text-[#EB001B]">{rec.segment}</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-[var(--color-muted-foreground)]">
                {rec.rationale}
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
        <p className="text-2xl font-bold">{count} cardholders</p>
      </CardContent>
    </Card>
  );
}
