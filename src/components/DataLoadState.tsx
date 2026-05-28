import type { ReactNode } from "react";
import { AlertCircle } from "lucide-react";
import {
  LoadingSkeleton,
  type SkeletonVariant,
} from "@/components/LoadingSkeletons";
import { Button } from "@/components/ui/button";
import { API_UNAVAILABLE_MESSAGE } from "@/lib/apiErrors";

interface Props {
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  children: ReactNode;
  skeleton?: SkeletonVariant;
}

export function DataLoadState({
  loading,
  error,
  onRetry,
  children,
  skeleton = "default",
}: Props) {
  if (loading) {
    return <LoadingSkeleton variant={skeleton} />;
  }

  if (error) {
    return (
      <div
        className="flex min-h-[40vh] flex-col items-center justify-center gap-4 rounded-xl border border-red-100 bg-red-50/50 p-8 text-center"
        role="alert"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
          <AlertCircle className="h-6 w-6 text-[#EB001B]" aria-hidden />
        </div>
        <p className="max-w-md text-sm text-slate-700">
          {error === API_UNAVAILABLE_MESSAGE ||
          error.includes("backend") ||
          error.includes("Failed to load")
            ? API_UNAVAILABLE_MESSAGE
            : error}
        </p>
        <Button type="button" onClick={onRetry}>
          Retry
        </Button>
      </div>
    );
  }

  return <>{children}</>;
}
