import { DataLoadState } from "@/components/DataLoadState";
import { FeedbackPanel } from "@/components/FeedbackPanel";
import { PageShell } from "@/components/PageShell";
import { useDashboardData } from "@/hooks/useDashboardData";

export function FeedbackPage() {
  const { loading, error, feedback, selectedCardId, reload } = useDashboardData();

  return (
    <PageShell
      title="Feedback"
      description="Human-in-the-loop validation from sales and compliance teams"
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
