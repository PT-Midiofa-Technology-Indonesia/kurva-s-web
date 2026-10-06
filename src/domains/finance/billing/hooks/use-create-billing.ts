'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { type CreateBillingParams, createBilling } from '../api';
import { BILLINGS_QUERY_KEYS } from './use-billings';

export function useCreateBilling() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: CreateBillingParams) => createBilling(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BILLINGS_QUERY_KEYS.all });
    },
  });
}
