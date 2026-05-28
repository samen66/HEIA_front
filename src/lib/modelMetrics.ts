export interface ConfusionMatrix {
  tp: number;
  fp: number;
  fn: number;
  tn: number;
}

export interface RocPoint {
  fpr: number;
  tpr: number;
}

/** Approximate TP/FP/FN/TN from precision, recall, and class balance. */
export function estimateConfusionMatrix(
  precision: number,
  recall: number,
  totalRecords: number,
  positiveRate: number,
): ConfusionMatrix {
  const positives = Math.round(totalRecords * positiveRate);
  const negatives = totalRecords - positives;
  const tp = Math.round(recall * positives);
  const fp =
    precision > 0 && tp > 0 ? Math.max(0, Math.round(tp / precision - tp)) : 0;
  const fn = Math.max(0, positives - tp);
  const tn = Math.max(0, negatives - fp);
  return { tp, fp, fn, tn };
}

/** Demo ROC curve shaped by AUC (not fitted to real scores). */
export function buildApproxRocCurve(auc: number): RocPoint[] {
  const exponent = Math.max(0.15, 2.25 - auc * 2);
  return Array.from({ length: 21 }, (_, i) => {
    const fpr = i / 20;
    if (fpr === 0) return { fpr: 0, tpr: 0 };
    if (fpr === 1) return { fpr: 1, tpr: 1 };
    const tpr = Math.min(1, 1 - Math.pow(1 - fpr, 1 / exponent));
    return { fpr: Number(fpr.toFixed(2)), tpr: Number(tpr.toFixed(3)) };
  });
}

export function buildDiagonalRoc(): RocPoint[] {
  return Array.from({ length: 21 }, (_, i) => {
    const v = i / 20;
    return { fpr: v, tpr: v };
  });
}
