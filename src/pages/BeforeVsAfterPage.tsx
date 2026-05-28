import { ArrowRight, Check, X } from "lucide-react";
import { DataLoadState } from "@/components/DataLoadState";
import { PageShell } from "@/components/PageShell";
import { useDashboardData } from "@/hooks/useDashboardData";
import { getPortfolioImpactSummary } from "@/lib/segmentStats";
import { cn } from "@/lib/utils";

const BEFORE_ITEMS = [
  "Manual analysis only",
  "Generic mass campaigns",
  "No customer prioritization",
  "Low conversion efficiency",
  "Cannot explain targeting",
  "No feedback loop",
  "Weeks to get insights",
] as const;

const AFTER_ITEMS = [
  "ML-based opportunity detection",
  "Prioritized targeted customer list",
  "Explainable reason codes per customer",
  "Product-specific recommendations",
  "Estimated business impact (KZT)",
  "Sales feedback tracking",
  "Real-time insights",
] as const;

export function BeforeVsAfterPage() {
  const { loading, error, segments, scores, reload } = useDashboardData();

  const impact = getPortfolioImpactSummary(segments, scores);

  return (
    <PageShell
      title="Before vs After"
      description="How HEIA transforms commercial card analytics into revenue"
    >
      <DataLoadState
        loading={loading}
        error={error}
        onRetry={reload}
        skeleton="cards"
      >
        <div className="overflow-hidden rounded-xl border border-slate-200 shadow-sm">
          <div className="grid md:grid-cols-2">
            <ComparisonColumn
              variant="before"
              title="Before"
              items={BEFORE_ITEMS}
            />
            <ComparisonColumn
              variant="after"
              title="After"
              items={AFTER_ITEMS}
            />
          </div>
        </div>

        <div className="space-y-6 rounded-xl border border-[#F79E1B]/30 bg-gradient-to-br from-white via-white to-orange-50/30 px-6 py-8 text-center">
          <p className="text-lg font-semibold leading-relaxed text-[var(--color-foreground)] md:text-xl">
            HEIA converts ML predictions into business revenue for Mastercard
            and partner banks.
          </p>

          <div className="mx-auto max-w-3xl rounded-lg border border-slate-200 bg-white/80 px-5 py-4">
            <p className="text-base font-medium tabular-nums text-[#EB001B] md:text-lg">
              Detected{" "}
              <span className="font-bold">
                {impact.hiddenEntrepreneurs.toLocaleString()}
              </span>{" "}
              potential hidden entrepreneurs across{" "}
              <span className="font-bold">{impact.bankCount}</span> banks
              <span className="text-[var(--color-muted-foreground)]">
                {" "}
                | Estimated opportunity:{" "}
              </span>
              <span className="font-bold">{impact.opportunityLabel}</span>
            </p>
            <p className="mt-2 text-xs text-[var(--color-muted-foreground)]">
              Live figures from portfolio segment analysis
            </p>
          </div>
        </div>
      </DataLoadState>
    </PageShell>
  );
}

function ComparisonColumn({
  variant,
  title,
  items,
}: {
  variant: "before" | "after";
  title: string;
  items: readonly string[];
}) {
  const isBefore = variant === "before";

  return (
    <div className="flex flex-col">
      <div
        className={cn(
          "px-5 py-4 text-center",
          isBefore
            ? "bg-red-600 text-white"
            : "bg-emerald-600 text-white md:border-l md:border-emerald-700",
        )}
      >
        <h2 className="text-lg font-bold tracking-tight">{title}</h2>
        <p className="mt-0.5 text-xs font-medium uppercase tracking-wider opacity-90">
          {isBefore ? "Legacy approach" : "With HEIA"}
        </p>
      </div>
      <ul className="flex flex-1 flex-col gap-0 divide-y divide-slate-100 bg-white">
        {items.map((item) => (
          <li
            key={item}
            className="flex items-start gap-3 px-5 py-3.5 text-sm"
          >
            {isBefore ? (
              <X className="mt-0.5 h-4 w-4 shrink-0 text-red-500" aria-hidden />
            ) : (
              <Check
                className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600"
                aria-hidden
              />
            )}
            <span
              className={cn(
                isBefore
                  ? "text-[var(--color-muted-foreground)]"
                  : "font-medium text-[var(--color-foreground)]",
              )}
            >
              {item}
            </span>
            {!isBefore && (
              <ArrowRight
                className="ml-auto hidden h-4 w-4 shrink-0 text-emerald-400 sm:block"
                aria-hidden
              />
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
