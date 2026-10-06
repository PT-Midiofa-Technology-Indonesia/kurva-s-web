import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiPaginatedResponse } from '@/types/api';
import type { OvertimeListItem } from '../types';

export interface GetOvertimesParams {
  page?: number;
  perPage?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
  startDate?: string;
  endDate?: string;
  status?: string | string[];
  employeeIds?: string | string[];
  projectIds?: string | string[];
  companyId?: string;
}

export type GetOvertimesResponse = ApiPaginatedResponse<OvertimeListItem[]>;

export async function getOvertimes(params?: GetOvertimesParams): Promise<GetOvertimesResponse> {
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
        if (Array.isArray(value)) {
          value.forEach((v) => {
            const k = `${key}[]`;
            if (!queryParams[k]) queryParams[k] = [];
            (queryParams[k] as string[]).push(v);
          });
        } else {
          queryParams[key] = value;
        }
      });
    }

    const { data } = await api.get<ApiPaginatedResponse<OvertimeListItem[]>>(
      getApiPath('/human-resource/overtimes'),
      {
        params: queryParams,
        headers: companyId ? { 'X-Company-Id': companyId } : undefined,
      }
    );
    return data;
  } catch (error: unknown) {
    return handleApiError<OvertimeListItem>(error, true);
  }
}
