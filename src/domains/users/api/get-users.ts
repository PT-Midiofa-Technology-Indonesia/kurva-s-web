import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { BaseQueryParams } from '@/shared/types/query-params';
import type { ApiPaginatedResponse } from '@/types/api';
import type { UserListItem } from '../types';

export interface GetUsersParams extends BaseQueryParams {
  status?: 'active' | 'inactive';
  roleId?: string;
  userType?: string;
  bagian?: string;
}

export type GetUsersResponse = ApiPaginatedResponse<UserListItem[]>;

export async function getUsers(params?: GetUsersParams): Promise<GetUsersResponse> {
  try {
    const { data } = await api.get<ApiPaginatedResponse<UserListItem[]>>(getApiPath('/users'), {
      params,
    });
    return data;
  } catch (error: unknown) {
    return handleApiError<UserListItem>(error, true);
  }
}
