'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { submitQcReview } from '../api/submit-qc-review';
import type { SubmitQcReviewPayload } from '../types/manpower-planning';
import { MANPOWER_PLAN_QUERY_KEYS } from './use-manpower-plan';

export function useSubmitQcReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SubmitQcReviewPayload) => submitQcReview(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MANPOWER_PLAN_QUERY_KEYS.all });
    },
  });
}
