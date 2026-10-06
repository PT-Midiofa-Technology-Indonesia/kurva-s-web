import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiResponse } from '@/types/api';
import type { OvertimeSettingsData, UpdateOvertimeSettingsPayload } from '../types';

export type UpdateOvertimeSettingsResponse = ApiResponse<OvertimeSettingsData>;

export async function updateOvertimeSettings(
  payload: UpdateOvertimeSettingsPayload,
  companyId?: string | null
): Promise<UpdateOvertimeSettingsResponse> {
  try {
    const { data } = await api.put<ApiResponse<OvertimeSettingsData>>(
      getApiPath('/human-resource/overtimes/settings'),
      payload,
      { headers: { 'x-company-id': companyId ?? '' } }
    );
    return data;
  } catch (error: unknown) {
    handleApiError(error);
    throw error;
  }
}
