import { getApiPath } from '@/shared/lib/api-config';
import { ApiErrorClass, handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiResponse } from '@/types/api';
import type { LeaveSettingsData, UpdateLeaveSettingsPayload } from '../types';
import { mapLeaveSettingsPayload, mapLeaveSettingsResponse } from './mappers';

export type UpdateLeaveSettingsResponse = ApiResponse<LeaveSettingsData>;

export async function updateLeaveSettings(
  payload: UpdateLeaveSettingsPayload,
  _companyId?: string | null
): Promise<UpdateLeaveSettingsResponse> {
  try {
    const { data } = await api.put<ApiResponse<LeaveSettingsData>>(
      getApiPath('/leave-types/sync'),
      mapLeaveSettingsPayload(payload)
    );

    if (!data.success) {
      const errorData = data as {
        message: string;
        errorCode?: string;
        errors?: Record<string, string[]> | null;
      };

      throw new ApiErrorClass(
        errorData.message,
        undefined,
        errorData.errorCode ?? 'UNKNOWN',
        errorData.errors ?? undefined
      );
    }

    return {
      ...data,
      data: mapLeaveSettingsResponse(data.data),
    };
  } catch (error: unknown) {
    handleApiError(error);
  }
}
