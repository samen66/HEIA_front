import { Skeleton } from "@/components/ui/skeleton";

export type SkeletonVariant =
  | "default"
  | "dashboard"
  | "table"
  | "cards"
  | "detail"
  | "chart";

interface Props {
  variant?: SkeletonVariant;
}

export function LoadingSkeleton({ variant = "default" }: Props) {
  switch (variant) {
    case "dashboard":
      return <DashboardSkeleton />;
    case "table":
      return <TableSkeleton />;
    case "cards":
      return <CardsSkeleton />;
    case "detail":
      return <DetailSkeleton />;
    case "chart":
      return <ChartSkeleton />;
    default:
      return <DefaultSkeleton />;
  }
}

function DefaultSkeleton() {
  return (
    <div className="space-y-4 py-4">
      <Skeleton className="h-8 w-full max-w-md" />
      <Skeleton className="h-4 w-full max-w-lg" />
      <Skeleton className="h-4 w-full max-w-sm" />
      <Skeleton className="mt-6 h-48 w-full rounded-lg" />
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Skeleton className="h-[340px] rounded-xl" />
        <Skeleton className="h-[340px] rounded-xl" />
      </div>
      <Skeleton className="h-56 w-full rounded-xl" />
    </div>
  );
}

function TableSkeleton() {
  return (
    <div className="space-y-3">
      <div className="flex gap-3">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-10 w-32" />
        <Skeleton className="ml-auto h-10 w-40" />
      </div>
      <Skeleton className="h-10 w-full rounded-lg" />
      {Array.from({ length: 8 }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-full rounded-md" />
      ))}
    </div>
  );
}

function CardsSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-36 rounded-xl" />
      ))}
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-40 w-full rounded-xl" />
      <div className="grid gap-3 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-32 w-full rounded-xl" />
      <div className="grid gap-4 sm:grid-cols-2">
        <Skeleton className="h-24 rounded-xl" />
        <Skeleton className="h-24 rounded-xl" />
      </div>
    </div>
  );
}

function ChartSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-[320px] w-full rounded-xl" />
    </div>
  );
}
