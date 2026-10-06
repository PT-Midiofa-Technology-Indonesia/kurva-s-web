import { cn } from '@/lib/utils';
import { Skeleton } from '@/shared/components/ui/skeleton';

export type SkeletonVariant = 'line' | 'paragraph' | 'card' | 'table-row' | 'circle';

export interface LoadingSkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: SkeletonVariant;
  count?: number;
  width?: string | number;
  height?: string | number;
  radius?: string | number;
}

function LoadingLine({ width, height = 16, className, ...props }: LoadingSkeletonProps) {
  return <Skeleton className={cn('rounded-md', className)} style={{ width, height }} {...props} />;
}

function LoadingParagraph({ count = 3, ...props }: LoadingSkeletonProps) {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <LoadingLine key={i} width={i === count - 1 ? '80%' : '100%'} {...props} />
      ))}
    </div>
  );
}

function LoadingCard({ width = '100%', height = 200, className, ...props }: LoadingSkeletonProps) {
  return (
    <div className={cn('p-4 border rounded-lg space-y-3', className)} {...props}>
      <Skeleton className="h-6 w-1/2 rounded-md" />
      <Skeleton className="h-4 w-full rounded-md" />
      <Skeleton className="h-4 w-3/4 rounded-md" />
      <div className="flex gap-2 pt-2">
        <Skeleton className="h-8 w-20 rounded-md" />
        <Skeleton className="h-8 w-20 rounded-md" />
      </div>
    </div>
  );
}

function LoadingTableRow() {
  return (
    <tr className="border-b">
      <td className="py-3 px-4">
        <Skeleton className="h-4 w-20" />
      </td>
      <td className="py-3 px-4">
        <Skeleton className="h-4 w-40" />
      </td>
      <td className="py-3 px-4">
        <Skeleton className="h-4 w-24" />
      </td>
      <td className="py-3 px-4">
        <Skeleton className="h-4 w-16" />
      </td>
      <td className="py-3 px-4">
        <Skeleton className="h-4 w-12" />
      </td>
    </tr>
  );
}

function LoadingCircle({ width = 40, height = 40, className, ...props }: LoadingSkeletonProps) {
  return (
    <Skeleton className={cn('rounded-full', className)} style={{ width, height }} {...props} />
  );
}

export function LoadingSkeleton({
  variant = 'line',
  count = 1,
  width,
  height,
  className,
  ...props
}: LoadingSkeletonProps) {
  switch (variant) {
    case 'line':
      return <LoadingLine width={width} height={height} className={className} {...props} />;
    case 'paragraph':
      return <LoadingParagraph count={count} className={className} {...props} />;
    case 'card':
      return <LoadingCard width={width} height={height} className={className} {...props} />;
    case 'table-row':
      return <LoadingTableRow {...props} />;
    case 'circle':
      return <LoadingCircle width={width} height={height} className={className} {...props} />;
    default:
      return <LoadingLine width={width} height={height} className={className} {...props} />;
  }
}

LoadingSkeleton.displayName = 'LoadingSkeleton';
