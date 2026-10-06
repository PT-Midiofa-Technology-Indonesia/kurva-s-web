import { getApiPath } from '@/shared/lib/api-config';
import { ApiErrorClass, handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiResponse } from '@/types/api';
import type { LeaveSettingsData } from '../types';
import { mapLeaveSettingsResponse } from './mappers';

export type GetLeaveSettingsResponse = ApiResponse<LeaveSettingsData>;

export async function getLeaveSettings(
  _companyId?: string | null
): Promise<GetLeaveSettingsResponse> {
  try {
    const { data } = await api.get<ApiResponse<LeaveSettingsData>>(getApiPath('/leave-types'), {
      params: {},
    });

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
