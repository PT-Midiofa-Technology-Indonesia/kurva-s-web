import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiSuccessResponse } from '@/types/api';
import type { BulkAttendancePayloadItem } from '../types';

export interface BulkSubmitPayload {
  attendances: BulkAttendancePayloadItem[];
}

export interface BulkSubmitResponse {
  success: boolean;
  message: string;
}

export async function postBulkAttendances(
  payload: BulkSubmitPayload,
  companyId?: string | null
): Promise<BulkSubmitResponse> {
  try {
    const { data } = await api.post<ApiSuccessResponse<null>>(
      getApiPath('/human-resource/attendances/bulk'),
      payload,
      { headers: { 'x-company-id': companyId ?? '' } }
    );
    return { success: true, message: data.message };
  } catch (error: unknown) {
    handleApiError(error);
    return { success: false, message: '' }; // unreachable — handleApiError throws
  }
}
