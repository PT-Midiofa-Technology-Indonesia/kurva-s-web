'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { cancelBilling } from '../api';
import { BILLINGS_QUERY_KEYS } from './use-billings';

export function useCancelBilling() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cancelBilling,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BILLINGS_QUERY_KEYS.all });
    },
  });
}
