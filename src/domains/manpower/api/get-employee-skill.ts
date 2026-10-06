import { handleApiError } from '@/lib/api-error';
import { getApiPath } from '@/shared/lib/api-config';
import api from '@/shared/lib/axios';
import type { ApiResponse } from '@/types/api';
import type { EmployeeSkill } from '../types';

export type GetEmployeeSkillResponse = ApiResponse<EmployeeSkill>;

export async function getEmployeeSkill(
  employeeId: string,
  skillId: string
): Promise<GetEmployeeSkillResponse | null> {
  try {
    const { data } = await api.get<ApiResponse<EmployeeSkill>>(
      getApiPath(`/employees/${employeeId}/skills/${skillId}`)
    );
    return data;
  } catch (error: unknown) {
    if ((error as { response?: { status?: number } })?.response?.status === 404) {
      return null;
    }
    handleApiError(error);
  }
}
