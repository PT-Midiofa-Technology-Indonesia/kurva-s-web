import { getApiPath } from '@/shared/lib/api-config';
import { ApiErrorClass, handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiResponse } from '@/types/api';
import type { LeaveTypeOption } from '../types';
import { mapLeaveTypeOptionsResponse } from './mappers';

export interface GetLeaveTypesParams {
  companyId?: string | null;
  employeeId?: string | null;
  year?: number | string | null;
}

export type GetLeaveTypesResponse = ApiResponse<LeaveTypeOption[]>;

export async function getLeaveTypes(
  params: GetLeaveTypesParams = {}
): Promise<GetLeaveTypesResponse> {
  const queryParams: Record<string, unknown> = {};

  if (params.employeeId) queryParams.employeeId = params.employeeId;
  if (params.year) queryParams.year = params.year;

  try {
    const { data } = await api.get<ApiResponse<LeaveTypeOption[]>>(
      getApiPath('/human-resource/leaves/types'),
      {
        params: queryParams,
        headers: params.companyId ? { 'X-Company-Id': params.companyId } : undefined,
      }
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
      data: mapLeaveTypeOptionsResponse(data.data),
    };
  } catch (error: unknown) {
    handleApiError(error);
  }
}
