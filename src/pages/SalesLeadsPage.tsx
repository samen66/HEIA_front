import { useCallback, useEffect, useState } from "react";
import { DataLoadState } from "@/components/DataLoadState";
import { OpportunityDisclaimer } from "@/components/OpportunityDisclaimer";
import { PageShell } from "@/components/PageShell";
import { API_UNAVAILABLE_MESSAGE } from "@/lib/apiErrors";
import { SalesLeadsTable } from "@/components/SalesLeadsTable";
import { useRole } from "@/context/RoleContext";
import { api, type CardholderScore } from "@/lib/api";

export function SalesLeadsPage() {
  const { role } = useRole();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scores, setScores] = useState<CardholderScore[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getScores();
      setScores(data);
    } catch {
      setError(API_UNAVAILABLE_MESSAGE);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <PageShell
      title="Sales Leads"
      description="Prioritized commercial cardholders ranked by hidden entrepreneur potential (score descending)"
      className="pb-24"
    >
      <DataLoadState
        loading={loading}
        error={error}
        onRetry={load}
        skeleton="table"
      >
        <SalesLeadsTable scores={scores} role={role} />
      </DataLoadState>
      <OpportunityDisclaimer />
    </PageShell>
  );
}
