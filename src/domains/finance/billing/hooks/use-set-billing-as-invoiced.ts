'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { setBillingAsInvoiced } from '../api';
import { BILLINGS_QUERY_KEYS } from './use-billings';

export function useSetBillingAsInvoiced() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: setBillingAsInvoiced,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BILLINGS_QUERY_KEYS.all });
    },
  });
}
