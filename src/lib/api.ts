import { API_UNAVAILABLE_MESSAGE } from "@/lib/apiErrors";

const API_BASE = (import.meta.env.VITE_API_URL ?? "").replace(/\/+$/, "");

export interface GetScoresParams {
  cardId?: string;
  riskSegment?: string;
  limit?: number;
  offset?: number;
}

export interface GetLeadsParams {
  role?: string;
  bank?: string;
  segment?: string;
  feedback?: string;
  search?: string;
  sort?: string;
  limit?: number;
  offset?: number;
}

export interface LeadsListResponse {
  leads: CardholderScore[];
  total: number;
}

export interface AggregatedLeadsResponse {
  view: "aggregated";
  total_leads: number;
  average_score: number;
  total_expected_value_kzt: number;
  by_bank: {
    bank_name: string;
    lead_count: number;
    average_score: number;
    total_expected_value_kzt: number;
  }[];
  by_segment: {
    risk_segment: string;
    lead_count: number;
    average_score: number;
    total_expected_value_kzt: number;
  }[];
}

export interface CardholderScore {
  card_id: string;
  bank_name: string;
  card_tier: string;
  commercial_activity_score: number;
  risk_segment: string;
  opportunity_segment: string;
  recommended_action: string;
  confidence_level: number | string;
  top_reason_1: string;
  top_reason_2: string;
  top_reason_3: string;
  expected_value_kzt: number;
  feedback_status: string;
}

export interface ConfusionMatrixCounts {
  tp: number;
  fp: number;
  fn: number;
  tn: number;
}

export interface ModelMetrics {
  model_name: string;
  model_version: string;
  trained_at?: string;
  training_date?: string;
  train_test_split?: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1: number;
  roc_auc: number;
  training_samples?: number;
  validation_samples?: number;
  positive_class_rate?: number;
  notes?: string;
  important_note?: string;
  model_type?: string;
  confusion_matrix?: ConfusionMatrixCounts;
}

export interface FeatureImportance {
  feature_name: string;
  importance_value: number;
  business_meaning: string;
}

export interface SegmentSummary {
  risk_segment: string;
  opportunity_segment?: string;
  number_of_cardholders: number;
  average_score: number;
  recommended_product: string;
  estimated_conversion_rate: number;
  estimated_opportunity_value: number;
}

export interface KpiSummary {
  total_scored_consumers: number;
  top_1_percent_candidates?: number;
  top_5_percent_candidates?: number;
  top_10_percent_candidates?: number;
  estimated_total_opportunity_kzt: number;
  average_score: number;
}

export interface BankOpportunitySummary {
  bank_name: string;
  number_of_cardholders: number;
  average_score: number;
  high_priority_count: number;
  high_opportunity_count?: number;
  estimated_opportunity_value: number;
}

export interface ProductOpportunitySummary {
  recommended_action: string;
  recommended_product?: string;
  number_of_cardholders: number;
  average_score: number;
  estimated_opportunity_value: number;
}

export interface BusinessImpactAssumptions {
  annualization_factor?: number;
  revenue_margin?: number;
  conversion_rates?: Record<string, number>;
  conversion_rate_pct?: number;
  conversion_rate_conservative?: number;
  conversion_rate_base?: number;
  conversion_rate_optimistic?: number;
  avg_annual_revenue_kzt?: number;
  campaign_cost_kzt?: number;
  note?: string;
}

export interface CardholderBehaviorMetrics {
  total_amount_kzt?: number;
  median_transaction_amount_kzt?: number;
  amount_per_active_day_kzt?: number;
  online_amount_share?: number;
  pos_amount_share?: number;
  recurring_amount_share?: number;
  weekend_transaction_share?: number;
  night_amount_share?: number;
}

export type CardholderDetail = CardholderScore &
  CardholderBehaviorMetrics &
  Record<string, string | number | undefined>;

export interface FeedbackEntry {
  card_id: string;
  user_role: string;
  feedback_status: string;
  comment: string;
  date: string;
}

export interface AuditLogEntry {
  card_id: string;
  user_role: string;
  old_status: string;
  new_status: string;
  timestamp: string;
  comment?: string;
}

export interface BusinessImpactCalculateRequest {
  high_opportunity_customers: number;
  conversion_rate_pct: number;
  avg_annual_revenue_kzt: number;
  campaign_cost_kzt: number;
}

export interface BusinessImpactCalculateResponse
  extends BusinessImpactCalculateRequest {
  converted_customers: number;
  estimated_gross_revenue_kzt: number;
  net_business_impact_kzt: number;
  roi_pct: number;
}

export interface AgentQuestionResponse {
  question: string;
  answer: string;
  supporting_data: Record<string, string | number>;
  timestamp: string;
}

function buildQuery(params: Record<string, string | number | undefined>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") {
      search.set(key, String(value));
    }
  }
  const q = search.toString();
  return q ? `?${q}` : "";
}

async function fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  try {
    const res = await fetch(`${API_BASE}${path}`, init);
    if (!res.ok) {
      throw new Error(`API error ${res.status}: ${path}`);
    }
    return (await res.json()) as T;
  } catch (err) {
    if (err instanceof Error && err.message.startsWith("API error")) {
      throw err;
    }
    throw new Error(API_UNAVAILABLE_MESSAGE);
  }
}

export class ApiResponseError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "ApiResponseError";
  }
}

async function fetchJsonAllowStatus<T>(
  path: string,
  init?: RequestInit,
): Promise<{ status: number; data?: T }> {
  try {
    const res = await fetch(`${API_BASE}${path}`, init);
    if (res.status === 403) {
      return { status: 403 };
    }
    if (!res.ok) {
      throw new ApiResponseError(`API error ${res.status}: ${path}`, res.status);
    }
    return { status: res.status, data: (await res.json()) as T };
  } catch (err) {
    if (err instanceof ApiResponseError) {
      throw err;
    }
    throw new Error(API_UNAVAILABLE_MESSAGE);
  }
}

export const api = {
  getScores: (params: GetScoresParams = {}) =>
    fetchJson<CardholderScore[]>(
      `/api/scores${buildQuery({
        card_id: params.cardId,
        risk_segment: params.riskSegment,
        limit: params.limit,
        offset: params.offset,
      })}`,
    ),
  getLeads: (params: GetLeadsParams = {}) =>
    fetchJson<LeadsListResponse | AggregatedLeadsResponse>(
      `/api/leads${buildQuery({
        role: params.role,
        bank: params.bank,
        segment: params.segment,
        feedback: params.feedback,
        search: params.search,
        sort: params.sort,
        limit: params.limit,
        offset: params.offset,
      })}`,
    ),
  getCardholder: (cardId: string, role?: string) =>
    fetchJsonAllowStatus<CardholderDetail>(
      `/api/cardholder/${encodeURIComponent(cardId)}${buildQuery({ role })}`,
    ),
  /** @deprecated Use getCardholder */
  getCardholderDetail: (cardId: string, role?: string) =>
    fetchJson<CardholderDetail>(
      `/api/cardholder/${encodeURIComponent(cardId)}${buildQuery({ role })}`,
    ),
  getMetrics: () => fetchJson<ModelMetrics>("/api/metrics"),
  getModelMetrics: () => fetchJson<ModelMetrics>("/api/model/metrics"),
  getFeatures: () => fetchJson<FeatureImportance[]>("/api/features"),
  getModelFeatures: () => fetchJson<FeatureImportance[]>("/api/model/features"),
  getSegments: () => fetchJson<SegmentSummary[]>("/api/segments"),
  getKpis: (role?: string) =>
    fetchJson<KpiSummary>(`/api/kpis${buildQuery({ role })}`),
  getKpi: () => fetchJson<KpiSummary>("/api/kpi"),
  getBankOpportunities: () =>
    fetchJson<BankOpportunitySummary[]>("/api/banks/opportunities"),
  getBanks: () => fetchJson<BankOpportunitySummary[]>("/api/banks"),
  getProductRecommendations: () =>
    fetchJson<ProductOpportunitySummary[]>("/api/products/recommendations"),
  getProducts: () => fetchJson<ProductOpportunitySummary[]>("/api/products"),
  getImpactAssumptions: () =>
    fetchJson<BusinessImpactAssumptions>("/api/impact/assumptions"),
  getBusinessImpactAssumptions: () =>
    fetchJson<BusinessImpactAssumptions>("/api/impact/assumptions"),
  getAgentDemoAnswers: () =>
    fetchJson<Record<string, string>>("/api/agent/demo-answers"),
  getFeedback: () => fetchJson<FeedbackEntry[]>("/api/feedback"),
  getAuditLog: () => fetchJson<AuditLogEntry[]>("/api/audit-log"),
  postFeedback: (body: Omit<FeedbackEntry, "date">) =>
    fetchJson<{ success: boolean; feedback: FeedbackEntry }>("/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }),
  postAuditLog: (body: AuditLogEntry) =>
    fetchJson<{ success: boolean; entry: AuditLogEntry }>("/api/audit-log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }),
  getAgentStatus: () =>
    fetchJson<{
      gemini_configured: boolean;
      model: string;
      context_ready: boolean;
      env_file_exists?: boolean;
    }>("/api/agent/status"),
  askAgent: (question: string, role: string) =>
    fetchJson<AgentQuestionResponse>("/api/agent/question", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question, role }),
    }),
  calculateBusinessImpact: (body: BusinessImpactCalculateRequest) =>
    fetchJson<BusinessImpactCalculateResponse>(
      "/api/business-impact/calculate",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      },
    ),
};
