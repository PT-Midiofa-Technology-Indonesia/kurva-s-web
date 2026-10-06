import { handleApiError } from '@/lib/api-error';
import { getApiPath } from '@/shared/lib/api-config';
import api from '@/shared/lib/axios';
import type { ApiSuccessResponse } from '@/types/api';
import type { ProjectCapability } from '../types';

export interface UpdateProjectCapabilityPayload {
  code?: string;
  name?: string | null;
  description?: string | null;
  isActive?: boolean;
}

export async function updateProjectCapability(
  id: string,
  payload: UpdateProjectCapabilityPayload
): Promise<ProjectCapability> {
  try {
    const { data } = await api.put<ApiSuccessResponse<ProjectCapability>>(
      getApiPath(`/project-capabilities/${id}`),
      payload
    );
    return data.data;
  } catch (error: unknown) {
    handleApiError(error);
  }
}
