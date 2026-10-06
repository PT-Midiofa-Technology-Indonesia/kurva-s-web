import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiPaginatedResponse } from '@/shared/types';
import type { GetProjectsParams, Project } from '../types';

export type { GetProjectsParams } from '../types';

export async function getProjects(
  params?: GetProjectsParams
): Promise<ApiPaginatedResponse<Project[]>> {
  try {
    const companyId = params?.companyId;
    const headers = companyId ? { 'X-Company-Id': companyId } : undefined;
    const { companyId: _, ...queryParams } = params || {};
    const { data } = await api.get<ApiPaginatedResponse<Project[]>>(getApiPath('/projects'), {
      params: queryParams,
      headers,
    });
    return data;
  } catch (error: unknown) {
    return handleApiError<Project>(error, true);
  }
}
