'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { assignParentItems } from '../api/assign-parent-items';
import type { AssignParentItemsPayload } from '../types/manpower-planning';
import { MANPOWER_PLAN_QUERY_KEYS } from './use-manpower-plan';

/**
 * Parent bulk/single assign (`AssignItemsDialog`, work branch) via
 * `POST /project-tasks/delegate/non-final`. Refreshes the tree, the leaf assignments and the QC
 * list in one go — same invalidation surface as the leaf/QC mutations.
 */
export function useAssignParentItems() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AssignParentItemsPayload) => assignParentItems(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MANPOWER_PLAN_QUERY_KEYS.all });
    },
  });
}
