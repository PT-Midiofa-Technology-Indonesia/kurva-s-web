'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/shared/lib/toast';
import { updateOvertimeSettings } from '../api/update-overtime-settings';
import type { UpdateOvertimeSettingsPayload } from '../types';
import { OVERTIME_SETTINGS_QUERY_KEYS } from './use-overtime-settings';

export function useUpdateOvertimeSettings(companyId?: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateOvertimeSettingsPayload) =>
      updateOvertimeSettings(payload, companyId),
    onSuccess: (response) => {
      if (response.success) {
        toast.success({ title: 'Pengaturan overtime berhasil disimpan' });
        queryClient.invalidateQueries({
          queryKey: OVERTIME_SETTINGS_QUERY_KEYS.byCompany(companyId),
        });
      } else {
        toast.error({ title: response.message || 'Gagal menyimpan pengaturan overtime' });
      }
    },
    onError: (error: Error) => {
      toast.error({ title: error.message || 'Gagal menyimpan pengaturan overtime' });
    },
  });
}
