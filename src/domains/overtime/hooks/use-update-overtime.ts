'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ENTITY_NAMES, TOAST_MESSAGES } from '@/shared/constants/toast-messages';
import { getErrorMessage } from '@/shared/lib/api-error';
import { toast } from '@/shared/lib/toast';
import type { UpdateOvertimeParams } from '../api/update-overtime';
import { updateOvertime } from '../api/update-overtime';
import { OVERTIME_QUERY_KEYS } from './use-overtimes';

export function useUpdateOvertime() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: UpdateOvertimeParams) => updateOvertime(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: OVERTIME_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: OVERTIME_QUERY_KEYS.all });
      toast.success({ title: TOAST_MESSAGES.SUCCESS.UPDATED(ENTITY_NAMES.OVERTIME) });
    },
    onError: (error) => {
      const message = getErrorMessage(error);
      toast.error({ title: message });
    },
  });
}
