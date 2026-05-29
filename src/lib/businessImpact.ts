export interface BusinessImpactInput {
  high_opportunity_customers: number;
  conversion_rate_pct: number;
  avg_annual_revenue_kzt: number;
  campaign_cost_kzt: number;
}

export interface BusinessImpactResult extends BusinessImpactInput {
  converted_customers: number;
  estimated_gross_revenue_kzt: number;
  net_business_impact_kzt: number;
  roi_pct: number;
}

export const BUSINESS_IMPACT_DEFAULTS = {
  conversion_rate_pct: 10,
  avg_annual_revenue_kzt: 50_000,
  campaign_cost_kzt: 5_000_000,
} as const;

export interface ImpactScenario {
  id: string;
  label: string;
  conversion_rate_pct: number;
}

export const FALLBACK_SCENARIOS: ImpactScenario[] = [
  { id: "conservative", label: "Conservative", conversion_rate_pct: 5 },
  { id: "base", label: "Base Case", conversion_rate_pct: 10 },
  { id: "optimistic", label: "Optimistic", conversion_rate_pct: 20 },
];

export function scenariosFromAssumptions(
  assumptions: {
    conversion_rate_conservative?: number;
    conversion_rate_base?: number;
    conversion_rate_optimistic?: number;
  } | null,
): ImpactScenario[] {
  if (!assumptions) return FALLBACK_SCENARIOS;
  return [
    {
      id: "conservative",
      label: "Conservative",
      conversion_rate_pct:
        assumptions.conversion_rate_conservative ??
        FALLBACK_SCENARIOS[0].conversion_rate_pct,
    },
    {
      id: "base",
      label: "Base Case",
      conversion_rate_pct:
        assumptions.conversion_rate_base ?? FALLBACK_SCENARIOS[1].conversion_rate_pct,
    },
    {
      id: "optimistic",
      label: "Optimistic",
      conversion_rate_pct:
        assumptions.conversion_rate_optimistic ??
        FALLBACK_SCENARIOS[2].conversion_rate_pct,
    },
  ];
}

export function calculateBusinessImpact(
  input: BusinessImpactInput,
): BusinessImpactResult {
  const rate = input.conversion_rate_pct / 100;
  const converted_customers =
    input.high_opportunity_customers * rate;
  const estimated_gross_revenue_kzt =
    converted_customers * input.avg_annual_revenue_kzt;
  const net_business_impact_kzt =
    estimated_gross_revenue_kzt - input.campaign_cost_kzt;
  const roi_pct =
    input.campaign_cost_kzt > 0
      ? (net_business_impact_kzt / input.campaign_cost_kzt) * 100
      : 0;

  return {
    ...input,
    converted_customers,
    estimated_gross_revenue_kzt,
    net_business_impact_kzt,
    roi_pct,
  };
}

export function formatKztPlain(value: number): string {
  return `${Math.round(value).toLocaleString("en-US")} KZT`;
}

const TOP_PRIORITY_SEGMENTS = [
  "Top 1% highest priority",
  "Top 5% priority",
] as const;

export function highPriorityCustomersFromSegments(
  segments: { opportunity_segment?: string; number_of_cardholders: number }[],
): number {
  const total = segments
    .filter((s) =>
      TOP_PRIORITY_SEGMENTS.includes(
        s.opportunity_segment as (typeof TOP_PRIORITY_SEGMENTS)[number],
      ),
    )
    .reduce((sum, s) => sum + s.number_of_cardholders, 0);
  return total > 0 ? total : 4000;
}

/** @deprecated Use highPriorityCustomersFromSegments */
export function defaultHighOpportunityCustomers(
  segments: { risk_segment: string; number_of_cardholders: number }[],
): number {
  const high = segments.find((s) => s.risk_segment === "High");
  return high?.number_of_cardholders ?? 8000;
}
