import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { CardholderScore } from "@/lib/api";
import { formatKzt } from "@/lib/utils";

interface Props {
  scores: CardholderScore[];
  onSelectCard?: (cardId: string) => void;
}

function riskVariant(segment: string): "high" | "medium" | "low" | "outline" {
  const s = segment.toLowerCase();
  if (s === "high") return "high";
  if (s === "medium") return "medium";
  if (s === "low") return "low";
  return "outline";
}

export function ScoresTable({ scores, onSelectCard }: Props) {
  const [query, setQuery] = useState("");
  const [riskFilter, setRiskFilter] = useState<string>("all");

  const filtered = useMemo(() => {
    return scores.filter((row) => {
      const q = query.toLowerCase();
      const matchesQuery =
        !q ||
        row.card_id.toLowerCase().includes(q) ||
        row.bank_name.toLowerCase().includes(q) ||
        row.opportunity_segment.toLowerCase().includes(q);
      const matchesRisk =
        riskFilter === "all" || row.risk_segment === riskFilter;
      return matchesQuery && matchesRisk;
    });
  }, [scores, query, riskFilter]);

  return (
    <Card>
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <CardTitle>Cardholder Scores ({filtered.length})</CardTitle>
        <div className="flex flex-wrap gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-[var(--color-muted-foreground)]" />
            <Input
              placeholder="Search card, bank…"
              className="w-56 pl-8"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <select
            className="h-9 rounded-md border border-[var(--color-border)] bg-transparent px-3 text-sm"
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
          >
            <option value="all">All segments</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--color-border)] text-[var(--color-muted-foreground)]">
              <th className="pb-2 pr-4 font-medium">Card ID</th>
              <th className="pb-2 pr-4 font-medium">Bank</th>
              <th className="pb-2 pr-4 font-medium">Score</th>
              <th className="pb-2 pr-4 font-medium">Risk</th>
              <th className="pb-2 pr-4 font-medium">Opportunity</th>
              <th className="pb-2 pr-4 font-medium">Action</th>
              <th className="pb-2 font-medium">Expected Value</th>
            </tr>
          </thead>
          <tbody>
            {filtered.slice(0, 50).map((row) => (
              <tr
                key={row.card_id}
                className="border-b border-[var(--color-border)]/60 hover:bg-[var(--color-muted)]/30 cursor-pointer"
                onClick={() => onSelectCard?.(row.card_id)}
              >
                <td className="py-2.5 pr-4 font-mono text-xs">{row.card_id}</td>
                <td className="py-2.5 pr-4">{row.bank_name}</td>
                <td className="py-2.5 pr-4 tabular-nums">
                  {row.commercial_activity_score.toFixed(2)}
                </td>
                <td className="py-2.5 pr-4">
                  <Badge variant={riskVariant(row.risk_segment)}>
                    {row.risk_segment}
                  </Badge>
                </td>
                <td className="py-2.5 pr-4 max-w-[140px] truncate">
                  {row.opportunity_segment}
                </td>
                <td className="py-2.5 pr-4 max-w-[180px] truncate text-xs">
                  {row.recommended_action}
                </td>
                <td className="py-2.5 tabular-nums text-xs">
                  {formatKzt(row.expected_value_kzt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length > 50 && (
          <p className="mt-3 text-xs text-[var(--color-muted-foreground)]">
            Showing first 50 of {filtered.length} results
          </p>
        )}
      </CardContent>
    </Card>
  );
}
