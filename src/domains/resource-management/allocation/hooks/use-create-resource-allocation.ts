'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRef } from 'react';
import { getErrorMessage } from '@/lib/api-error';
import { toast } from '@/lib/toast';
import { TOAST_MESSAGES } from '@/shared/constants/toast-messages';
import { createResourceAllocation } from '../api/create-resource-allocation';
import { RESOURCE_ALLOCATION_QUERY_KEYS } from './use-resource-allocations';

export function useCreateResourceAllocation(projectId: string) {
  const queryClient = useQueryClient();
  const projectIdRef = useRef(projectId);
  projectIdRef.current = projectId;

  return useMutation({
    mutationFn: (payload: Parameters<typeof createResourceAllocation>[0]) =>
      createResourceAllocation(payload, projectIdRef.current),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: RESOURCE_ALLOCATION_QUERY_KEYS.all });
      toast.success({
        title: TOAST_MESSAGES.SUCCESS.CREATED('Resource Allocation'),
      });
    },
    onError: (error) => {
      const message = getErrorMessage(error);
      toast.error({ title: message });
    },
  });
}
