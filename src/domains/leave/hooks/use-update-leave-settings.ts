'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ApiErrorClass } from '@/shared/lib/api-error';
import { toast } from '@/shared/lib/toast';
import { updateLeaveSettings } from '../api/update-leave-settings';
import type { LeaveTypeOption, UpdateLeaveSettingsPayload } from '../types';
import { LEAVE_SETTINGS_QUERY_KEYS } from './use-leave-settings';
import { LEAVE_TYPES_QUERY_KEYS } from './use-leave-types';

function mapSettingsToLeaveTypeOptions(
  leaveTypes: UpdateLeaveSettingsPayload['leaveTypes']
): LeaveTypeOption[] {
  return leaveTypes
    .filter((item) => item.isActive)
    .map((item) => ({
      id: item.id || item.leaveType,
      code: item.id || item.leaveType,
      name: item.leaveType,
      isActive: item.isActive,
      isPaid: false,
      requiresDocument: false,
      quota: item.annualQuota,
      balance: null,
    }));
}

export function useUpdateLeaveSettings(companyId?: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: UpdateLeaveSettingsPayload) => {
      const response = await updateLeaveSettings(payload, companyId);

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
    onSuccess: (response) => {
      const updatedSettings = response.data;

      toast.success({ title: 'Pengaturan cuti berhasil disimpan' });

      queryClient.setQueryData(LEAVE_SETTINGS_QUERY_KEYS.byCompany(companyId), {
        success: true,
        message: response.message,
        data: updatedSettings,
      });

      queryClient
        .getQueryCache()
        .findAll({ queryKey: LEAVE_TYPES_QUERY_KEYS.all })
        .forEach((query) => {
          queryClient.setQueryData(query.queryKey, {
            success: true,
            message: response.message,
            data: mapSettingsToLeaveTypeOptions(updatedSettings.leaveTypes),
          });
        });
    },
    onError: (error: Error) => {
      toast.error({ title: error.message || 'Gagal menyimpan pengaturan cuti' });
    },
  });
}
