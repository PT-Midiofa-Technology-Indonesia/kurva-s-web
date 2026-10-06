import { handleApiError } from '@/lib/api-error';
import { getApiPath } from '@/shared/lib/api-config';
import api from '@/shared/lib/axios';
import type { ApiSuccessResponse } from '@/types/api';
import type { CreateEmployeeGradePayload, EmployeeGrade } from '../types';

export async function createEmployeeGrade(
  payload: CreateEmployeeGradePayload
): Promise<EmployeeGrade> {
  try {
    const { data } = await api.post<ApiSuccessResponse<EmployeeGrade>>(
      getApiPath('/employee-grades'),
      payload
    );
    return data.data;
  } catch (error: unknown) {
    handleApiError(error);
  }
}
