import { scoreToPercent } from "@/lib/cardholder";
import { cn } from "@/lib/utils";

interface Props {
  score: number;
  className?: string;
}

export function ScoreProgressBar({ score, className }: Props) {
  const pct = scoreToPercent(score);
  return (
    <div className={cn("flex min-w-[100px] items-center gap-2", className)}>
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-[var(--color-muted)]">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#EB001B] to-[#F79E1B] transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-9 text-right text-xs font-medium tabular-nums">{pct}%</span>
    </div>
  );
}
