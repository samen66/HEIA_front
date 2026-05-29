import type { TFunction } from "i18next";
import { ROUTES, type AppPath } from "@/lib/roles";

const FEEDBACK_STATUS_KEYS: Record<string, string> = {
  "Not reviewed": "feedback_statuses.not_reviewed",
  "Not contacted": "feedback_statuses.not_contacted",
  Contacted: "feedback_statuses.contacted",
  Converted: "feedback_statuses.converted",
  "Not interested": "feedback_statuses.not_interested",
  "False positive": "feedback_statuses.false_positive",
  "Needs follow-up": "feedback_statuses.needs_followup",
  "Already business customer": "feedback_statuses.already_business",
};

const SEGMENT_KEYS: Record<string, string> = {
  "Top 1% highest priority": "segments.top1",
  "Top 5% priority": "segments.top5",
  "Top 10% review": "segments.top10",
  "Standard monitoring": "segments.standard",
};

const CONFIDENCE_KEYS: Record<string, string> = {
  "Very High": "confidence.very_high",
  High: "confidence.high",
  Medium: "confidence.medium",
  Low: "confidence.low",
};

const PATH_LABEL_KEYS: Record<string, string> = {
  [ROUTES.dashboard]: "nav.dashboard",
  [ROUTES.businessImpact]: "nav.business_impact",
  [ROUTES.beforeVsAfter]: "nav.before_after",
  [ROUTES.productRecommendations]: "nav.product_recommendations",
  [ROUTES.salesLeads]: "nav.sales_leads",
  [ROUTES.riskCompliance]: "nav.risk_compliance",
  [ROUTES.feedback]: "nav.feedback",
  [ROUTES.modelMetrics]: "nav.model_metrics",
  [ROUTES.featureImportance]: "nav.feature_importance",
  [ROUTES.judgeDemo]: "nav.guided_demo",
  [ROUTES.aiAgent]: "nav.ai_agent",
};

const NAV_KEY_BY_PATH: Record<AppPath, string> = {
  [ROUTES.dashboard]: "nav.dashboard",
  [ROUTES.businessImpact]: "nav.business_impact",
  [ROUTES.beforeVsAfter]: "nav.before_after",
  [ROUTES.productRecommendations]: "nav.product_recommendations",
  [ROUTES.salesLeads]: "nav.sales_leads",
  [ROUTES.riskCompliance]: "nav.risk_compliance",
  [ROUTES.cardholder]: "nav.cardholder",
  [ROUTES.feedback]: "nav.feedback",
  [ROUTES.modelMetrics]: "nav.model_metrics",
  [ROUTES.featureImportance]: "nav.feature_importance",
  [ROUTES.judgeDemo]: "nav.guided_demo",
  [ROUTES.aiAgent]: "nav.ai_agent",
};

const ROLE_LABEL_KEYS: Record<string, string> = {
  director: "roles.director",
  product_manager: "roles.product_manager",
  sales_manager: "roles.sales_manager",
  risk_compliance: "roles.risk_compliance",
  data_scientist: "roles.data_scientist",
  admin: "roles.admin",
  judge_demo: "roles.judge_demo",
};

const ROLE_DESC_KEYS: Record<string, string> = {
  director: "roles.director_desc",
  product_manager: "roles.product_manager_desc",
  sales_manager: "roles.sales_manager_desc",
  risk_compliance: "roles.risk_compliance_desc",
  data_scientist: "roles.data_scientist_desc",
  admin: "roles.admin_desc",
  judge_demo: "roles.judge_demo_desc",
};

export function translateFeedbackStatus(t: TFunction, status: string): string {
  const key = FEEDBACK_STATUS_KEYS[status];
  return key ? t(key) : status;
}

export function translateSegment(t: TFunction, segment: string): string {
  const key = SEGMENT_KEYS[segment];
  return key ? t(key) : segment;
}

export function translateConfidence(t: TFunction, label: string): string {
  const key = CONFIDENCE_KEYS[label];
  return key ? t(key) : label;
}

export function getNavLabelKey(path: AppPath): string {
  return NAV_KEY_BY_PATH[path] ?? "common.page";
}

export function getRouteLabelKey(pathname: string): string {
  const path = pathname.split("?")[0];
  if (path.startsWith(`${ROUTES.cardholder}/`)) {
    return "nav.cardholder";
  }
  for (const [route, key] of Object.entries(PATH_LABEL_KEYS)) {
    if (path === route || path.startsWith(`${route}/`)) {
      return key;
    }
  }
  return "common.page";
}

export function translateRole(t: TFunction, role: string): string {
  const key = ROLE_LABEL_KEYS[role];
  return key ? t(key) : role;
}

export function translateRoleDescription(t: TFunction, role: string): string {
  const key = ROLE_DESC_KEYS[role];
  return key ? t(key) : role;
}

export const AGENT_SUGGESTED_KEYS = [
  "agent.suggested_1",
  "agent.suggested_2",
  "agent.suggested_3",
  "agent.suggested_4",
  "agent.suggested_5",
  "agent.suggested_6",
  "agent.suggested_7",
  "agent.suggested_8",
] as const;
