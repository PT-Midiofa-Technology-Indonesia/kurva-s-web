'use client';

import { ReactNode, useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

export interface TabPanelProps {
  tabKey: string;
  activeKey: string;
  isLoading?: boolean;
  children: ReactNode;
  className?: string;
  loadingFallback?: ReactNode;
  /** If true, unmounts and remounts content on every tab change to force re-fetch */
  remountOnChange?: boolean;
}

/**
 * Mounts once when first activated, then stays mounted (hidden) on subsequent tab switches.
 * This prevents re-fetching and preserves scroll/form state when returning to a tab.
 * Set `remountOnChange={true}` to force unmount/remount on every tab switch.
 */
export function TabPanel({
  tabKey,
  activeKey,
  isLoading,
  children,
  className,
  loadingFallback,
  remountOnChange = false,
}: TabPanelProps) {
  const hasBeenActive = useRef(false);
  const isActive = tabKey === activeKey;
  const [mounted, setMounted] = useState(isActive);

  if (isActive) {
    hasBeenActive.current = true;
  }

  useEffect(() => {
    if (remountOnChange) {
      if (isActive) {
        setMounted(true);
      } else {
        setMounted(false);
      }
    }
  }, [isActive, remountOnChange]);

  const shouldRender = remountOnChange ? mounted : hasBeenActive.current;

  if (!shouldRender) {
    return null;
  }

  return (
    <div role="tabpanel" hidden={!isActive} className={cn('w-full', className)}>
      {isLoading ? (loadingFallback ?? <TabPanelSkeleton />) : children}
    </div>
  );
}

function TabPanelSkeleton() {
  return (
    <div className="flex flex-col gap-3 p-6 animate-pulse">
      <div className="h-4 w-1/3 rounded bg-slate-200" />
      <div className="h-4 w-2/3 rounded bg-slate-200" />
      <div className="h-4 w-1/2 rounded bg-slate-200" />
    </div>
  );
}
