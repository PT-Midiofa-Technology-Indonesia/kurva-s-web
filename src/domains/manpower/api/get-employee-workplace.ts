import { handleApiError } from '@/lib/api-error';
import { getApiPath } from '@/shared/lib/api-config';
import api from '@/shared/lib/axios';
import type { ApiResponse } from '@/types/api';
import type { EmployeeWorkplace } from '../types';

export type GetEmployeeWorkplaceResponse = ApiResponse<EmployeeWorkplace>;

export async function getEmployeeWorkplace(
  employeeId: string,
  workplaceId: string
): Promise<GetEmployeeWorkplaceResponse | null> {
  try {
    const { data } = await api.get<ApiResponse<EmployeeWorkplace>>(
      getApiPath(`/employees/${employeeId}/workplaces/${workplaceId}`)
    );
    return data;
  } catch (error: unknown) {
    if ((error as { response?: { status?: number } })?.response?.status === 404) {
      return null;
    }
    handleApiError(error);
  }
}
