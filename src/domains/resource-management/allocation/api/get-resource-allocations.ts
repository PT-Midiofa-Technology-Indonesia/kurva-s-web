import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { BaseQueryParams } from '@/shared/types/query-params';
import type { ApiPaginatedResponse } from '@/types/api';
import type { ResourceAllocationListItem } from '../types';

export interface GetResourceAllocationsParams extends BaseQueryParams {
  search?: string;
  projectId?: string;
}

export type GetResourceAllocationsResponse = ApiPaginatedResponse<ResourceAllocationListItem[]>;

export async function getResourceAllocations(
  params?: GetResourceAllocationsParams,
  projectId?: string
): Promise<GetResourceAllocationsResponse> {
  const effectiveProjectId = projectId ?? params?.projectId;
  try {
    const { data } = await api.get<GetResourceAllocationsResponse>(
      getApiPath('/resource-allocations'),
      {
        params,
        headers: { 'X-Project-Id': effectiveProjectId! },
      }
    );
    return data;
  } catch (error: unknown) {
    return handleApiError<ResourceAllocationListItem>(error, true);
  }
}
