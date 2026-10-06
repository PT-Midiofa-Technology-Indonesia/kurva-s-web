'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { assignQcReports } from '../api/assign-qc-reports';
import type { AssignQcTasksPayload } from '../types/manpower-planning';
import { MANPOWER_PLAN_QUERY_KEYS } from './use-manpower-plan';

/**
 * Bulk QC assign — `AssignItemsDialog` (`taskCategory='qc'`) submits through this. Posts to the
 * real `POST /quality-control/delegate`; invalidating the manpower root refreshes both the
 * planning tree and the QC list.
 */
export function useAssignQcReports() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AssignQcTasksPayload) => assignQcReports(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MANPOWER_PLAN_QUERY_KEYS.all });
    },
  });
}
