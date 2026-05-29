import { useCallback, useEffect, useState } from "react";
import {
  api,
  type BankOpportunitySummary,
  type CardholderScore,
  type FeatureImportance,
  type FeedbackEntry,
  type KpiSummary,
  type ModelMetrics,
  type ProductOpportunitySummary,
  type SegmentSummary,
} from "@/lib/api";
import { API_UNAVAILABLE_MESSAGE } from "@/lib/apiErrors";

export function useDashboardData() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scores, setScores] = useState<CardholderScore[]>([]);
  const [metrics, setMetrics] = useState<ModelMetrics | null>(null);
  const [features, setFeatures] = useState<FeatureImportance[]>([]);
  const [segments, setSegments] = useState<SegmentSummary[]>([]);
  const [feedback, setFeedback] = useState<FeedbackEntry[]>([]);
  const [kpi, setKpi] = useState<KpiSummary | null>(null);
  const [banks, setBanks] = useState<BankOpportunitySummary[]>([]);
  const [products, setProducts] = useState<ProductOpportunitySummary[]>([]);
  const [selectedCardId, setSelectedCardId] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [s, m, f, seg, fb, k, b, p] = await Promise.all([
        api.getScores({ limit: 500 }),
        api.getMetrics(),
        api.getFeatures(),
        api.getSegments(),
        api.getFeedback(),
        api.getKpi(),
        api.getBanks(),
        api.getProducts().catch(() => [] as ProductOpportunitySummary[]),
      ]);
      setScores(s);
      setMetrics(m);
      setFeatures(f);
      setSegments(seg);
      setFeedback(fb);
      setKpi(k);
      setBanks(b);
      setProducts(p);
    } catch {
      setError(API_UNAVAILABLE_MESSAGE);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return {
    loading,
    error,
    scores,
    metrics,
    features,
    segments,
    feedback,
    kpi,
    banks,
    products,
    selectedCardId,
    setSelectedCardId,
    reload: load,
  };
}
