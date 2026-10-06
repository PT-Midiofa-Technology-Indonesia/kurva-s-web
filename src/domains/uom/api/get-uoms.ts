import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { BaseQueryParams } from '@/shared/types/query-params';
import type { ApiPaginatedResponse } from '@/types/api';
import type { UomListItem } from '../types';

export interface GetUomsParams extends BaseQueryParams {
  isActive?: boolean;
  group?: string;
  groupType?: string;
}

export type GetUomsResponse = ApiPaginatedResponse<UomListItem[]>;

export async function getUoms(params?: GetUomsParams): Promise<GetUomsResponse> {
  try {
    const { data } = await api.get<ApiPaginatedResponse<UomListItem[]>>(getApiPath('/uoms'), {
      params,
    });
    return data;
  } catch (error: unknown) {
    return handleApiError<UomListItem>(error, true);
  }
}
