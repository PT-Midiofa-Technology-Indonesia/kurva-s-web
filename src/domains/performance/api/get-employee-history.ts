import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { BaseQueryParams } from '@/shared/types/query-params';
import type { GetEmployeeHistoryResponse } from '../types';

export interface GetEmployeeHistoryParams extends BaseQueryParams {
  month?: number;
  year?: number;
  companyId?: string;
}

export async function getEmployeeHistory(
  employeeId: string,
  params?: GetEmployeeHistoryParams
): Promise<GetEmployeeHistoryResponse> {
  try {
    const { companyId, ...queryParams } = params ?? {};
    const { data } = await api.get<GetEmployeeHistoryResponse>(
      getApiPath(`/performance/employees/${employeeId}/history`),
      {
        params: queryParams,
        headers: { 'x-company-id': companyId ?? '' },
      }
    );
    return data;
  } catch (error: unknown) {
    return handleApiError(error, true);
  }
}
