'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ENTITY_NAMES, TOAST_MESSAGES } from '@/shared/constants/toast-messages';
import { getErrorMessage } from '@/shared/lib/api-error';
import { toast } from '@/shared/lib/toast';
import type { UpdateAttendanceParams } from '../api/update-attendance';
import { updateAttendance } from '../api/update-attendance';
import { ATTENDANCE_QUERY_KEYS } from './use-attendances';

export function useUpdateAttendance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: UpdateAttendanceParams) => updateAttendance(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ATTENDANCE_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: ATTENDANCE_QUERY_KEYS.all });
      toast.success({ title: TOAST_MESSAGES.SUCCESS.UPDATED(ENTITY_NAMES.ATTENDANCE) });
    },
    onError: (error) => {
      const message = getErrorMessage(error);
      toast.error({ title: message });
    },
  });
}
