import { useTranslation } from "react-i18next";
import { opportunityBadgeClass } from "@/lib/cardholder";
import { translateSegment } from "@/lib/i18nLabels";
import { cn } from "@/lib/utils";

interface Props {
  segment: string;
  className?: string;
}

export function OpportunityBadge({ segment, className }: Props) {
  const { t } = useTranslation();

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold",
        opportunityBadgeClass(segment),
        className,
      )}
    >
      {translateSegment(t, segment)}
    </span>
  );
}
