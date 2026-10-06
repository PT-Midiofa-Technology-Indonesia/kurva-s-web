import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { BaseQueryParams } from '@/shared/types/query-params';
import type { ApiPaginatedResponse } from '@/types/api';
import type { ProjectCapabilityListItem } from '../types';

export interface GetProjectCapabilitiesParams extends BaseQueryParams {
  isActive?: boolean;
}

export type GetProjectCapabilitiesResponse = ApiPaginatedResponse<ProjectCapabilityListItem[]>;

export async function getProjectCapabilities(
  params?: GetProjectCapabilitiesParams
): Promise<GetProjectCapabilitiesResponse> {
  try {
    const { data } = await api.get<ApiPaginatedResponse<ProjectCapabilityListItem[]>>(
      getApiPath('/project-capabilities'),
      { params }
    );
    return data;
  } catch (error: unknown) {
    return handleApiError<ProjectCapabilityListItem>(error, true);
  }
}
