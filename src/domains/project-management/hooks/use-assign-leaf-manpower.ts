'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { assignLeafManpower } from '../api/assign-leaf-manpower';
import type { AssignLeafManpowerPayload } from '../types/manpower-planning';
import { MANPOWER_PLAN_QUERY_KEYS } from './use-manpower-plan';

export function useAssignLeafManpower() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AssignLeafManpowerPayload) => assignLeafManpower(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MANPOWER_PLAN_QUERY_KEYS.all });
    },
  });
}
