import { useTranslation } from "react-i18next";
import { DataLoadState } from "@/components/DataLoadState";
import { FeedbackPanel } from "@/components/FeedbackPanel";
import { PageShell } from "@/components/PageShell";
import { useDashboardData } from "@/hooks/useDashboardData";

export function FeedbackPage() {
  const { t } = useTranslation();
  const { loading, error, feedback, selectedCardId, reload } = useDashboardData();

  return (
    <PageShell
      title={t("feedback_page.title")}
      description={t("feedback_page.description")}
    >
      <DataLoadState
        loading={loading}
        error={error}
        onRetry={reload}
        skeleton="table"
      >
        <FeedbackPanel
          feedback={feedback}
          selectedCardId={selectedCardId}
          onSubmitted={reload}
        />
      </DataLoadState>
    </PageShell>
  );
}
