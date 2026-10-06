import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiSuccessResponse } from '@/shared/types/api';
import type { PerformanceDetail } from '../types';

export interface GetEmployeeDetailParams {
  month?: number;
  year?: number;
  companyId?: string;
}

export interface GetEmployeeDetailResponse extends ApiSuccessResponse<PerformanceDetail> {}

export async function getEmployeeDetail(
  employeeId: string,
  params?: GetEmployeeDetailParams
): Promise<PerformanceDetail> {
  try {
    const { companyId, ...queryParams } = params ?? {};
    const { data } = await api.get<GetEmployeeDetailResponse>(
      getApiPath(`/performance/employees/${employeeId}`),
      {
        params: queryParams,
        headers: { 'x-company-id': companyId ?? '' },
      }
    );
    return data.data;
  } catch (error: unknown) {
    handleApiError(error);
  }
}
