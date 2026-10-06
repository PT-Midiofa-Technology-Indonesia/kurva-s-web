import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiSuccessResponse } from '@/types/api';
import type {
  CalculateAttendanceStatusPayload,
  CalculateAttendanceStatusResponseData,
} from '../types';

export interface CalculateAttendanceStatusResponse {
  success: boolean;
  message: string;
  data: CalculateAttendanceStatusResponseData;
}

export async function calculateAttendanceStatus(
  payload: CalculateAttendanceStatusPayload,
  companyId?: string | null
): Promise<CalculateAttendanceStatusResponse> {
  try {
    const { data } = await api.post<ApiSuccessResponse<CalculateAttendanceStatusResponseData>>(
      getApiPath('/human-resource/attendances/calculate-status'),
      payload,
      { headers: { 'x-company-id': companyId ?? '' } }
    );
    return {
      success: true,
      message: data.message,
      data: data.data,
    };
  } catch (error: unknown) {
    handleApiError(error);
    // Unreachable — handleApiError throws
    return {
      success: false,
      message: '',
      data: {} as CalculateAttendanceStatusResponseData,
    };
  }
}
