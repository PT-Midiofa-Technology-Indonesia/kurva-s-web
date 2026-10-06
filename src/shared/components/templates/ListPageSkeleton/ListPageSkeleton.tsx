import { Skeleton } from '@/shared/components/ui/skeleton';

function SkeletonTableRow() {
  return (
    <div className="flex items-center gap-4 px-4 py-3 border-b border-slate-100 last:border-0">
      <Skeleton className="h-4 w-20 shrink-0" />
      <Skeleton className="h-4 flex-1" />
      <Skeleton className="h-4 w-28 shrink-0" />
      <Skeleton className="h-4 w-16 shrink-0" />
      <Skeleton className="h-4 w-12 shrink-0" />
    </div>
  );
}

export interface ListPageSkeletonProps {
  rows?: number;
}

export function ListPageSkeleton({ rows = 7 }: ListPageSkeletonProps) {
  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-9 w-40" />
      </div>

      {/* Table card */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        {/* Filter bar */}
        <div className="flex items-center justify-between gap-3 p-4 border-b border-slate-100">
          <Skeleton className="h-9 w-72" />
          <Skeleton className="h-9 w-32" />
        </div>

        {/* Column headers */}
        <div className="flex items-center gap-4 px-4 py-3 border-b border-slate-200 bg-slate-50">
          <Skeleton className="h-3 w-16 shrink-0" />
          <Skeleton className="h-3 flex-1" />
          <Skeleton className="h-3 w-24 shrink-0" />
          <Skeleton className="h-3 w-12 shrink-0" />
          <Skeleton className="h-3 w-10 shrink-0" />
        </div>

        {/* Rows */}
        {Array.from({ length: rows }).map((_, i) => (
          <SkeletonTableRow key={i} />
        ))}

        {/* Pagination bar */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
          <Skeleton className="h-4 w-32" />
          <div className="flex gap-2">
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-8" />
          </div>
        </div>
      </div>
    </div>
  );
}
