import { handleApiError } from '@/lib/api-error';
import { getApiPath } from '@/shared/lib/api-config';
import api from '@/shared/lib/axios';
import type { ApiSuccessResponse } from '@/types/api';
import type { EmployeeGrade, UpdateEmployeeGradePayload } from '../types';

export async function updateEmployeeGrade(
  id: string,
  payload: UpdateEmployeeGradePayload
): Promise<EmployeeGrade> {
  try {
    const { data } = await api.put<ApiSuccessResponse<EmployeeGrade>>(
      getApiPath(`/employee-grades/${id}`),
      payload
    );
    return data.data;
  } catch (error: unknown) {
    handleApiError(error);
  }
}
