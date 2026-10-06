'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { markNotificationRead } from '../api/mark-notification-read';
import { NOTIFICATION_QUERY_KEYS } from './use-menu-badges';

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markNotificationRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_QUERY_KEYS.all });
    },
  });
}
