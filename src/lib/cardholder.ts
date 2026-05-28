import type { UserRole } from "@/lib/roles";

export const FEEDBACK_STATUS_OPTIONS = [
  "Not contacted",
  "Contacted",
  "Converted",
  "Not interested",
  "False positive",
  "Needs follow-up",
  "Already business customer",
] as const;

export type FeedbackStatusOption = (typeof FEEDBACK_STATUS_OPTIONS)[number];

const OPPORTUNITY_COLORS: Record<string, string> = {
  "SME Lending": "bg-blue-100 text-blue-800 border-blue-200",
  "Trade Finance": "bg-violet-100 text-violet-800 border-violet-200",
  "Treasury Services": "bg-slate-100 text-slate-800 border-slate-200",
  "Merchant Acquiring": "bg-amber-100 text-amber-900 border-amber-200",
  "Payroll Solutions": "bg-emerald-100 text-emerald-800 border-emerald-200",
  "Working Capital": "bg-orange-100 text-orange-900 border-orange-200",
};

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
    OPPORTUNITY_COLORS[segment] ??
    "bg-[var(--color-secondary)] text-[var(--color-secondary-foreground)] border-[var(--color-border)]"
  );
}

export function confidenceLabel(level: number): string {
  const pct = Math.round(level * 100);
  if (pct >= 90) return "Very High";
  if (pct >= 75) return "High";
  if (pct >= 60) return "Medium";
  return "Low";
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
