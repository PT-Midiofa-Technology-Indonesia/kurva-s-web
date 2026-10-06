import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { BaseQueryParams } from '@/shared/types/query-params';
import type { ApiPaginatedResponse } from '@/types/api';
import type { EmployeeGradeListItem } from '../types';

export interface GetEmployeeGradesParams extends BaseQueryParams {
  isActive?: boolean;
  load?: string;
}

export type GetEmployeeGradesResponse = ApiPaginatedResponse<EmployeeGradeListItem[]>;

export async function getEmployeeGrades(
  params?: GetEmployeeGradesParams
): Promise<GetEmployeeGradesResponse> {
  try {
    const { data } = await api.get<ApiPaginatedResponse<EmployeeGradeListItem[]>>(
      getApiPath('/employee-grades'),
      { params }
    );
    return data;
  } catch (error: unknown) {
    return handleApiError<EmployeeGradeListItem>(error, true);
  }
}
