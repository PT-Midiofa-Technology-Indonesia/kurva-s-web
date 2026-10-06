'use client';

import { COMMON_LABELS } from '@/shared/constants';
import { cn } from '@/shared/lib/utils';

interface ErrorStateProps {
  message?: string;
  className?: string;
}

export function ErrorState({ message = COMMON_LABELS.FETCH_ERROR, className }: ErrorStateProps) {
  return (
    <div className={cn('flex items-center justify-center py-20', className)}>
      <p className="text-sm text-red-500">{message}</p>
    </div>
  );
}
