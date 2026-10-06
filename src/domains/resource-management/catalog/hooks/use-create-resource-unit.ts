'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getErrorMessage } from '@/lib/api-error';
import { toast } from '@/lib/toast';
import { TOAST_MESSAGES } from '@/shared/constants/toast-messages';
import { createResourceUnit } from '../api/create-resource-unit';
import type { CreateResourceUnitPayload } from '../types';
import { RESOURCE_UNIT_QUERY_KEYS } from './use-resource-units';

export function useCreateResourceUnit(companyId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateResourceUnitPayload) => createResourceUnit(payload, companyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: RESOURCE_UNIT_QUERY_KEYS.all });
      toast.success({
        title: TOAST_MESSAGES.SUCCESS.CREATED('Resource Unit'),
      });
    },
    onError: (error) => {
      const message = getErrorMessage(error);
      toast.error({ title: message });
    },
  });
}
