import { handleApiError } from '@/lib/api-error';
import { getApiPath } from '@/shared/lib/api-config';
import api from '@/shared/lib/axios';
import type { ApiResponse } from '@/types/api';
import type { ProjectType } from '../types';

export type GetProjectTypeResponse = ApiResponse<ProjectType>;

export async function getProjectType(id: string): Promise<GetProjectTypeResponse | null> {
  try {
    const { data } = await api.get<ApiResponse<ProjectType>>(getApiPath(`/project-types/${id}`));
    return data;
  } catch (error: unknown) {
    if ((error as { response?: { status?: number } })?.response?.status === 404) {
      return null;
    }
    handleApiError(error);
  }
}
