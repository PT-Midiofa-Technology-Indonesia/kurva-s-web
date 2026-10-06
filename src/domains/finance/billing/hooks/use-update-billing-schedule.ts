'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateBillingSchedule } from '../api';
import { BILLINGS_QUERY_KEYS } from './use-billings';

export function useUpdateBillingSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateBillingSchedule,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BILLINGS_QUERY_KEYS.all });
    },
  });
}
