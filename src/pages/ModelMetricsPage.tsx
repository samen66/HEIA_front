import { useTranslation } from "react-i18next";
import { DataLoadState } from "@/components/DataLoadState";
import { ModelMonitoringPanel } from "@/components/ModelMonitoringPanel";
import { PageShell } from "@/components/PageShell";
import { useRole } from "@/context/RoleContext";
import { useModelMetricsData } from "@/hooks/useModelMetricsData";
import { hasFullModelMetricsAccess } from "@/lib/roles";

export function ModelMetricsPage() {
  const { t } = useTranslation();
  const { role } = useRole();
  const { loading, error, metrics, features, reload } = useModelMetricsData();

  const viewMode =
    role && hasFullModelMetricsAccess(role) ? "full" : "summary";

  return (
    <PageShell
      title={t("model.page_title")}
      description={t("model.page_description")}
    >
      <DataLoadState
        loading={loading}
        error={error}
        onRetry={reload}
        skeleton="cards"
      >
        {metrics && (
          <ModelMonitoringPanel
            metrics={metrics}
            features={features}
            viewMode={viewMode}
          />
        )}
      </DataLoadState>
    </PageShell>
  );
}
