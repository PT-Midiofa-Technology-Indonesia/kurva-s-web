'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { payBilling } from '../api';
import { BILLINGS_QUERY_KEYS } from './use-billings';

export function usePayBilling() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: payBilling,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: BILLINGS_QUERY_KEYS.all });
      queryClient.invalidateQueries({
        queryKey: BILLINGS_QUERY_KEYS.documents(variables.billingId, variables.companyId),
      });
    },
  });
}
