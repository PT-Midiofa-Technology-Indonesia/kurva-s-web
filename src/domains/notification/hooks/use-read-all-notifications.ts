'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { readAllNotifications } from '../api/read-all-notifications';
import { NOTIFICATION_QUERY_KEYS } from './use-menu-badges';

export function useReadAllNotifications() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: readAllNotifications,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_QUERY_KEYS.all });
    },
  });
}
