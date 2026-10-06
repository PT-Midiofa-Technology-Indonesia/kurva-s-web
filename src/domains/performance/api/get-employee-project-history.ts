import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { GetEmployeeProjectHistoryResponse } from '../types';

export async function getEmployeeProjectHistory(
  employeeId: string,
  companyId?: string
): Promise<GetEmployeeProjectHistoryResponse> {
  try {
    const { data } = await api.get<GetEmployeeProjectHistoryResponse>(
      getApiPath(`/performance/employees/${employeeId}/project-history`),
      { headers: { 'x-company-id': companyId ?? '' } }
    );
    return data;
  } catch (error: unknown) {
    return handleApiError(error, true);
  }
}
