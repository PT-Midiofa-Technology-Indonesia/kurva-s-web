import { Skeleton } from '@/shared/components/ui/skeleton';

function SkeletonField() {
  return (
    <div className="flex flex-col gap-1.5">
      <Skeleton className="h-3.5 w-24" />
      <Skeleton className="h-9 w-full" />
    </div>
  );
}

export interface FormPageSkeletonProps {
  fields?: number;
}

export function FormPageSkeleton({ fields = 4 }: FormPageSkeletonProps) {
  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Page header */}
      <div className="flex items-center gap-4">
        <Skeleton className="h-6 flex-1" />
        <Skeleton className="h-9 w-24" />
      </div>

      {/* Form card */}
      <div className="bg-white border border-slate-200 rounded-[14px] shadow-sm">
        <div className="px-6 py-6 flex flex-col gap-6">
          <div className="grid grid-cols-2 gap-4">
            {Array.from({ length: fields }).map((_, i) => (
              <SkeletonField key={i} />
            ))}
          </div>

          {/* Actions row */}
          <div className="flex justify-end gap-2 pt-2">
            <Skeleton className="h-9 w-16" />
            <Skeleton className="h-9 w-20" />
          </div>
        </div>
      </div>
    </div>
  );
}
