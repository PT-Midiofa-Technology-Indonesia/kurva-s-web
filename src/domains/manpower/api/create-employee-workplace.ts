import { handleApiError } from '@/lib/api-error';
import { getApiPath } from '@/shared/lib/api-config';
import api from '@/shared/lib/axios';
import type { ApiSuccessResponse } from '@/types/api';
import type { EmployeeWorkplace, EmployeeWorkplacePayload } from '../types';

export async function createEmployeeWorkplace(
  employeeId: string,
  payload: EmployeeWorkplacePayload,
  companyId?: string
): Promise<EmployeeWorkplace> {
  try {
    const { data } = await api.post<ApiSuccessResponse<EmployeeWorkplace>>(
      getApiPath(`/employees/${employeeId}/workplaces`),
      payload,
      {
        headers: companyId ? { 'X-Company-Id': companyId } : undefined,
      }
    );
    return data.data;
  } catch (error: unknown) {
    handleApiError(error);
  }
}
