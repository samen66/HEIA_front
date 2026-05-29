import { ArrowRight, Check, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { DataLoadState } from "@/components/DataLoadState";
import { PageShell } from "@/components/PageShell";
import { useDashboardData } from "@/hooks/useDashboardData";
import { getPortfolioImpactSummary } from "@/lib/segmentStats";
import { cn } from "@/lib/utils";

export function BeforeVsAfterPage() {
  const { t } = useTranslation();
  const { loading, error, segments, banks, reload } = useDashboardData();

  const impact = getPortfolioImpactSummary(segments, [], banks.length);

  return (
    <PageShell
      title={t("before_after.title")}
      description={t("before_after.description")}
    >
      <DataLoadState
        loading={loading}
        error={error}
        onRetry={reload}
        skeleton="cards"
      >
        <div className="overflow-hidden rounded-xl border border-slate-200 shadow-sm">
          <div className="grid md:grid-cols-2">
            <ComparisonColumn variant="before" title={t("before_after.before")} />
            <ComparisonColumn variant="after" title={t("before_after.after")} />
          </div>
        </div>

        <div className="space-y-6 rounded-xl border border-[#F79E1B]/30 bg-gradient-to-br from-white via-white to-orange-50/30 px-6 py-8 text-center">
          <p className="text-lg font-semibold leading-relaxed text-[var(--color-foreground)] md:text-xl">
            {t("before_after.summary")}
          </p>

          <div className="mx-auto max-w-3xl rounded-lg border border-slate-200 bg-white/80 px-5 py-4">
            <p className="text-base font-medium tabular-nums text-[#EB001B] md:text-lg">
              {t("before_after.detected", {
                count: impact.hiddenEntrepreneurs.toLocaleString(),
                banks: impact.bankCount,
                value: impact.opportunityLabel,
              })}
            </p>
            <p className="mt-2 text-xs text-[var(--color-muted-foreground)]">
              {t("before_after.live_figures")}
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
}: {
  variant: "before" | "after";
  title: string;
}) {
  const { t } = useTranslation();
  const isBefore = variant === "before";
  const itemKeys = isBefore
    ? ([
        "before_after.item_before_1",
        "before_after.item_before_2",
        "before_after.item_before_3",
        "before_after.item_before_4",
        "before_after.item_before_5",
        "before_after.item_before_6",
        "before_after.item_before_7",
      ] as const)
    : ([
        "before_after.item_after_1",
        "before_after.item_after_2",
        "before_after.item_after_3",
        "before_after.item_after_4",
        "before_after.item_after_5",
        "before_after.item_after_6",
        "before_after.item_after_7",
      ] as const);

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
      </div>
      <ul className="flex flex-1 flex-col gap-0 divide-y divide-slate-100 bg-white">
        {itemKeys.map((key) => (
          <li key={key} className="flex items-start gap-3 px-5 py-3.5 text-sm">
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
              {t(key)}
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
