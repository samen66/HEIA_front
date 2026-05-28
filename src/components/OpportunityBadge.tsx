import { opportunityBadgeClass } from "@/lib/cardholder";
import { cn } from "@/lib/utils";

interface Props {
  segment: string;
  className?: string;
}

export function OpportunityBadge({ segment, className }: Props) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold",
        opportunityBadgeClass(segment),
        className,
      )}
    >
      {segment}
    </span>
  );
}
