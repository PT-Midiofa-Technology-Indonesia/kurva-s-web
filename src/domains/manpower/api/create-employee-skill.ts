import { handleApiError } from '@/lib/api-error';
import { getApiPath } from '@/shared/lib/api-config';
import api from '@/shared/lib/axios';
import type { ApiSuccessResponse } from '@/types/api';
import type { EmployeeSkill, EmployeeSkillPayload } from '../types';

export async function createEmployeeSkill(
  employeeId: string,
  payload: EmployeeSkillPayload,
  companyId?: string
): Promise<EmployeeSkill> {
  try {
    const { data } = await api.post<ApiSuccessResponse<EmployeeSkill>>(
      getApiPath(`/employees/${employeeId}/skills`),
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
