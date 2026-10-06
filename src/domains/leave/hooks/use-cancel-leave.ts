'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ApiErrorClass } from '@/shared/lib/api-error';
import { toast } from '@/shared/lib/toast';
import type { CancelLeaveParams } from '../api/cancel-leave';
import { cancelLeave } from '../api/cancel-leave';
import { getFriendlyLeaveErrorToastOptions } from '../utils/leave-error-message';
import { LEAVE_DETAIL_QUERY_KEYS } from './use-leave-detail';
import { LEAVE_TYPES_QUERY_KEYS } from './use-leave-types';
import { LEAVE_QUERY_KEYS } from './use-leaves';

export function useCancelLeave() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: CancelLeaveParams) => {
      const response = await cancelLeave(params);

      if (!response.success) {
        throw new ApiErrorClass(
          response.message,
          undefined,
          response.errorCode ?? 'UNKNOWN',
          response.errors ?? undefined
        );
      }

      return response;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: LEAVE_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({
        queryKey: LEAVE_DETAIL_QUERY_KEYS.detail(variables.id, variables.companyId),
      });
      queryClient.invalidateQueries({ queryKey: LEAVE_TYPES_QUERY_KEYS.all });
      toast.success({ title: 'Cuti berhasil dibatalkan' });
    },
    onError: (error) => {
      toast.error(getFriendlyLeaveErrorToastOptions(error));
    },
  });
}
