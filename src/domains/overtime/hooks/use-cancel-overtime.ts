'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ENTITY_NAMES, TOAST_MESSAGES } from '@/shared/constants/toast-messages';
import { getErrorMessage } from '@/shared/lib/api-error';
import { toast } from '@/shared/lib/toast';
import type { CancelOvertimeParams } from '../api/cancel-overtime';
import { cancelOvertime } from '../api/cancel-overtime';
import { OVERTIME_QUERY_KEYS } from './use-overtimes';

export function useCancelOvertime() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: CancelOvertimeParams) => cancelOvertime(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: OVERTIME_QUERY_KEYS.lists() });
      toast.success({ title: TOAST_MESSAGES.SUCCESS.DELETED(ENTITY_NAMES.OVERTIME) });
    },
    onError: (error: unknown) => {
      const message = getErrorMessage(error);
      toast.error({ title: message });
    },
  });
}
