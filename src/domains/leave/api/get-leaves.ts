import { getApiPath } from '@/shared/lib/api-config';
import { ApiErrorClass, handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiPaginatedResponse } from '@/types/api';
import type { LeaveListItem } from '../types';
import { mapBackendLeave } from './mappers';

export interface GetLeavesParams {
  page?: number;
  perPage?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
  employeeId?: string;
  year?: number | string;
  status?: string | string[];
  leaveTypeId?: string | string[];
  leaveTypeIds?: string | string[];
  companyId?: string;
}

export type GetLeavesResponse = ApiPaginatedResponse<LeaveListItem[]>;

export async function getLeaves(params?: GetLeavesParams): Promise<GetLeavesResponse> {
  try {
    const queryParams: Record<string, unknown> = {};
    let companyId: string | undefined;

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value === undefined || value === null || value === '') return;
        if (key === 'companyId') {
          companyId = value as string;
          return;
        }
        if (key === 'leaveTypeId' || key === 'leaveTypeIds') {
          queryParams.leaveTypeId = Array.isArray(value) ? value[0] : value;
          return;
        }

        if (Array.isArray(value)) {
          value.forEach((item) => {
            const queryKey = `${key}[]`;
            if (!queryParams[queryKey]) queryParams[queryKey] = [];
            (queryParams[queryKey] as string[]).push(item);
          });
          return;
        }

        queryParams[key] = value;
      });
    }

    const { data } = await api.get<ApiPaginatedResponse<LeaveListItem[]>>(
      getApiPath('/human-resource/leaves'),
      {
        params: queryParams,
        headers: companyId ? { 'X-Company-Id': companyId } : undefined,
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
      data: data.data.map(mapBackendLeave),
    };
  } catch (error: unknown) {
    return handleApiError<LeaveListItem>(error, true);
  }
}
