import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { GetEmployeeViolationsResponse } from '../types';

export async function getEmployeeViolations(
  employeeId: string,
  companyId?: string
): Promise<GetEmployeeViolationsResponse> {
  try {
    const { data } = await api.get<GetEmployeeViolationsResponse>(
      getApiPath(`/performance/employees/${employeeId}/violations`),
      { headers: { 'x-company-id': companyId ?? '' } }
    );
    return data;
  } catch (error: unknown) {
    return handleApiError(error, true);
  }
}
