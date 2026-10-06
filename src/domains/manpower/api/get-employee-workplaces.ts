import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiPaginatedResponse } from '@/types/api';
import type { EmployeeWorkplace } from '../types';

export interface GetEmployeeWorkplacesParams {
  page?: number;
  perPage?: number;
  companyId?: string;
}

export type GetEmployeeWorkplacesResponse = ApiPaginatedResponse<EmployeeWorkplace[]>;

export async function getEmployeeWorkplaces(
  employeeId: string,
  params?: GetEmployeeWorkplacesParams
): Promise<GetEmployeeWorkplacesResponse> {
  const { companyId, ...queryParams } = params ?? {};
  try {
    const { data } = await api.get<ApiPaginatedResponse<EmployeeWorkplace[]>>(
      getApiPath(`/employees/${employeeId}/workplaces`),
      {
        params: queryParams,
        headers: companyId ? { 'X-Company-Id': companyId } : undefined,
      }
    );
    return data;
  } catch (error: unknown) {
    return handleApiError<EmployeeWorkplace>(error, true);
  }
}
