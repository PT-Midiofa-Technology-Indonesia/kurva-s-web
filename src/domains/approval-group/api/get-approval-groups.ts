import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { BaseQueryParams } from '@/shared/types/query-params';
import type { ApiPaginatedResponse } from '@/types/api';
import type { ApprovalGroupListItem } from '../types';

export interface GetApprovalGroupsParams extends BaseQueryParams {
  isActive?: boolean;
}

export type GetApprovalGroupsResponse = ApiPaginatedResponse<ApprovalGroupListItem[]>;

export async function getApprovalGroups(
  params?: GetApprovalGroupsParams
): Promise<GetApprovalGroupsResponse> {
  try {
    const { data } = await api.get<ApiPaginatedResponse<ApprovalGroupListItem[]>>(
      getApiPath('/approval-groups'),
      { params }
    );
    return data;
  } catch (error: unknown) {
    return handleApiError<ApprovalGroupListItem>(error, true);
  }
}
