'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ENTITY_NAMES, TOAST_MESSAGES } from '@/shared/constants/toast-messages';
import { getErrorMessage } from '@/shared/lib/api-error';
import { toast } from '@/shared/lib/toast';
import type { UpdateHierarchyManagementPayload } from '../api/update-hierarchy-management';
import { updateHierarchyManagement } from '../api/update-hierarchy-management';
import { HIERARCHY_MANAGEMENT_QUERY_KEYS } from './use-hierarchy-managements';

export function useUpdateHierarchyManagement(hierarchyManagementId: string, companyId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateHierarchyManagementPayload) =>
      updateHierarchyManagement(hierarchyManagementId, payload, companyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: HIERARCHY_MANAGEMENT_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({
        queryKey: HIERARCHY_MANAGEMENT_QUERY_KEYS.detail(hierarchyManagementId),
      });
      queryClient.invalidateQueries({ queryKey: HIERARCHY_MANAGEMENT_QUERY_KEYS.infinite() });
      toast.success({ title: TOAST_MESSAGES.SUCCESS.UPDATED(ENTITY_NAMES.HIERARCHY_MANAGEMENT) });
    },
    onError: (error) => {
      const message = getErrorMessage(error);
      toast.error({ title: message });
    },
  });
}
