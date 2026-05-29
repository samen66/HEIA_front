import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { AlertTriangle, Download } from "lucide-react";
import { DataLoadState } from "@/components/DataLoadState";
import { OpportunityBadge } from "@/components/OpportunityBadge";
import { PageShell } from "@/components/PageShell";
import { ScoreProgressBar } from "@/components/ScoreProgressBar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  api,
  type AuditLogEntry,
  type CardholderScore,
  type FeedbackEntry,
  type LeadsListResponse,
} from "@/lib/api";
import { API_UNAVAILABLE_MESSAGE } from "@/lib/apiErrors";
import {
  cardholderPath,
  displayCardId,
  feedbackStatusBadgeClass,
  isLowOrMediumConfidence,
} from "@/lib/cardholder";
import { useRole } from "@/context/RoleContext";
import { canAccessRiskCompliance } from "@/lib/roles";
import { downloadCsv } from "@/lib/utils";
import { cn } from "@/lib/utils";

const LEADS_PAGE_SIZE = 10_000;
const REVIEW_TABLE_PAGE_SIZE = 50;

async function fetchAllRiskLeads(): Promise<CardholderScore[]> {
  const all: CardholderScore[] = [];
  let offset = 0;
  let total = 0;
  do {
    const data = await api.getLeads({
      role: "risk",
      limit: LEADS_PAGE_SIZE,
      offset,
    });
    if (!isLeadsListResponse(data)) {
      break;
    }
    total = data.total;
    all.push(...data.leads);
    offset += data.leads.length;
    if (data.leads.length === 0) {
      break;
    }
  } while (offset < total);
  return all;
}

function isLeadsListResponse(
  data: LeadsListResponse | { view?: string },
): data is LeadsListResponse {
  return Array.isArray((data as LeadsListResponse).leads);
}

function tableClassName() {
  return "w-full min-w-[640px] border-collapse text-sm";
}

function thClassName() {
  return "border-b border-[var(--color-border)] bg-slate-50 px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-[var(--color-muted-foreground)]";
}

function tdClassName() {
  return "border-b border-[var(--color-border)] px-3 py-2.5 align-middle";
}

export function RiskCompliancePage() {
  const { t } = useTranslation();
  const { role } = useRole();
  const allowed = role != null && canAccessRiskCompliance(role);

  const [loading, setLoading] = useState(allowed);
  const [error, setError] = useState<string | null>(null);
  const [leads, setLeads] = useState<CardholderScore[]>([]);
  const [feedback, setFeedback] = useState<FeedbackEntry[]>([]);
  const [auditLog, setAuditLog] = useState<AuditLogEntry[]>([]);
  const [reviewPage, setReviewPage] = useState(1);

  const load = useCallback(async () => {
    if (!allowed) return;
    setLoading(true);
    setError(null);
    try {
      const [leadsRes, feedbackRes, auditRes] = await Promise.all([
        fetchAllRiskLeads(),
        api.getFeedback(),
        api.getAuditLog(),
      ]);
      setLeads(leadsRes);
      setFeedback(feedbackRes);
      setAuditLog(auditRes);
    } catch {
      setError(API_UNAVAILABLE_MESSAGE);
      setLeads([]);
      setFeedback([]);
      setAuditLog([]);
    } finally {
      setLoading(false);
    }
  }, [allowed]);

  useEffect(() => {
    load();
  }, [load]);

  const leadByCardId = useMemo(() => {
    const map = new Map<string, CardholderScore>();
    for (const lead of leads) {
      map.set(lead.card_id, lead);
    }
    return map;
  }, [leads]);

  const reviewCases = useMemo(
    () => leads.filter((l) => isLowOrMediumConfidence(l.confidence_level)),
    [leads],
  );

  const reviewTotalPages = Math.max(
    1,
    Math.ceil(reviewCases.length / REVIEW_TABLE_PAGE_SIZE),
  );
  const reviewPageSafe = Math.min(reviewPage, reviewTotalPages);
  const reviewPageRows = useMemo(() => {
    const start = (reviewPageSafe - 1) * REVIEW_TABLE_PAGE_SIZE;
    return reviewCases.slice(start, start + REVIEW_TABLE_PAGE_SIZE);
  }, [reviewCases, reviewPageSafe]);

  useEffect(() => {
    setReviewPage(1);
  }, [reviewCases.length]);

  const falsePositives = useMemo(
    () =>
      feedback.filter(
        (f) => f.feedback_status.toLowerCase() === "false positive",
      ),
    [feedback],
  );

  const sortedAuditLog = useMemo(
    () =>
      [...auditLog].sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      ),
    [auditLog],
  );

  const handleExportAuditCsv = () => {
    downloadCsv(
      `heia-audit-log-${new Date().toISOString().slice(0, 10)}.csv`,
      [
        { key: "card_id", header: "card_id" },
        { key: "user_role", header: "user_role" },
        { key: "old_status", header: "old_status" },
        { key: "new_status", header: "new_status" },
        { key: "timestamp", header: "timestamp" },
        { key: "comment", header: "comment" },
      ],
      sortedAuditLog.map((row) => ({
        card_id: row.card_id,
        user_role: row.user_role,
        old_status: row.old_status,
        new_status: row.new_status,
        timestamp: row.timestamp,
        comment: row.comment ?? "",
      })),
    );
  };

  if (!allowed || !role) {
    return null;
  }

  return (
    <PageShell
      title={t("risk.title")}
      description={t("risk.description")}
      className="pb-24"
    >
      <DataLoadState
        loading={loading}
        error={error}
        onRetry={load}
        skeleton="table"
      >
        <section className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-[var(--color-foreground)]">
              Low Confidence Cases
            </h2>
            <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">
              {reviewCases.length.toLocaleString()} cases require human review
              before any action
            </p>
          </div>
          <Card>
            <CardContent className="overflow-x-auto p-0 pt-0">
              {reviewCases.length === 0 ? (
                <p className="px-4 py-8 text-center text-sm text-[var(--color-muted-foreground)]">
                  No low or medium confidence cases in the current lead batch.
                </p>
              ) : (
                <table className={tableClassName()}>
                  <thead>
                    <tr>
                      <th className={thClassName()}>Card ID</th>
                      <th className={thClassName()}>Score</th>
                      <th className={thClassName()}>Opportunity segment</th>
                      <th className={thClassName()}>Top reason</th>
                      <th className={thClassName()}>Feedback status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reviewPageRows.map((row) => (
                      <tr
                        key={row.card_id}
                        className="hover:bg-slate-50/80"
                      >
                        <td className={tdClassName()}>
                          <Link
                            to={cardholderPath(row.card_id)}
                            className="font-medium text-[#EB001B] hover:underline"
                          >
                            {displayCardId(row.card_id, role)}
                          </Link>
                        </td>
                        <td className={tdClassName()}>
                          <ScoreProgressBar
                            score={row.commercial_activity_score}
                          />
                        </td>
                        <td className={tdClassName()}>
                          <OpportunityBadge segment={row.opportunity_segment} />
                        </td>
                        <td className={cn(tdClassName(), "max-w-xs truncate")}>
                          {row.top_reason_1}
                        </td>
                        <td className={tdClassName()}>
                          <span
                            className={cn(
                              "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold",
                              feedbackStatusBadgeClass(row.feedback_status),
                            )}
                          >
                            {row.feedback_status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </CardContent>
            {reviewCases.length > REVIEW_TABLE_PAGE_SIZE && (
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--color-border)] px-4 py-3 text-sm">
                <p className="text-[var(--color-muted-foreground)]">
                  Showing {(reviewPageSafe - 1) * REVIEW_TABLE_PAGE_SIZE + 1}–
                  {Math.min(
                    reviewPageSafe * REVIEW_TABLE_PAGE_SIZE,
                    reviewCases.length,
                  )}{" "}
                  of {reviewCases.length.toLocaleString()}
                </p>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={reviewPageSafe <= 1}
                    onClick={() => setReviewPage((p) => Math.max(1, p - 1))}
                  >
                    Previous
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={reviewPageSafe >= reviewTotalPages}
                    onClick={() =>
                      setReviewPage((p) => Math.min(reviewTotalPages, p + 1))
                    }
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </section>

        <section className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-[var(--color-foreground)]">
              False Positives
            </h2>
            <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">
              Feedback marked as false positive by sales or compliance teams
            </p>
          </div>
          <Card>
            <CardContent className="overflow-x-auto p-0">
              {falsePositives.length === 0 ? (
                <p className="px-4 py-8 text-center text-sm text-[var(--color-muted-foreground)]">
                  No false positive feedback recorded yet.
                </p>
              ) : (
                <table className={tableClassName()}>
                  <thead>
                    <tr>
                      <th className={thClassName()}>Card ID</th>
                      <th className={thClassName()}>Bank</th>
                      <th className={thClassName()}>Score</th>
                      <th className={thClassName()}>Who flagged</th>
                      <th className={thClassName()}>Date</th>
                      <th className={thClassName()}>Comment</th>
                    </tr>
                  </thead>
                  <tbody>
                    {falsePositives.map((row, idx) => {
                      const lead = leadByCardId.get(row.card_id);
                      return (
                        <tr
                          key={`${row.card_id}-${row.date}-${idx}`}
                          className="hover:bg-slate-50/80"
                        >
                          <td className={tdClassName()}>
                            <Link
                              to={cardholderPath(row.card_id)}
                              className="font-medium text-[#EB001B] hover:underline"
                            >
                              {displayCardId(row.card_id, role)}
                            </Link>
                          </td>
                          <td className={tdClassName()}>
                            {lead?.bank_name ?? "—"}
                          </td>
                          <td className={tdClassName()}>
                            {lead ? (
                              <ScoreProgressBar
                                score={lead.commercial_activity_score}
                              />
                            ) : (
                              "—"
                            )}
                          </td>
                          <td className={tdClassName()}>{row.user_role}</td>
                          <td className={tdClassName()}>{row.date}</td>
                          <td className={cn(tdClassName(), "max-w-md")}>
                            {row.comment || "—"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </CardContent>
          </Card>
        </section>

        <section>
          <Card className="border-amber-400/90 bg-amber-50 shadow-sm">
            <CardHeader className="pb-2">
              <div className="flex items-start gap-3">
                <AlertTriangle
                  className="mt-0.5 h-6 w-6 shrink-0 text-amber-800"
                  aria-hidden
                />
                <CardTitle className="text-base text-amber-950">
                  Responsible AI Note
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed text-amber-950">
                This model uses proxy validation. Consumer cards are an unlabeled
                candidate pool. True hidden-business labels are not available. The
                score should be used for prioritization and human review only. Do
                not use this score for automatic negative customer action.
              </p>
            </CardContent>
          </Card>
        </section>

        <section className="space-y-4">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-[var(--color-foreground)]">
                Audit Log
              </h2>
              <CardDescription className="mt-1">
                Status changes recorded from feedback submissions (newest first)
              </CardDescription>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleExportAuditCsv}
              disabled={sortedAuditLog.length === 0}
            >
              <Download className="mr-2 h-4 w-4" aria-hidden />
              Export to CSV
            </Button>
          </div>
          <Card>
            <CardContent className="overflow-x-auto p-0">
              {sortedAuditLog.length === 0 ? (
                <p className="px-4 py-8 text-center text-sm text-[var(--color-muted-foreground)]">
                  No audit entries yet. Entries appear when feedback status is
                  saved on a cardholder profile.
                </p>
              ) : (
                <table className={tableClassName()}>
                  <thead>
                    <tr>
                      <th className={thClassName()}>Card ID</th>
                      <th className={thClassName()}>User role</th>
                      <th className={thClassName()}>Old status</th>
                      <th className={thClassName()}>New status</th>
                      <th className={thClassName()}>Timestamp</th>
                      <th className={thClassName()}>Comment</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedAuditLog.map((row, idx) => (
                      <tr
                        key={`${row.card_id}-${row.timestamp}-${idx}`}
                        className="hover:bg-slate-50/80"
                      >
                        <td className={tdClassName()}>
                          <Link
                            to={cardholderPath(row.card_id)}
                            className="font-medium text-[#EB001B] hover:underline"
                          >
                            {displayCardId(row.card_id, role)}
                          </Link>
                        </td>
                        <td className={tdClassName()}>{row.user_role}</td>
                        <td className={tdClassName()}>{row.old_status}</td>
                        <td className={tdClassName()}>{row.new_status}</td>
                        <td className={tdClassName()}>{row.timestamp}</td>
                        <td className={cn(tdClassName(), "max-w-md")}>
                          {row.comment || "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </CardContent>
          </Card>
        </section>
      </DataLoadState>
    </PageShell>
  );
}
