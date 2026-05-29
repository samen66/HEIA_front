import type { UserRole } from "@/lib/roles";

export const FEEDBACK_STATUS_OPTIONS = [
  "Not reviewed",
  "Not contacted",
  "Contacted",
  "Converted",
  "Not interested",
  "False positive",
  "Needs follow-up",
  "Already business customer",
] as const;

export type FeedbackStatusOption = (typeof FEEDBACK_STATUS_OPTIONS)[number];

const OPPORTUNITY_SEGMENT_COLORS: Record<string, string> = {
  "Top 1% highest priority": "bg-red-950 text-white border-red-950",
  "Top 5% priority": "bg-red-600 text-white border-red-600",
  "Top 10% review": "bg-orange-500 text-white border-orange-500",
  "Standard monitoring": "bg-slate-400 text-white border-slate-400",
};

const PRODUCT_OPPORTUNITY_COLORS: Record<string, string> = {
  "SME Lending": "bg-blue-100 text-blue-800 border-blue-200",
  "Trade Finance": "bg-violet-100 text-violet-800 border-violet-200",
  "Treasury Services": "bg-slate-100 text-slate-800 border-slate-200",
  "Merchant Acquiring": "bg-amber-100 text-amber-900 border-amber-200",
  "Payroll Solutions": "bg-emerald-100 text-emerald-800 border-emerald-200",
  "Working Capital": "bg-orange-100 text-orange-900 border-orange-200",
};

const FEEDBACK_STATUS_COLORS: Record<string, string> = {
  "Not reviewed": "bg-slate-100 text-slate-700 border-slate-200",
  "Not contacted": "bg-slate-100 text-slate-700 border-slate-200",
  Contacted: "bg-blue-100 text-blue-800 border-blue-200",
  Converted: "bg-emerald-100 text-emerald-800 border-emerald-200",
  "Not interested": "bg-slate-200 text-slate-800 border-slate-300",
  "False positive": "bg-red-100 text-red-800 border-red-200",
  "Needs follow-up": "bg-amber-100 text-amber-900 border-amber-200",
  "Already business customer": "bg-violet-100 text-violet-800 border-violet-200",
};

const CONFIDENCE_COLORS: Record<string, string> = {
  "Very High": "bg-emerald-100 text-emerald-900 border-emerald-200",
  High: "bg-emerald-50 text-emerald-800 border-emerald-200",
  Medium: "bg-amber-100 text-amber-900 border-amber-200",
  Low: "bg-slate-100 text-slate-700 border-slate-200",
};

export const OPPORTUNITY_SEGMENT_OPTIONS = [
  "Top 1% highest priority",
  "Top 5% priority",
  "Top 10% review",
  "Standard monitoring",
] as const;

export type LeadSortKey =
  | "score_desc"
  | "expected_value_asc"
  | "expected_value_desc"
  | "bank";

export function canSeeFullCardId(role: UserRole | null): boolean {
  if (!role) return false;
  return role === "sales_manager" || role === "risk_compliance" || role === "admin";
}

export function canSubmitFeedback(role: UserRole | null): boolean {
  return canSeeFullCardId(role);
}

export function maskCardId(cardId: string): string {
  if (cardId.length <= 4) return "***";
  const visible = cardId.slice(0, -3);
  return `${visible}***`;
}

export function displayCardId(cardId: string, role: UserRole | null): string {
  return canSeeFullCardId(role) ? cardId : maskCardId(cardId);
}

export function scoreToPercent(score: number): number {
  return Math.round(Math.min(1, Math.max(0, score)) * 100);
}

export function opportunityBadgeClass(segment: string): string {
  return (
    OPPORTUNITY_SEGMENT_COLORS[segment] ??
    PRODUCT_OPPORTUNITY_COLORS[segment] ??
    "bg-[var(--color-secondary)] text-[var(--color-secondary-foreground)] border-[var(--color-border)]"
  );
}

export function feedbackStatusBadgeClass(status: string): string {
  return (
    FEEDBACK_STATUS_COLORS[status] ??
    "bg-[var(--color-secondary)] text-[var(--color-secondary-foreground)] border-[var(--color-border)]"
  );
}

export function confidenceLabel(level: number | string): string {
  if (typeof level === "string") return level;
  const pct = Math.round(level * 100);
  if (pct >= 90) return "Very High";
  if (pct >= 75) return "High";
  if (pct >= 60) return "Medium";
  return "Low";
}

export function confidenceBadgeClass(level: number | string): string {
  const label = confidenceLabel(level);
  return (
    CONFIDENCE_COLORS[label] ??
    "bg-[var(--color-secondary)] text-[var(--color-secondary-foreground)] border-[var(--color-border)]"
  );
}

export function isLowOrMediumConfidence(level: number | string): boolean {
  const label = confidenceLabel(level);
  return label === "Low" || label === "Medium";
}

export function isLeadsListRestricted(role: UserRole | null): boolean {
  return role === "director" || role === "product_manager";
}

export function isCardholderDetailRestricted(role: UserRole | null): boolean {
  return role === "director";
}

export interface BehaviorShareFields {
  online_amount_share?: number;
  pos_amount_share?: number;
  recurring_amount_share?: number;
  weekend_transaction_share?: number;
  night_amount_share?: number;
}

export function recommendationLogicNote(shares: BehaviorShareFields): string {
  const candidates: { label: string; value: number }[] = [
    { label: "online spend", value: Number(shares.online_amount_share ?? 0) },
    { label: "POS spend", value: Number(shares.pos_amount_share ?? 0) },
    {
      label: "recurring payments",
      value: Number(shares.recurring_amount_share ?? 0),
    },
    {
      label: "weekend activity",
      value: Number(shares.weekend_transaction_share ?? 0),
    },
    { label: "night-time spend", value: Number(shares.night_amount_share ?? 0) },
  ];
  const top = candidates.reduce((best, cur) =>
    cur.value > best.value ? cur : best,
  );
  const pct = Math.round(top.value * 100);
  return `Recommendation logic: highest behavioral signal is ${top.label} (${pct}% of observed spend pattern).`;
}

/** Maps model reason text to a product action from the opportunity catalog. */
export function reasonToRecommendedProduct(reason: string): string {
  const r = reason.toLowerCase();
  if (r.includes("pos") || r.includes("terminal")) {
    return "Offer POS acquiring / business card";
  }
  if (r.includes("e-commerce") || r.includes("platform")) {
    return "Offer e-commerce acquiring / business card";
  }
  if (
    r.includes("b2b") ||
    r.includes("supplier") ||
    r.includes("cross-border") ||
    r.includes("trade")
  ) {
    return "Enable trade finance package";
  }
  if (r.includes("payroll") || r.includes("recurring")) {
    return "Offer SME package for recurring expenses";
  }
  if (
    r.includes("repayment") ||
    r.includes("credit") ||
    r.includes("utilization")
  ) {
    return "Offer SME digital business card package";
  }
  if (
    r.includes("turnover") ||
    r.includes("revenue") ||
    r.includes("seasonal") ||
    r.includes("cash flow")
  ) {
    return "Relationship manager review";
  }
  return "Business card offer review";
}

export function productIconForAction(action: string): string {
  const a = action.toLowerCase();
  if (a.includes("credit") || a.includes("lending")) return "credit";
  if (a.includes("trade") || a.includes("finance")) return "trade";
  if (a.includes("merchant") || a.includes("pos")) return "merchant";
  if (a.includes("payroll")) return "payroll";
  if (a.includes("treasury")) return "treasury";
  return "default";
}

export function roleToApiLabel(role: UserRole): string {
  const map: Record<UserRole, string> = {
    director: "Director",
    product_manager: "Product Manager",
    sales_manager: "Sales Manager",
    risk_compliance: "Risk / Compliance",
    data_scientist: "Data Scientist",
    admin: "Admin",
    judge_demo: "Judge Demo",
  };
  return map[role];
}

export function cardholderPath(cardId: string): string {
  return `/cardholder/${encodeURIComponent(cardId)}`;
}
