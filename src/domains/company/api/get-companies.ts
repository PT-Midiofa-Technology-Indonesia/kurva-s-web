import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { BaseQueryParams } from '@/shared/types/query-params';
import type { ApiPaginatedResponse } from '@/types/api';
import type { CompanyListItem } from '../types';

export interface GetCompaniesParams extends BaseQueryParams {
  isActive?: boolean;
}

export type GetCompaniesResponse = ApiPaginatedResponse<CompanyListItem[]>;

export async function getCompanies(params?: GetCompaniesParams): Promise<GetCompaniesResponse> {
  try {
    const { data } = await api.get<ApiPaginatedResponse<CompanyListItem[]>>(
      getApiPath('/companies'),
      { params }
    );
    return data;
  } catch (error: unknown) {
    return handleApiError<CompanyListItem>(error, true);
  }
}
