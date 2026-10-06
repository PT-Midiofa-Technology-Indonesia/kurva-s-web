'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { markNotificationItemRead } from '../api/mark-notification-item-read';
import { NOTIFICATION_QUERY_KEYS } from './use-menu-badges';

export function useMarkNotificationItemRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markNotificationItemRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_QUERY_KEYS.all });
    },
  });
}
