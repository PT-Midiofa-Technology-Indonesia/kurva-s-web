'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ENTITY_NAMES, TOAST_MESSAGES } from '@/shared/constants/toast-messages';
import { getErrorMessage } from '@/shared/lib/api-error';
import { toast } from '@/shared/lib/toast';
import { deleteHierarchyManagement } from '../api/delete-hierarchy-management';
import { HIERARCHY_MANAGEMENT_QUERY_KEYS } from './use-hierarchy-managements';

export function useDeleteHierarchyManagement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteHierarchyManagement(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: HIERARCHY_MANAGEMENT_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: HIERARCHY_MANAGEMENT_QUERY_KEYS.infinite() });
      toast.success({ title: TOAST_MESSAGES.SUCCESS.DELETED(ENTITY_NAMES.HIERARCHY_MANAGEMENT) });
    },
    onError: (error) => {
      const message = getErrorMessage(error);
      toast.error({ title: message });
    },
  });
}
