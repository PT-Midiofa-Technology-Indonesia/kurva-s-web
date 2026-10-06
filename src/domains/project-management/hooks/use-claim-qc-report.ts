'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { claimQcReport } from '../api/claim-qc-report';
import { MANPOWER_PLAN_QUERY_KEYS } from './use-manpower-plan';

export function useClaimQcReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reportId: string) => claimQcReport(reportId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MANPOWER_PLAN_QUERY_KEYS.all });
    },
  });
}
