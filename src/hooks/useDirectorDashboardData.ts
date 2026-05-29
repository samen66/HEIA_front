import { useCallback, useEffect, useState } from "react";
import {
  api,
  type BankOpportunitySummary,
  type KpiSummary,
  type ProductOpportunitySummary,
  type SegmentSummary,
} from "@/lib/api";
import { API_UNAVAILABLE_MESSAGE } from "@/lib/apiErrors";

export function useDirectorDashboardData() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [kpi, setKpi] = useState<KpiSummary | null>(null);
  const [segments, setSegments] = useState<SegmentSummary[]>([]);
  const [banks, setBanks] = useState<BankOpportunitySummary[]>([]);
  const [products, setProducts] = useState<ProductOpportunitySummary[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [k, seg, b, p] = await Promise.all([
        api.getKpis("director"),
        api.getSegments(),
        api.getBankOpportunities(),
        api.getProductRecommendations(),
      ]);
      setKpi(k);
      setSegments(seg);
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

  return { loading, error, kpi, segments, banks, products, reload: load };
}
