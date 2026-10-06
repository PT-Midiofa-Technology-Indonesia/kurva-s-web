import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import { api } from '@/shared/lib/axios';
import type { ApiPaginatedResponse } from '@/types/api';
import type { JobItemTypeListItem } from '../types';

export interface GetJobItemTypesParams {
  page?: number;
  perPage?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
  isActive?: boolean;
}

export async function getJobItemTypes(
  params?: GetJobItemTypesParams
): Promise<ApiPaginatedResponse<JobItemTypeListItem>> {
  try {
    const { data } = await api.get<ApiPaginatedResponse<JobItemTypeListItem>>(
      getApiPath('/job-item-types'),
      { params }
    );
    return data;
  } catch (error) {
    return handleApiError<JobItemTypeListItem>(error, true);
  }
}
