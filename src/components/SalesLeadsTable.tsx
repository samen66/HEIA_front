import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { OpportunityBadge } from "@/components/OpportunityBadge";
import { ScoreProgressBar } from "@/components/ScoreProgressBar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { CardholderScore } from "@/lib/api";
import { cardholderPath, displayCardId } from "@/lib/cardholder";
import type { UserRole } from "@/lib/roles";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 20;

interface Props {
  scores: CardholderScore[];
  role: UserRole | null;
}

export function SalesLeadsTable({ scores, role }: Props) {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [segmentFilter, setSegmentFilter] = useState("all");
  const [bankFilter, setBankFilter] = useState("all");
  const [feedbackFilter, setFeedbackFilter] = useState("all");
  const [page, setPage] = useState(1);

  const segments = useMemo(
    () => [...new Set(scores.map((s) => s.opportunity_segment))].sort(),
    [scores],
  );
  const banks = useMemo(
    () => [...new Set(scores.map((s) => s.bank_name))].sort(),
    [scores],
  );
  const feedbackStatuses = useMemo(
    () => [...new Set(scores.map((s) => s.feedback_status))].sort(),
    [scores],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return scores
      .filter((row) => {
        if (q && !row.card_id.toLowerCase().includes(q)) return false;
        if (segmentFilter !== "all" && row.opportunity_segment !== segmentFilter)
          return false;
        if (bankFilter !== "all" && row.bank_name !== bankFilter) return false;
        if (feedbackFilter !== "all" && row.feedback_status !== feedbackFilter)
          return false;
        return true;
      })
      .sort((a, b) => b.commercial_activity_score - a.commercial_activity_score);
  }, [scores, search, segmentFilter, bankFilter, feedbackFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageRows = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  const resetPage = () => setPage(1);

  return (
    <Card>
      <CardHeader className="space-y-4">
        <CardTitle>Sales Lead List ({filtered.length})</CardTitle>
        <div className="flex flex-col gap-3">
          <div className="relative max-w-xs">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-[var(--color-muted-foreground)]" />
            <Input
              placeholder="Search by card ID…"
              className="pl-8"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                resetPage();
              }}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <FilterSelect
              label="Opportunity Segment"
              value={segmentFilter}
              onChange={(v) => {
                setSegmentFilter(v);
                resetPage();
              }}
              options={segments}
            />
            <FilterSelect
              label="Bank Name"
              value={bankFilter}
              onChange={(v) => {
                setBankFilter(v);
                resetPage();
              }}
              options={banks}
            />
            <FilterSelect
              label="Feedback Status"
              value={feedbackFilter}
              onChange={(v) => {
                setFeedbackFilter(v);
                resetPage();
              }}
              options={feedbackStatuses}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <table className="w-full min-w-[1100px] text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--color-border)] text-[var(--color-muted-foreground)]">
              <th className="pb-2 pr-3 font-medium">Card ID</th>
              <th className="pb-2 pr-3 font-medium">Bank</th>
              <th className="pb-2 pr-3 font-medium">Card Tier</th>
              <th className="pb-2 pr-3 font-medium">Score</th>
              <th className="pb-2 pr-3 font-medium">Opportunity Segment</th>
              <th className="pb-2 pr-3 font-medium">Recommended Action</th>
              <th className="pb-2 pr-3 font-medium">Confidence</th>
              <th className="pb-2 pr-3 font-medium">Feedback Status</th>
              <th className="pb-2 font-medium" />
            </tr>
          </thead>
          <tbody>
            {pageRows.map((row) => (
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
                  <ScoreProgressBar score={row.commercial_activity_score} />
                </td>
                <td className="py-2.5 pr-3">
                  <OpportunityBadge segment={row.opportunity_segment} />
                </td>
                <td className="max-w-[180px] truncate py-2.5 pr-3 text-xs">
                  {row.recommended_action}
                </td>
                <td className="py-2.5 pr-3 tabular-nums text-xs">
                  {(row.confidence_level * 100).toFixed(0)}%
                </td>
                <td className="py-2.5 pr-3 text-xs">{row.feedback_status}</td>
                <td className="py-2.5">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(cardholderPath(row.card_id))}
                  >
                    View Details
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {pageRows.length === 0 && (
          <p className="py-8 text-center text-sm text-[var(--color-muted-foreground)]">
            No leads match your filters.
          </p>
        )}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-sm">
          <p className="text-[var(--color-muted-foreground)]">
            Page {currentPage} of {totalPages} · {filtered.length} leads
          </p>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={currentPage <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Previous
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={currentPage >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
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
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
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
      <option value="all">All {label.replace("Opportunity ", "")}</option>
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  );
}
