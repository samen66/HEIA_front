import { useCallback, useEffect, useState } from "react";
import { api, type CardholderScore, type SegmentSummary } from "@/lib/api";
import { API_UNAVAILABLE_MESSAGE } from "@/lib/apiErrors";

export function useDirectorDashboardData() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scores, setScores] = useState<CardholderScore[]>([]);
  const [segments, setSegments] = useState<SegmentSummary[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [s, seg] = await Promise.all([api.getScores(), api.getSegments()]);
      setScores(s);
      setSegments(seg);
    } catch {
      setError(API_UNAVAILABLE_MESSAGE);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { loading, error, scores, segments, reload: load };
}
