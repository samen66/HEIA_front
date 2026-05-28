import { Database } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  className?: string;
}

export function DemoDataBadge({ className }: Props) {
  return (
    <span
      className={cn(
        "inline-flex max-w-[min(100%,14rem)] items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-medium leading-tight text-slate-600 sm:max-w-none sm:text-xs",
        className,
      )}
      title="All records are synthetic demo data"
    >
      <Database className="h-3 w-3 shrink-0 text-slate-500" aria-hidden />
      <span className="truncate sm:whitespace-normal">
        Demo Data · Synthetic · Not real customers
      </span>
    </span>
  );
}
