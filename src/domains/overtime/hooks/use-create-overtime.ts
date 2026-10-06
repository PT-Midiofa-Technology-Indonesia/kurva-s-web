'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ENTITY_NAMES, TOAST_MESSAGES } from '@/shared/constants/toast-messages';
import { getErrorMessage } from '@/shared/lib/api-error';
import { toast } from '@/shared/lib/toast';
import type { CreateOvertimeParams } from '../api/create-overtime';
import { createOvertime } from '../api/create-overtime';
import { OVERTIME_QUERY_KEYS } from './use-overtimes';

export function useCreateOvertime() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: CreateOvertimeParams) => createOvertime(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: OVERTIME_QUERY_KEYS.lists() });
      toast.success({ title: TOAST_MESSAGES.SUCCESS.CREATED(ENTITY_NAMES.OVERTIME) });
    },
    onError: (error) => {
      const message = getErrorMessage(error);
      toast.error({ title: message });
    },
  });
}
