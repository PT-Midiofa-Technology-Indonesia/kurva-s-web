import { handleApiError } from '@/lib/api-error';
import { getApiPath } from '@/shared/lib/api-config';
import api from '@/shared/lib/axios';
import type { ApiResponse } from '@/types/api';
import type { EmployeeGrade } from '../types';

export type GetEmployeeGradeResponse = ApiResponse<EmployeeGrade>;

export async function getEmployeeGrade(id: string): Promise<GetEmployeeGradeResponse | null> {
  try {
    const { data } = await api.get<ApiResponse<EmployeeGrade>>(
      getApiPath(`/employee-grades/${id}`)
    );
    return data;
  } catch (error: unknown) {
    if ((error as { response?: { status?: number } })?.response?.status === 404) {
      return null;
    }
    handleApiError(error);
  }
}
