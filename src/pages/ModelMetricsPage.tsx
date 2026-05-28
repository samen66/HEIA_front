import { DataLoadState } from "@/components/DataLoadState";
import { MetricsOverview } from "@/components/MetricsOverview";
import { PageShell } from "@/components/PageShell";
import { useRole } from "@/context/RoleContext";
import { useDashboardData } from "@/hooks/useDashboardData";
import { hasFullModelMetricsAccess } from "@/lib/roles";

export function ModelMetricsPage() {
  const { role } = useRole();
  const { loading, error, metrics, reload } = useDashboardData();

  const viewMode =
    role && hasFullModelMetricsAccess(role) ? "full" : "summary";

  return (
    <PageShell
      title="Model Metrics"
      description="LightGBM performance and governance indicators for HEIA scoring"
    >
      <DataLoadState
        loading={loading}
        error={error}
        onRetry={reload}
        skeleton="cards"
      >
        {metrics && (
          <MetricsOverview metrics={metrics} viewMode={viewMode} />
        )}
      </DataLoadState>
    </PageShell>
  );
}
