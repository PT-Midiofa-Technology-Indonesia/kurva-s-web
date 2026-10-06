'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { saveBillingInformation } from '../api';
import { BILLINGS_QUERY_KEYS } from './use-billings';

export function useSaveBillingInformation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: saveBillingInformation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BILLINGS_QUERY_KEYS.all });
    },
  });
}
