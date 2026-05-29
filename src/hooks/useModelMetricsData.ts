import { useCallback, useEffect, useState } from "react";
import {
  api,
  type FeatureImportance,
  type ModelMetrics,
} from "@/lib/api";
import { API_UNAVAILABLE_MESSAGE } from "@/lib/apiErrors";

export function useModelMetricsData() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<ModelMetrics | null>(null);
  const [features, setFeatures] = useState<FeatureImportance[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [m, f] = await Promise.all([
        api.getModelMetrics(),
        api.getModelFeatures(),
      ]);
      setMetrics(m);
      setFeatures(f);
    } catch {
      setError(API_UNAVAILABLE_MESSAGE);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { loading, error, metrics, features, reload: load };
}
