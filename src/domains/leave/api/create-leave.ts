import { getApiPath } from '@/shared/lib/api-config';
import { ApiErrorClass, handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiResponse } from '@/types/api';
import type { CreateLeavePayload, Leave } from '../types';
import { mapBackendLeave } from './mappers';

export interface CreateLeaveParams {
  companyId: string;
  payload: CreateLeavePayload;
}

export type CreateLeaveResponse = ApiResponse<Leave>;

export async function createLeave(params: CreateLeaveParams): Promise<CreateLeaveResponse> {
  try {
    const { data } = await api.post<ApiResponse<Leave>>(
      getApiPath('/human-resource/leaves'),
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

    if (!data.data) return data as CreateLeaveResponse;

    return {
      ...data,
      data: mapBackendLeave(data.data),
    };
  } catch (error: unknown) {
    handleApiError(error);
  }
}
