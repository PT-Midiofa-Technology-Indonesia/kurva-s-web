import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { BaseQueryParams } from '@/shared/types/query-params';
import type { ApiPaginatedResponse } from '@/types/api';
import type { EmployeeListItem } from '../types';

export interface GetEmployeesParams extends BaseQueryParams {
  isActive?: boolean;
  employeeType?: string;
  contractType?: string;
  salaryType?: string;
  companyId?: string;
}

export type GetEmployeesResponse = ApiPaginatedResponse<EmployeeListItem[]>;

export async function getEmployees(params?: GetEmployeesParams): Promise<GetEmployeesResponse> {
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
        queryParams[key] = value;
      });
    }

    const { data } = await api.get<ApiPaginatedResponse<EmployeeListItem[]>>(
      getApiPath('/employees'),
      {
        params: queryParams,
        headers: companyId ? { 'X-Company-Id': companyId } : undefined,
      }
    );
    return data;
  } catch (error: unknown) {
    return handleApiError<EmployeeListItem>(error, true);
  }
}
