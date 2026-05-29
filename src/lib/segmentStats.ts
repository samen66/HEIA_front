import type { CardholderScore, SegmentSummary } from "@/lib/api";
import { formatMillionsKzt } from "@/lib/utils";

export function getHighOpportunityCount(segments: SegmentSummary[]): number {
  return segments
    .filter((s) => s.risk_segment === "High")
    .reduce((sum, s) => sum + s.number_of_cardholders, 0);
}

export function getTotalOpportunityKzt(segments: SegmentSummary[]): number {
  return segments.reduce((sum, s) => sum + s.estimated_opportunity_value, 0);
}

export function getUniqueBankCount(scores: CardholderScore[]): number {
  return new Set(scores.map((s) => s.bank_name)).size;
}

export function getPortfolioImpactSummary(
  segments: SegmentSummary[],
  scores: CardholderScore[],
  bankCount?: number,
): {
  hiddenEntrepreneurs: number;
  bankCount: number;
  opportunityLabel: string;
} {
  return {
    hiddenEntrepreneurs: getHighOpportunityCount(segments),
    bankCount: bankCount ?? getUniqueBankCount(scores),
    opportunityLabel: formatMillionsKzt(getTotalOpportunityKzt(segments)),
  };
}

export function getTopScoredCardholder(
  scores: CardholderScore[],
): CardholderScore | null {
  if (scores.length === 0) return null;
  return scores.reduce((best, row) =>
    row.commercial_activity_score > best.commercial_activity_score ? row : best,
  );
}

export function productForSegment(
  segments: SegmentSummary[],
  riskSegment: string,
): string {
  return (
    segments.find((s) => s.risk_segment === riskSegment)?.recommended_product ??
    "SME growth bundle"
  );
}
