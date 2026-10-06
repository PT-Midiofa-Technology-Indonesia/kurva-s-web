import { getApiPath } from '@/shared/lib/api-config';
import { ApiErrorClass, handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiResponse } from '@/types/api';
import type { Leave, UpdateLeavePayload } from '../types';
import { mapBackendLeave } from './mappers';

export interface UpdateLeaveParams {
  id: string;
  companyId: string;
  payload: UpdateLeavePayload;
}

export type UpdateLeaveResponse = ApiResponse<Leave>;

export async function updateLeave(params: UpdateLeaveParams): Promise<UpdateLeaveResponse> {
  try {
    const { data } = await api.put<ApiResponse<Leave>>(
      getApiPath(`/human-resource/leaves/${params.id}`),
      {
        employeeId: params.payload.employeeId,
        leaveTypeId: params.payload.leaveTypeId,
        startDate: params.payload.startDate,
        endDate: params.payload.endDate,
        reason: params.payload.description,
      },
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
