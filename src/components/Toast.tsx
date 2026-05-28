import { useEffect } from "react";
import { CheckCircle2, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  message: string;
  onDismiss: () => void;
  durationMs?: number;
  className?: string;
}

export function Toast({ message, onDismiss, durationMs = 5000, className }: Props) {
  useEffect(() => {
    const t = window.setTimeout(onDismiss, durationMs);
    return () => window.clearTimeout(t);
  }, [onDismiss, durationMs]);

  return (
    <div
      role="status"
      className={cn(
        "fixed bottom-6 right-6 z-50 flex max-w-md items-start gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 shadow-lg",
        className,
      )}
    >
      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
      <p className="flex-1 text-sm text-emerald-900">{message}</p>
      <button
        type="button"
        onClick={onDismiss}
        className="text-emerald-700 hover:text-emerald-900"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
