import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { BaseQueryParams } from '@/shared/types/query-params';
import type { ApiPaginatedResponse } from '@/types/api';
import type { OfficeListItem } from '../types';

export interface GetOfficesParams extends BaseQueryParams {
  isActive?: boolean;
  companyId?: string;
}

export type GetOfficesResponse = ApiPaginatedResponse<OfficeListItem[]>;

export async function getOffices(params?: GetOfficesParams): Promise<GetOfficesResponse> {
  try {
    const { companyId, ...rest } = params ?? {};
    const { data } = await api.get<ApiPaginatedResponse<OfficeListItem[]>>(getApiPath('/offices'), {
      params: rest,
      headers: companyId ? { 'X-Company-Id': companyId } : undefined,
    });
    return data;
  } catch (error: unknown) {
    return handleApiError<OfficeListItem>(error, true);
  }
}
