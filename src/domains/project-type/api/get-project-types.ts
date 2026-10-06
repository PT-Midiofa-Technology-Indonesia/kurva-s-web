import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { BaseQueryParams } from '@/shared/types/query-params';
import type { ApiPaginatedResponse } from '@/types/api';
import type { ProjectTypeListItem } from '../types';

export interface GetProjectTypesParams extends BaseQueryParams {
  isActive?: boolean;
  itemType?: string;
  itemCategory?: string;
}

export type GetProjectTypesResponse = ApiPaginatedResponse<ProjectTypeListItem[]>;

export async function getProjectTypes(
  params?: GetProjectTypesParams
): Promise<GetProjectTypesResponse> {
  try {
    const { data } = await api.get<ApiPaginatedResponse<ProjectTypeListItem[]>>(
      getApiPath('/project-types'),
      { params }
    );
    return data;
  } catch (error: unknown) {
    return handleApiError<ProjectTypeListItem>(error, true);
  }
}
