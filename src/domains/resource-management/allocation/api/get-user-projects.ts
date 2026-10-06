import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiPaginatedResponse } from '@/types/api';

export interface GetUserProjectsParams {
  search?: string;
  companyId?: string;
  page?: number;
  perPage?: number;
}

export interface UserProjectItem {
  id: string;
  code: string;
  name: string;
  companyId: string;
  companyName: string;
  currentStage: string;
  projectStartDate: string;
  projectEndDate: string;
  isActive: boolean;
}

export type GetUserProjectsResponse = ApiPaginatedResponse<UserProjectItem[]>;

export async function getUserProjects(
  params?: GetUserProjectsParams
): Promise<GetUserProjectsResponse> {
  try {
    const { data } = await api.get<GetUserProjectsResponse>(getApiPath('/user-projects'), {
      params,
    });
    return data;
  } catch (error: unknown) {
    return handleApiError<UserProjectItem>(error, true);
  }
}
