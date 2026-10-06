import { handleApiError } from '@/lib/api-error';
import { getApiPath } from '@/shared/lib/api-config';
import api from '@/shared/lib/axios';
import type { ApiResponse } from '@/types/api';
import type { Employee } from '../types';

export type GetEmployeeResponse = ApiResponse<Employee>;

export async function getEmployee(
  id: string,
  companyId?: string
): Promise<GetEmployeeResponse | null> {
  try {
    const { data } = await api.get<ApiResponse<Employee>>(getApiPath(`/employees/${id}`), {
      headers: companyId ? { 'X-Company-Id': companyId } : undefined,
    });
    return data;
  } catch (error: unknown) {
    if ((error as { response?: { status?: number } })?.response?.status === 404) {
      return null;
    }
    handleApiError(error);
  }
}
