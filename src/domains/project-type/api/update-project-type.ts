import { handleApiError } from '@/lib/api-error';
import { getApiPath } from '@/shared/lib/api-config';
import api from '@/shared/lib/axios';
import type { ApiSuccessResponse } from '@/types/api';
import type { ProjectType } from '../types';

export interface UpdateProjectTypePayload {
  code?: string;
  name?: string | null;
  description?: string | null;
  isActive?: boolean;
}

export async function updateProjectType(
  id: string,
  payload: UpdateProjectTypePayload
): Promise<ProjectType> {
  try {
    const { data } = await api.put<ApiSuccessResponse<ProjectType>>(
      getApiPath(`/project-types/${id}`),
      payload
    );
    return data.data;
  } catch (error: unknown) {
    handleApiError(error);
  }
}
