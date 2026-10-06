import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiPaginatedResponse } from '@/shared/types/api';
import type { SalaryStructureGrade } from '../types';

export interface GetSalaryStructureGradesParams {
  page?: number;
  perPage?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export async function getSalaryStructureGrades(
  params: GetSalaryStructureGradesParams
): Promise<ApiPaginatedResponse<SalaryStructureGrade[]>> {
  try {
    const response = await api.get<ApiPaginatedResponse<SalaryStructureGrade[]>>(
      getApiPath('/human-resource/salary-structures/grades'),
      {
        params: {
          page: params.page ?? 1,
          perPage: params.perPage ?? 10,
          ...(params.search && { search: params.search }),
          ...(params.sortBy && {
            sortBy: params.sortBy,
            sortOrder: params.sortOrder ?? 'asc',
          }),
        },
      }
    );
    return response.data;
  } catch (error) {
    return handleApiError<SalaryStructureGrade>(error, true);
  }
}
