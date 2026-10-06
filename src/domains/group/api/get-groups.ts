import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { BaseQueryParams } from '@/shared/types/query-params';
import type { ApiPaginatedResponse } from '@/types/api';
import type { GroupListItem } from '../types';

export interface GetGroupsParams extends BaseQueryParams {
  isActive?: boolean;
}

export type GetGroupsResponse = ApiPaginatedResponse<GroupListItem[]>;

export async function getGroups(params?: GetGroupsParams): Promise<GetGroupsResponse> {
  try {
    const { data } = await api.get<ApiPaginatedResponse<GroupListItem[]>>(getApiPath('/groups'), {
      params,
    });
    return data;
  } catch (error: unknown) {
    return handleApiError<GroupListItem>(error, true);
  }
}
