const API_BASE = import.meta.env.VITE_API_URL ?? "";

export interface CardholderScore {
  card_id: string;
  bank_name: string;
  card_tier: string;
  commercial_activity_score: number;
  risk_segment: string;
  opportunity_segment: string;
  recommended_action: string;
  confidence_level: number;
  top_reason_1: string;
  top_reason_2: string;
  top_reason_3: string;
  expected_value_kzt: number;
  feedback_status: string;
}

export interface ModelMetrics {
  model_name: string;
  model_version: string;
  trained_at?: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1: number;
  roc_auc: number;
  training_samples?: number;
  validation_samples?: number;
  positive_class_rate?: number;
  notes?: string;
}

export interface FeatureImportance {
  feature_name: string;
  importance_value: number;
  business_meaning: string;
}

export interface SegmentSummary {
  risk_segment: string;
  number_of_cardholders: number;
  average_score: number;
  recommended_product: string;
  estimated_conversion_rate: number;
  estimated_opportunity_value: number;
}

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

import { API_UNAVAILABLE_MESSAGE } from "@/lib/apiErrors";

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

export const api = {
  getScores: (cardId?: string) => {
    const query = cardId
      ? `?card_id=${encodeURIComponent(cardId)}`
      : "";
    return fetchJson<CardholderScore[]>(`/api/scores${query}`);
  },
  getMetrics: () => fetchJson<ModelMetrics>("/api/metrics"),
  getFeatures: () => fetchJson<FeatureImportance[]>("/api/features"),
  getSegments: () => fetchJson<SegmentSummary[]>("/api/segments"),
  getFeedback: () => fetchJson<FeedbackEntry[]>("/api/feedback"),
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
