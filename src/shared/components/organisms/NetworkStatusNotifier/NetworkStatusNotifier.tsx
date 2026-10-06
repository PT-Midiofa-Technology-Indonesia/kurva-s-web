'use client';

import { useEffect } from 'react';

import { useNetworkStatus } from '@/hooks/use-network-status';
import { toast } from '@/lib/toast';

export function NetworkStatusNotifier() {
  const { isOnline, hasBeenOffline } = useNetworkStatus();

  useEffect(() => {
    if (!isOnline) {
      toast.error({ title: 'You are offline. Some features may not work.' });
    } else if (hasBeenOffline) {
      toast.success({ title: 'You are back online.' });
    }
  }, [isOnline, hasBeenOffline]);

  return null;
}
