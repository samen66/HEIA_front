import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Search } from "lucide-react";
import { OpportunityBadge } from "@/components/OpportunityBadge";
import { ScoreProgressBar } from "@/components/ScoreProgressBar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { CardholderScore } from "@/lib/api";
import {
  FEEDBACK_STATUS_OPTIONS,
  OPPORTUNITY_SEGMENT_OPTIONS,
  cardholderPath,
  confidenceBadgeClass,
  confidenceLabel,
  displayCardId,
  feedbackStatusBadgeClass,
  type LeadSortKey,
} from "@/lib/cardholder";
import {
  translateConfidence,
  translateFeedbackStatus,
  translateSegment,
} from "@/lib/i18nLabels";
import type { UserRole } from "@/lib/roles";
import { formatKzt } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface Props {
  leads: CardholderScore[];
  total: number;
  role: UserRole | null;
  banks: string[];
  segmentFilter: string;
  bankFilter: string;
  feedbackFilter: string;
  search: string;
  sort: LeadSortKey;
  page: number;
  pageSize: number;
  onSegmentFilterChange: (value: string) => void;
  onBankFilterChange: (value: string) => void;
  onFeedbackFilterChange: (value: string) => void;
  onSearchChange: (value: string) => void;
  onSortChange: (value: LeadSortKey) => void;
  onPageChange: (page: number) => void;
}

const SORT_OPTIONS: { value: LeadSortKey; labelKey: string }[] = [
  { value: "score_desc", labelKey: "leads.sort_score_desc" },
  { value: "expected_value_desc", labelKey: "leads.sort_value_desc" },
  { value: "expected_value_asc", labelKey: "leads.sort_value_asc" },
  { value: "bank", labelKey: "leads.sort_bank" },
];

export function SalesLeadsTable({
  leads,
  total,
  role,
  banks,
  segmentFilter,
  bankFilter,
  feedbackFilter,
  search,
  sort,
  page,
  pageSize,
  onSegmentFilterChange,
  onBankFilterChange,
  onFeedbackFilterChange,
  onSearchChange,
  onSortChange,
  onPageChange,
}: Props) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const sortOptionLabels = Object.fromEntries(
    SORT_OPTIONS.map((o) => [o.value, t(o.labelKey)]),
  );

  const feedbackStatuses = useMemo(
    () => [...new Set([...FEEDBACK_STATUS_OPTIONS, ...leads.map((l) => l.feedback_status)])].sort(),
    [leads],
  );

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(page, totalPages);
  const rangeStart = total === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const rangeEnd = Math.min(currentPage * pageSize, total);

  return (
    <Card>
      <CardHeader className="space-y-4">
        <CardTitle>{t("leads.title")}</CardTitle>
        <div className="flex flex-col gap-3">
          <div className="relative max-w-xs">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-[var(--color-muted-foreground)]" />
            <Input
              placeholder={t("leads.search_placeholder")}
              className="pl-8"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <FilterSelect
              label={t("leads.filter_segment")}
              value={segmentFilter}
              onChange={onSegmentFilterChange}
              options={OPPORTUNITY_SEGMENT_OPTIONS}
              optionLabels={Object.fromEntries(
                OPPORTUNITY_SEGMENT_OPTIONS.map((s) => [
                  s,
                  translateSegment(t, s),
                ]),
              )}
              allLabel={t("leads.all_segments")}
            />
            <FilterSelect
              label={t("leads.filter_bank")}
              value={bankFilter}
              onChange={onBankFilterChange}
              options={banks}
              allLabel={t("leads.all_banks")}
            />
            <FilterSelect
              label={t("leads.filter_feedback")}
              value={feedbackFilter}
              onChange={onFeedbackFilterChange}
              options={feedbackStatuses}
              optionLabels={Object.fromEntries(
                feedbackStatuses.map((s) => [s, translateFeedbackStatus(t, s)]),
              )}
              allLabel={t("leads.all_statuses")}
            />
            <FilterSelect
              label={t("leads.sort_by")}
              value={sort}
              onChange={(v) => onSortChange(v as LeadSortKey)}
              options={SORT_OPTIONS.map((o) => o.value)}
              optionLabels={sortOptionLabels}
              allLabel=""
              hideAll
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        {total > 0 && (
          <p className="mb-3 text-sm text-[var(--color-muted-foreground)]">
            {t("leads.showing", {
              start: rangeStart,
              end: rangeEnd,
              total,
            })}
          </p>
        )}
        <table className="w-full min-w-[1200px] text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--color-border)] text-[var(--color-muted-foreground)]">
              <th className="pb-2 pr-3 font-medium">{t("leads.card_id")}</th>
              <th className="pb-2 pr-3 font-medium">{t("leads.bank")}</th>
              <th className="pb-2 pr-3 font-medium">{t("leads.tier")}</th>
              <th className="pb-2 pr-3 font-medium">{t("leads.opportunity_segment")}</th>
              <th className="pb-2 pr-3 font-medium">{t("leads.activity_score")}</th>
              <th className="pb-2 pr-3 font-medium">{t("leads.confidence")}</th>
              <th className="pb-2 pr-3 font-medium">{t("leads.action")}</th>
              <th className="pb-2 pr-3 font-medium">{t("leads.value")}</th>
              <th className="pb-2 pr-3 font-medium">{t("leads.feedback_status")}</th>
              <th className="pb-2 font-medium" />
            </tr>
          </thead>
          <tbody>
            {leads.map((row) => (
              <tr
                key={row.card_id}
                className="border-b border-[var(--color-border)]/60 hover:bg-[var(--color-muted)]/30"
              >
                <td className="py-2.5 pr-3 font-mono text-xs">
                  {displayCardId(row.card_id, role)}
                </td>
                <td className="py-2.5 pr-3">{row.bank_name}</td>
                <td className="py-2.5 pr-3">{row.card_tier}</td>
                <td className="py-2.5 pr-3">
                  <OpportunityBadge segment={row.opportunity_segment} />
                </td>
                <td className="py-2.5 pr-3">
                  <ScoreProgressBar score={row.commercial_activity_score} />
                </td>
                <td className="py-2.5 pr-3">
                  <span
                    className={cn(
                      "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold",
                      confidenceBadgeClass(row.confidence_level),
                    )}
                  >
                    {translateConfidence(t, confidenceLabel(row.confidence_level))}
                  </span>
                </td>
                <td className="max-w-[200px] truncate py-2.5 pr-3 text-xs">
                  {row.recommended_action}
                </td>
                <td className="py-2.5 pr-3 tabular-nums text-xs">
                  {formatKzt(row.expected_value_kzt)}
                </td>
                <td className="py-2.5 pr-3">
                  <span
                    className={cn(
                      "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold",
                      feedbackStatusBadgeClass(row.feedback_status),
                    )}
                  >
                    {translateFeedbackStatus(t, row.feedback_status)}
                  </span>
                </td>
                <td className="py-2.5">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(cardholderPath(row.card_id))}
                  >
                    {t("leads.view_details")}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {leads.length === 0 && (
          <p className="py-8 text-center text-sm text-[var(--color-muted-foreground)]">
            No leads match your filters.
          </p>
        )}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-sm">
          <p className="text-[var(--color-muted-foreground)]">
            Page {currentPage} of {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={currentPage <= 1}
              onClick={() => onPageChange(currentPage - 1)}
            >
              {t("judge.previous")}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={currentPage >= totalPages}
              onClick={() => onPageChange(currentPage + 1)}
            >
              {t("judge.next")}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
  optionLabels,
  allLabel,
  hideAll = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: readonly string[];
  optionLabels?: Record<string, string>;
  allLabel: string;
  hideAll?: boolean;
}) {
  return (
    <select
      aria-label={label}
      className={cn(
        "h-9 rounded-md border border-[var(--color-border)] bg-transparent px-3 text-sm",
      )}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      {!hideAll && <option value="">{allLabel}</option>}
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {optionLabels?.[opt] ?? opt}
        </option>
      ))}
    </select>
  );
}
