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
import { useTranslation } from "react-i18next";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type {
  ConfusionMatrixCounts,
  FeatureImportance,
  ModelMetrics,
} from "@/lib/api";
import { cn, formatPercent } from "@/lib/utils";

const TOP_FEATURE_COLOR = "#7f1d1d";
const OTHER_FEATURE_COLOR = "#9ca3af";

const KPI_ITEMS = [
  { key: "accuracy" as const, labelKey: "model.accuracy" },
  { key: "precision" as const, labelKey: "model.precision" },
  { key: "recall" as const, labelKey: "model.recall" },
  { key: "f1" as const, labelKey: "model.f1" },
  { key: "roc_auc" as const, labelKey: "model.roc_auc" },
];

const MODEL_LOGIC_CARDS = [
  {
    title: "Proxy ranking model",
    body: "Known business cards serve as the positive reference profile when scoring unlabeled consumer cards.",
  },
  {
    title: "Repeated sampling",
    body: "Scores are averaged across repeated samples to reduce instability from a single draw.",
  },
  {
    title: "Business similarity score",
    body: "Each consumer is compared to the business behavior profile on spend pattern features.",
  },
  {
    title: "Final blended score",
    body: "Model ranks and the business similarity score are combined into the prioritization score.",
  },
  {
    title: "K-Means clustering check",
    body: "Cluster assignment is a supporting diagnostic only — not the primary ranking driver.",
  },
];

interface Props {
  metrics: ModelMetrics;
  features: FeatureImportance[];
  viewMode: "full" | "summary";
}

function formatTrainingDate(value?: string): string {
  if (!value) return "—";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function resolveTrainTestSplit(metrics: ModelMetrics): string {
  if (metrics.train_test_split) return metrics.train_test_split;
  const train = metrics.training_samples ?? 0;
  const test = metrics.validation_samples ?? 0;
  const total = train + test;
  if (total <= 0) return "—";
  return `${formatPercent(train / total, 0)} train / ${formatPercent(test / total, 0)} validation`;
}

function resolveConfusionMatrix(metrics: ModelMetrics): ConfusionMatrixCounts {
  const cm = metrics.confusion_matrix;
  if (cm) return cm;
  return { tp: 0, fp: 0, fn: 0, tn: 0 };
}

function formatFeatureLabel(name: string): string {
  return name.replace(/_/g, " ");
}

function normalizeImportancePercent(features: FeatureImportance[]) {
  const total = features.reduce((sum, f) => sum + f.importance_value, 0);
  return features.map((f) => ({
    ...f,
    importancePct:
      total > 0 ? (f.importance_value / total) * 100 : 0,
  }));
}

function MetricKpiCard({ label, value }: { label: string; value: number }) {
  const pct = value * 100;
  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-muted-foreground)]">
        {label}
      </p>
      <p className="mt-2 text-3xl font-bold tabular-nums text-[var(--color-foreground)]">
        {pct.toFixed(1)}%
      </p>
    </div>
  );
}

function ConfusionMatrixGrid({ matrix }: { matrix: ConfusionMatrixCounts }) {
  const cells = [
    {
      abbr: "TP",
      label: "True Positive",
      value: matrix.tp,
      className: "bg-emerald-50 border-emerald-200 text-emerald-900",
    },
    {
      abbr: "FP",
      label: "False Positive",
      value: matrix.fp,
      className: "bg-amber-50 border-amber-200 text-amber-900",
    },
    {
      abbr: "FN",
      label: "False Negative",
      value: matrix.fn,
      className: "bg-orange-50 border-orange-200 text-orange-900",
    },
    {
      abbr: "TN",
      label: "True Negative",
      value: matrix.tn,
      className: "bg-slate-50 border-slate-200 text-slate-900",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {cells.map((cell) => (
        <div
          key={cell.abbr}
          className={cn(
            "flex flex-col items-center justify-center rounded-lg border p-6 text-center",
            cell.className,
          )}
        >
          <span className="text-xs font-semibold uppercase tracking-wide opacity-80">
            {cell.abbr}
          </span>
          <span className="mt-1 text-2xl font-bold tabular-nums">
            {cell.value.toLocaleString()}
          </span>
          <span className="mt-0.5 text-xs opacity-75">{cell.label}</span>
        </div>
      ))}
    </div>
  );
}

export function ModelMonitoringPanel({
  metrics,
  features,
  viewMode,
}: Props) {
  const { t } = useTranslation();
  const isFull = viewMode === "full";
  const trainingDate = metrics.training_date ?? metrics.trained_at;
  const confusion = resolveConfusionMatrix(metrics);

  const sortedFeatures = normalizeImportancePercent(
    [...features].sort((a, b) => b.importance_value - a.importance_value),
  );
  const chartFeatures = isFull ? sortedFeatures : sortedFeatures.slice(0, 5);
  const chartData = chartFeatures.map((f, index) => ({
    name: formatFeatureLabel(f.feature_name),
    importance: Number(f.importancePct.toFixed(1)),
    rank: index + 1,
    feature_name: f.feature_name,
    business_meaning: f.business_meaning,
    importancePct: f.importancePct,
  }));

  return (
    <div className="space-y-8">
      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[var(--color-muted-foreground)]">
          Model info
        </h2>
        <Card>
          <CardHeader>
            <CardTitle>{metrics.model_name}</CardTitle>
            <CardDescription>{t("warnings.proxy_metrics")}</CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-[var(--color-muted-foreground)]">
                  Model name
                </dt>
                <dd className="mt-1 font-semibold">{metrics.model_name}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-[var(--color-muted-foreground)]">
                  Version
                </dt>
                <dd className="mt-1 font-semibold">{metrics.model_version}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-[var(--color-muted-foreground)]">
                  Training date
                </dt>
                <dd className="mt-1 font-semibold">
                  {formatTrainingDate(trainingDate)}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-[var(--color-muted-foreground)]">
                  Train / test split
                </dt>
                <dd className="mt-1 font-semibold">{resolveTrainTestSplit(metrics)}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[var(--color-muted-foreground)]">
          Proxy validation metrics
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {KPI_ITEMS.map(({ key, labelKey }) => (
            <MetricKpiCard key={key} label={t(labelKey)} value={metrics[key]} />
          ))}
        </div>
        <p className="mt-4 rounded-lg border border-amber-200/80 bg-amber-50/80 px-4 py-3 text-sm text-amber-950">
          {t("warnings.proxy_metrics")}
        </p>
      </section>

      {isFull && (
        <>
          <section>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[var(--color-muted-foreground)]">
              Confusion matrix
            </h2>
            <Card>
              <CardHeader>
                <CardTitle>Proxy validation confusion matrix</CardTitle>
                <CardDescription>
                  Counts from the internal proxy validation holdout (
                  {(
                    confusion.tp +
                    confusion.fp +
                    confusion.fn +
                    confusion.tn
                  ).toLocaleString()}{" "}
                  labeled proxy pairs)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ConfusionMatrixGrid matrix={confusion} />
              </CardContent>
            </Card>
          </section>

          <section>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[var(--color-muted-foreground)]">
              Feature importance
            </h2>
            <Card>
              <CardHeader>
                <CardTitle>Feature importance chart</CardTitle>
                <CardDescription>
                  Ranked by relative contribution to the proxy ranking model
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={420}>
                  <BarChart
                    data={chartData}
                    layout="vertical"
                    margin={{ left: 8, right: 24, top: 8, bottom: 8 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis
                      type="number"
                      unit="%"
                      domain={[0, "dataMax"]}
                      tick={{ fontSize: 11 }}
                    />
                    <YAxis
                      type="category"
                      dataKey="name"
                      width={180}
                      tick={{ fontSize: 10 }}
                    />
                    <Tooltip
                      formatter={(value) => [`${value}%`, "Importance"]}
                      labelFormatter={(_, payload) =>
                        payload?.[0]?.payload?.business_meaning ?? ""
                      }
                    />
                    <Bar dataKey="importance" radius={[0, 4, 4, 0]}>
                      {chartData.map((entry) => (
                        <Cell
                          key={entry.feature_name}
                          fill={
                            entry.rank <= 3
                              ? TOP_FEATURE_COLOR
                              : OTHER_FEATURE_COLOR
                          }
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>

                <div className="mt-6 overflow-x-auto">
                  <table className="w-full min-w-[520px] border-collapse text-sm">
                    <thead>
                      <tr className="border-b border-[var(--color-border)] text-left">
                        <th className="pb-3 pr-4 font-semibold text-[var(--color-muted-foreground)]">
                          Feature name
                        </th>
                        <th className="pb-3 pr-4 font-semibold text-[var(--color-muted-foreground)]">
                          Importance (%)
                        </th>
                        <th className="pb-3 font-semibold text-[var(--color-muted-foreground)]">
                          Business meaning
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedFeatures.map((f, index) => (
                        <tr
                          key={f.feature_name}
                          className="border-b border-[var(--color-border)]/60 last:border-0"
                        >
                          <td
                            className={cn(
                              "py-3 pr-4 font-medium",
                              index < 3 && "text-[#7f1d1d]",
                            )}
                          >
                            {formatFeatureLabel(f.feature_name)}
                          </td>
                          <td className="py-3 pr-4 tabular-nums">
                            {f.importancePct.toFixed(1)}%
                          </td>
                          <td className="py-3 text-[var(--color-muted-foreground)]">
                            {f.business_meaning}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </section>

          <section>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[var(--color-muted-foreground)]">
              Model logic explanation
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
              {MODEL_LOGIC_CARDS.map((card, index) => (
                <Card key={card.title} className="h-full">
                  <CardHeader className="pb-2">
                    <p className="text-xs font-semibold uppercase tracking-wide text-[#EB001B]">
                      Step {index + 1}
                    </p>
                    <CardTitle className="text-base leading-snug">
                      {card.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-[var(--color-muted-foreground)]">
                      {card.body}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        </>
      )}

      {!isFull && (
        <p className="rounded-lg border border-dashed border-[var(--color-border)] bg-[var(--color-muted)]/30 px-4 py-3 text-sm text-[var(--color-muted-foreground)]">
          Summary view — full confusion matrix, feature chart, and model logic
          are available to Data Scientist and Admin roles only.
        </p>
      )}
    </div>
  );
}
