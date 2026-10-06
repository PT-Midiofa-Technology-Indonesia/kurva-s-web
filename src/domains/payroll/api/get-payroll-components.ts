import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiPaginatedResponse } from '@/shared/types/api';
import type { PayrollComponent } from '../types';

export interface GetPayrollComponentsParams {
  page?: number;
  perPage?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  category?: string;
}

export async function getPayrollComponents(
  params: GetPayrollComponentsParams & { companyId?: string | null }
): Promise<ApiPaginatedResponse<PayrollComponent[]>> {
  try {
    const response = await api.get<ApiPaginatedResponse<PayrollComponent[]>>(
      getApiPath('/human-resource/payroll-components'),
      {
        params: {
          page: params.page ?? 1,
          perPage: params.perPage ?? 10,
          ...(params.search && { search: params.search }),
          ...(params.sortBy && {
            sortBy: params.sortBy,
            sortOrder: params.sortOrder ?? 'asc',
          }),
          ...(params.category && { category: params.category }),
        },
        headers: { 'x-company-id': params.companyId ?? '' },
      }
    );
    return response.data;
  } catch (error) {
    return handleApiError<PayrollComponent>(error, true);
  }
}
