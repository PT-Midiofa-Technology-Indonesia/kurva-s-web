import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiPaginatedResponse } from '@/types/api';
import type { EmployeeSkill } from '../types';

export interface GetEmployeeSkillsParams {
  page?: number;
  perPage?: number;
  companyId?: string;
}

export type GetEmployeeSkillsResponse = ApiPaginatedResponse<EmployeeSkill[]>;

export async function getEmployeeSkills(
  employeeId: string,
  params?: GetEmployeeSkillsParams
): Promise<GetEmployeeSkillsResponse> {
  const { companyId, ...queryParams } = params ?? {};
  try {
    const { data } = await api.get<ApiPaginatedResponse<EmployeeSkill[]>>(
      getApiPath(`/employees/${employeeId}/skills`),
      {
        params: queryParams,
        headers: companyId ? { 'X-Company-Id': companyId } : undefined,
      }
    );
    return data;
  } catch (error: unknown) {
    return handleApiError<EmployeeSkill>(error, true);
  }
}
