import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiSuccessResponse } from '@/types/api';
import type { MarkNotificationReadPayload, MarkNotificationReadResult } from '../types';

export interface MarkNotificationReadParams {
  payload: MarkNotificationReadPayload;
  companyId?: string;
}

export async function markNotificationRead(
  params: MarkNotificationReadParams
): Promise<MarkNotificationReadResult> {
  try {
    const { data } = await api.post<ApiSuccessResponse<MarkNotificationReadResult>>(
      getApiPath('/notifications/read'),
      params.payload,
      { headers: params.companyId ? { 'X-Company-Id': params.companyId } : undefined }
    );
    return data.data;
  } catch (error: unknown) {
    handleApiError(error);
  }
}
