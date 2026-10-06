import { getApiPath } from '@/shared/lib/api-config';
import { ApiErrorClass, handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiResponse } from '@/types/api';
import type { Leave } from '../types';
import { mapBackendLeave } from './mappers';

export type GetLeaveDetailResponse = ApiResponse<Leave>;

export async function getLeaveDetail(
  id: string,
  companyId?: string | null
): Promise<GetLeaveDetailResponse> {
  try {
    const { data } = await api.get<ApiResponse<Leave>>(getApiPath(`/human-resource/leaves/${id}`), {
      headers: companyId ? { 'X-Company-Id': companyId } : undefined,
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
      data: mapBackendLeave(data.data),
    };
  } catch (error: unknown) {
    handleApiError(error);
  }
}
