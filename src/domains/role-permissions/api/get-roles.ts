import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { BaseQueryParams } from '@/shared/types/query-params';
import type { ApiPaginatedResponse } from '@/types/api';
import type { Role } from '../types';

export interface GetRolesParams extends BaseQueryParams {
  isActive?: boolean;
}

export type GetRolesResponse = ApiPaginatedResponse<Role[]>;

export async function getRoles(params?: GetRolesParams): Promise<GetRolesResponse> {
  try {
    const { data } = await api.get<ApiPaginatedResponse<Role[]>>(getApiPath('/roles'), { params });
    return data;
  } catch (error: unknown) {
    return handleApiError<Role>(error, true);
  }
}
