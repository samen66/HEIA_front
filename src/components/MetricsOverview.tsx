import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { ModelMetrics } from "@/lib/api";
import {
  buildApproxRocCurve,
  buildDiagonalRoc,
  estimateConfusionMatrix,
} from "@/lib/modelMetrics";
import { cn, formatPercent } from "@/lib/utils";

interface Props {
  metrics: ModelMetrics;
  viewMode?: "full" | "summary";
}

const KPI_ITEMS = [
  { key: "accuracy" as const, label: "Accuracy" },
  { key: "precision" as const, label: "Precision" },
  { key: "recall" as const, label: "Recall" },
  { key: "f1" as const, label: "F1 Score" },
  { key: "roc_auc" as const, label: "ROC-AUC" },
];

function formatTrainingDate(iso?: string): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function MetricKpiCard({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  const pct = value * 100;
  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-muted-foreground)]">
        {label}
      </p>
      <p className="mt-2 text-3xl font-bold tabular-nums text-[var(--color-foreground)]">
        {pct.toFixed(1)}%
      </p>
      <div className="mt-3">
        <div className="h-1.5 overflow-hidden rounded-full bg-[var(--color-muted)]">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#EB001B] to-[#F79E1B]"
            style={{ width: `${Math.min(100, pct)}%` }}
          />
        </div>
        <p className="mt-1 text-[10px] text-[var(--color-muted-foreground)]">
          vs 100% benchmark
        </p>
      </div>
    </div>
  );
}

function ConfusionMatrixGrid({
  matrix,
}: {
  matrix: ReturnType<typeof estimateConfusionMatrix>;
}) {
  const cells = [
    {
      label: "True Positive",
      abbr: "TP",
      value: matrix.tp,
      className: "bg-emerald-50 border-emerald-200 text-emerald-900",
    },
    {
      label: "False Positive",
      abbr: "FP",
      value: matrix.fp,
      className: "bg-amber-50 border-amber-200 text-amber-900",
    },
    {
      label: "False Negative",
      abbr: "FN",
      value: matrix.fn,
      className: "bg-orange-50 border-orange-200 text-orange-900",
    },
    {
      label: "True Negative",
      abbr: "TN",
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

export function MetricsOverview({ metrics, viewMode = "full" }: Props) {
  const isFull = viewMode === "full";
  const trainSamples = metrics.training_samples ?? 0;
  const valSamples = metrics.validation_samples ?? 0;
  const totalRecords = trainSamples + valSamples || valSamples || 4605;
  const positiveRate = metrics.positive_class_rate ?? 0.22;

  const confusion = estimateConfusionMatrix(
    metrics.precision,
    metrics.recall,
    valSamples || totalRecords,
    positiveRate,
  );

  const rocModel = buildApproxRocCurve(metrics.roc_auc);
  const rocDiagonal = buildDiagonalRoc();
  const rocData = rocModel.map((point, i) => ({
    fpr: point.fpr,
    model: point.tpr,
    random: rocDiagonal[i]?.tpr ?? point.fpr,
  }));

  const trainPct =
    totalRecords > 0
      ? formatPercent(trainSamples / totalRecords, 0)
      : "80%";
  const testPct =
    totalRecords > 0
      ? formatPercent(valSamples / totalRecords, 0)
      : "20%";

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Model Information</CardTitle>
          <CardDescription>
            {metrics.notes ??
              "Commercial activity classifier for Kazakhstan Mastercard portfolio"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-[var(--color-muted-foreground)]">
                Model
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
                {formatTrainingDate(metrics.trained_at)}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-[var(--color-muted-foreground)]">
                Train / test split
              </dt>
              <dd className="mt-1 font-semibold">
                {trainSamples.toLocaleString()} / {valSamples.toLocaleString()}{" "}
                <span className="text-sm font-normal text-[var(--color-muted-foreground)]">
                  ({trainPct} / {testPct})
                </span>
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[var(--color-muted-foreground)]">
          Key performance indicators
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {KPI_ITEMS.map(({ key, label }) => (
            <MetricKpiCard key={key} label={label} value={metrics[key]} />
          ))}
        </div>
      </div>

      {isFull && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Confusion Matrix</CardTitle>
              <CardDescription>
                Approximated from precision, recall, and validation set size (
                {valSamples.toLocaleString()} records,{" "}
                {formatPercent(positiveRate, 0)} positive rate)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ConfusionMatrixGrid matrix={confusion} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>ROC Curve</CardTitle>
              <CardDescription>
                Approximate curve shaped by ROC-AUC {formatPercent(metrics.roc_auc, 0)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={rocData} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="fpr"
                    type="number"
                    domain={[0, 1]}
                    tickFormatter={(v) => v.toFixed(1)}
                    label={{
                      value: "False Positive Rate",
                      position: "insideBottom",
                      offset: -4,
                      style: { fontSize: 11 },
                    }}
                  />
                  <YAxis
                    domain={[0, 1]}
                    tickFormatter={(v) => v.toFixed(1)}
                    label={{
                      value: "True Positive Rate",
                      angle: -90,
                      position: "insideLeft",
                      style: { fontSize: 11 },
                    }}
                  />
                  <Tooltip
                    formatter={(value, name) => [
                      Number(value ?? 0).toFixed(3),
                      name === "model" ? "Model" : "Random",
                    ]}
                    labelFormatter={(fpr) => `FPR: ${Number(fpr).toFixed(2)}`}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="random"
                    name="Random (AUC 0.5)"
                    stroke="#9ca3af"
                    strokeDasharray="4 4"
                    dot={false}
                    strokeWidth={1.5}
                  />
                  <Line
                    type="monotone"
                    dataKey="model"
                    name={`Model (AUC ${metrics.roc_auc.toFixed(2)})`}
                    stroke="#EB001B"
                    dot={false}
                    strokeWidth={2.5}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      <p className="rounded-lg border border-dashed border-[var(--color-border)] bg-[var(--color-muted)]/30 px-4 py-3 text-sm text-[var(--color-muted-foreground)]">
        Director and Product Manager see only summary. Full metrics visible to
        Data Scientist, Risk, Admin.
      </p>
    </div>
  );
}
