'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getErrorMessage } from '@/lib/api-error';
import { toast } from '@/lib/toast';
import { TOAST_MESSAGES } from '@/shared/constants/toast-messages';
import { deleteResourceUnit } from '../api/delete-resource-unit';
import { RESOURCE_UNIT_QUERY_KEYS } from './use-resource-units';

export function useDeleteResourceUnit(companyId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteResourceUnit(id, companyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: RESOURCE_UNIT_QUERY_KEYS.all });
      toast.success({
        title: TOAST_MESSAGES.SUCCESS.DELETED('Resource Unit'),
      });
    },
    onError: (error) => {
      const message = getErrorMessage(error);
      toast.error({ title: message });
    },
  });
}
