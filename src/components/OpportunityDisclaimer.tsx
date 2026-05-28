import { AlertTriangle } from "lucide-react";

export function OpportunityDisclaimer() {
  return (
    <div
      role="note"
      className="pointer-events-none fixed bottom-4 left-1/2 z-40 w-[calc(100%-2rem)] max-w-2xl -translate-x-1/2 page-enter"
    >
      <div className="pointer-events-auto flex items-start gap-2.5 rounded-lg border border-amber-300/90 bg-amber-50/95 px-4 py-3 text-xs leading-snug text-amber-950 shadow-lg backdrop-blur-sm sm:text-sm">
        <AlertTriangle
          className="mt-0.5 h-4 w-4 shrink-0 text-amber-700"
          aria-hidden
        />
        <p>
          This system provides opportunity signals only. Customer action requires
          human review by authorized personnel.
        </p>
      </div>
    </div>
  );
}
