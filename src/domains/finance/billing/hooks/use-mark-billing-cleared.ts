'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { markBillingCleared } from '../api';
import { BILLINGS_QUERY_KEYS } from './use-billings';

export function useMarkBillingCleared() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markBillingCleared,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BILLINGS_QUERY_KEYS.all });
    },
  });
}
