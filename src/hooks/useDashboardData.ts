import { useCallback, useEffect, useState } from "react";
import {
  api,
  type CardholderScore,
  type FeatureImportance,
  type FeedbackEntry,
  type ModelMetrics,
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
  const [selectedCardId, setSelectedCardId] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [s, m, f, seg, fb] = await Promise.all([
        api.getScores(),
        api.getMetrics(),
        api.getFeatures(),
        api.getSegments(),
        api.getFeedback(),
      ]);
      setScores(s);
      setMetrics(m);
      setFeatures(f);
      setSegments(seg);
      setFeedback(fb);
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
    selectedCardId,
    setSelectedCardId,
    reload: load,
  };
}
