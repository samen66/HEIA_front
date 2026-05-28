import { DataLoadState } from "@/components/DataLoadState";
import { FeatureChart } from "@/components/FeatureChart";
import { PageShell } from "@/components/PageShell";
import { useRole } from "@/context/RoleContext";
import { useDashboardData } from "@/hooks/useDashboardData";
import { hasFullFeatureImportanceAccess } from "@/lib/roles";

export function FeatureImportancePage() {
  const { role } = useRole();
  const { loading, error, features, reload } = useDashboardData();

  const viewMode =
    role && hasFullFeatureImportanceAccess(role) ? "full" : "summary";

  return (
    <PageShell
      title="Feature Importance"
      description="Top model drivers with business-readable interpretations"
    >
      <DataLoadState
        loading={loading}
        error={error}
        onRetry={reload}
        skeleton="chart"
      >
        <FeatureChart features={features} viewMode={viewMode} />
      </DataLoadState>
    </PageShell>
  );
}
