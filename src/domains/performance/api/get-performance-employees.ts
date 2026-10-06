import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { BaseQueryParams } from '@/shared/types/query-params';
import type { GetPerformanceEmployeesResponse } from '../types';

export interface GetPerformanceEmployeesParams extends BaseQueryParams {
  month?: number;
  year?: number;
  gradeId?: string;
  companyId?: string;
}

export async function getPerformanceEmployees(
  params?: GetPerformanceEmployeesParams
): Promise<GetPerformanceEmployeesResponse> {
  try {
    const { companyId, ...queryParams } = params ?? {};
    const { data } = await api.get<GetPerformanceEmployeesResponse>(
      getApiPath('/performance/employees'),
      {
        params: queryParams,
        headers: { 'x-company-id': companyId ?? '' },
      }
    );
    return data;
  } catch (error: unknown) {
    return handleApiError(error, true) as unknown as GetPerformanceEmployeesResponse;
  }
}
