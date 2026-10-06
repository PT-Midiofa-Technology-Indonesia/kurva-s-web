import { getApiPath } from '@/shared/lib/api-config';
import { ApiErrorClass, handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiResponse } from '@/types/api';
import type { Leave } from '../types';
import { mapBackendLeave } from './mappers';

export interface CancelLeaveParams {
  id: string;
  companyId: string;
}

export type CancelLeaveResponse = ApiResponse<Leave>;

export async function cancelLeave(params: CancelLeaveParams): Promise<CancelLeaveResponse> {
  try {
    const { data } = await api.post<ApiResponse<Leave>>(
      getApiPath(`/human-resource/leaves/${params.id}/cancel`),
      {},
      { headers: { 'X-Company-Id': params.companyId } }
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
      data: mapBackendLeave(data.data),
    };
  } catch (error: unknown) {
    handleApiError(error);
  }
}
