'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getErrorMessage } from '@/shared/lib/api-error';
import { toast } from '@/shared/lib/toast';
import { type BulkSubmitPayload, postBulkAttendances } from '../api/post-bulk-attendances';
import { ATTENDANCE_QUERY_KEYS } from './use-attendances';
import { BULK_QUERY_KEYS } from './use-bulk-prepare';

export function useBulkSubmit(companyId?: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: BulkSubmitPayload) => postBulkAttendances(payload, companyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ATTENDANCE_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: BULK_QUERY_KEYS.all });
      toast.success({ title: 'Attendance berhasil disimpan' });
    },
    onError: (error) => {
      toast.error({ title: getErrorMessage(error) });
    },
  });
}
