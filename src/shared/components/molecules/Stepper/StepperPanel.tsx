'use client';

import { useRef } from 'react';
import { cn } from '@/lib/utils';

export interface StepperPanelProps {
  stepKey: string;
  activeKey: string;
  isLoading?: boolean;
  children: React.ReactNode;
  className?: string;
  loadingFallback?: React.ReactNode;
}

/**
 * Mounts once when first activated, then stays mounted (hidden) on subsequent step switches.
 * Preserves scroll/form state when returning to a step.
 */
export function StepperPanel({
  stepKey,
  activeKey,
  isLoading,
  children,
  className,
  loadingFallback,
}: StepperPanelProps) {
  const hasBeenActive = useRef(false);
  const isActive = stepKey === activeKey;

  if (isActive) {
    hasBeenActive.current = true;
  }

  if (!hasBeenActive.current) {
    return null;
  }

  return (
    <div role="tabpanel" hidden={!isActive} className={cn('w-full', className)}>
      {isLoading
        ? (loadingFallback ?? (
            <div className="flex flex-col gap-3 p-6 animate-pulse">
              <div className="h-4 w-1/3 rounded bg-slate-200" />
              <div className="h-4 w-2/3 rounded bg-slate-200" />
              <div className="h-4 w-1/2 rounded bg-slate-200" />
            </div>
          ))
        : children}
    </div>
  );
}
