import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { BaseQueryParams } from '@/shared/types/query-params';
import type { ApiPaginatedResponse } from '@/types/api';
import type { HierarchyManagementListItem } from '../types';

export interface GetHierarchyManagementsParams extends BaseQueryParams {
  isActive?: boolean;
  companyId?: string;
}

export type GetHierarchyManagementsResponse = ApiPaginatedResponse<HierarchyManagementListItem[]>;

export async function getHierarchyManagements(
  params?: GetHierarchyManagementsParams
): Promise<GetHierarchyManagementsResponse> {
  try {
    const headers = params?.companyId ? { 'X-Company-Id': params.companyId } : undefined;
    const { data } = await api.get<GetHierarchyManagementsResponse>(
      getApiPath('/company-positions/list'),
      { params: { ...params, load: 'parent' }, headers }
    );
    return data;
  } catch (error: unknown) {
    return handleApiError<HierarchyManagementListItem>(error, true);
  }
}
