import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiPaginatedResponse } from '@/shared/types/api';
import type { EmployeeSalaryAdjustment } from '../types';

export interface GetEmployeeSalaryAdjustmentsParams {
  page?: number;
  perPage?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  gradeId?: string[];
  hasAdjustment?: boolean;
}

export async function getEmployeeSalaryAdjustments(
  params: GetEmployeeSalaryAdjustmentsParams & { companyId?: string | null }
): Promise<ApiPaginatedResponse<EmployeeSalaryAdjustment[]>> {
  try {
    const response = await api.get<ApiPaginatedResponse<EmployeeSalaryAdjustment[]>>(
      getApiPath('/human-resource/employee-salary-adjustments/employees'),
      {
        params: {
          page: params.page ?? 1,
          perPage: params.perPage ?? 10,
          ...(params.search && { search: params.search }),
          ...(params.sortBy && {
            sortBy: params.sortBy,
            sortOrder: params.sortOrder ?? 'asc',
          }),
          ...(params.gradeId && params.gradeId.length > 0 && { gradeId: params.gradeId }),
          ...(params.hasAdjustment !== undefined && { hasAdjustment: params.hasAdjustment }),
        },
        headers: { 'x-company-id': params.companyId ?? '' },
      }
    );
    return response.data;
  } catch (error) {
    return handleApiError<EmployeeSalaryAdjustment>(error, true);
  }
}
