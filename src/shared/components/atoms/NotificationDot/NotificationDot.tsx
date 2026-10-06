import { cn } from '@/utils/cn';

export interface NotificationDotProps {
  /** When provided, renders a numbered dot; otherwise renders a plain dot. */
  count?: number;
  className?: string;
}

export function NotificationDot({ count, className }: NotificationDotProps) {
  if (count !== undefined && count <= 0) return null;

  const label =
    count !== undefined ? `${count} notifikasi belum dibaca` : 'Ada notifikasi belum dibaca';

  if (count === undefined) {
    return (
      <span
        role="status"
        aria-label={label}
        className={cn('w-2 h-2 rounded-full bg-destructive shrink-0', className)}
      />
    );
  }

  return (
    <span
      role="status"
      aria-label={label}
      className={cn(
        'min-w-[18px] h-[18px] px-1 rounded-full bg-destructive text-destructive-foreground text-[10px] font-medium leading-none flex items-center justify-center shrink-0',
        className
      )}
    >
      {count > 99 ? '99+' : count}
    </span>
  );
}
