import { handleApiError } from '@/lib/api-error';
import { getApiPath } from '@/shared/lib/api-config';
import api from '@/shared/lib/axios';
import type { ApiSuccessResponse } from '@/types/api';
import type { ProjectCapability } from '../types';

export interface CreateProjectCapabilityPayload {
  code: string;
  name: string;
  description?: string;
  isActive: boolean;
}

export async function createProjectCapability(
  payload: CreateProjectCapabilityPayload
): Promise<ProjectCapability> {
  try {
    const { data } = await api.post<ApiSuccessResponse<ProjectCapability>>(
      getApiPath('/project-capabilities'),
      payload
    );
    return data.data;
  } catch (error: unknown) {
    handleApiError(error);
  }
}
