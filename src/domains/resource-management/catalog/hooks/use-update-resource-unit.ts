'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getErrorMessage } from '@/lib/api-error';
import { toast } from '@/lib/toast';
import { TOAST_MESSAGES } from '@/shared/constants/toast-messages';
import { updateResourceUnit } from '../api/update-resource-unit';
import type { UpdateResourceUnitPayload } from '../types';
import { RESOURCE_UNIT_QUERY_KEYS } from './use-resource-units';

export function useUpdateResourceUnit(resourceUnitId: string, companyId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateResourceUnitPayload) =>
      updateResourceUnit(resourceUnitId, payload, companyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: RESOURCE_UNIT_QUERY_KEYS.all });
      queryClient.invalidateQueries({
        queryKey: RESOURCE_UNIT_QUERY_KEYS.detail(resourceUnitId),
      });
      toast.success({
        title: TOAST_MESSAGES.SUCCESS.UPDATED('Resource Unit'),
      });
    },
    onError: (error) => {
      const message = getErrorMessage(error);
      toast.error({ title: message });
    },
  });
}
