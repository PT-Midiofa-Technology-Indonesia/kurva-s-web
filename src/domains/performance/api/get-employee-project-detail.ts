import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiSuccessResponse } from '@/shared/types/api';
import type { PerformanceDetail } from '../types';

export interface GetEmployeeProjectDetailResponse extends ApiSuccessResponse<PerformanceDetail> {}

export async function getEmployeeProjectDetail(
  employeeId: string,
  projectId: string,
  companyId?: string
): Promise<PerformanceDetail | undefined> {
  try {
    const { data } = await api.get<GetEmployeeProjectDetailResponse>(
      getApiPath(`/performance/employees/${employeeId}/projects/${projectId}`),
      { headers: { 'x-company-id': companyId ?? '' } }
    );
    return data.data;
  } catch (error: unknown) {
    handleApiError(error);
    return undefined;
  }
}
