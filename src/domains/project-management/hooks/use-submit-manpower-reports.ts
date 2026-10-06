'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { submitManpowerReports } from '../api/submit-manpower-reports';
import type { SubmitManpowerReportsPayload } from '../types/manpower-planning';
import { MANPOWER_PLAN_QUERY_KEYS } from './use-manpower-plan';

export function useSubmitManpowerReports() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SubmitManpowerReportsPayload) => submitManpowerReports(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MANPOWER_PLAN_QUERY_KEYS.all });
    },
  });
}
