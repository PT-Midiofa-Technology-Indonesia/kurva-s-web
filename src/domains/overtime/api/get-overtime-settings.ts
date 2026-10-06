import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiResponse } from '@/types/api';
import type { OvertimeSettingsData } from '../types';

export type GetOvertimeSettingsResponse = ApiResponse<OvertimeSettingsData>;

export async function getOvertimeSettings(
  companyId?: string | null
): Promise<GetOvertimeSettingsResponse> {
  try {
    const { data } = await api.get<ApiResponse<OvertimeSettingsData>>(
      getApiPath('/human-resource/overtimes/settings'),
      { headers: { 'x-company-id': companyId ?? '' } }
    );
    return data;
  } catch (error: unknown) {
    handleApiError(error);
    throw error;
  }
}
