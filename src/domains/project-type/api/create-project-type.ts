import { handleApiError } from '@/lib/api-error';
import { getApiPath } from '@/shared/lib/api-config';
import api from '@/shared/lib/axios';
import type { ApiSuccessResponse } from '@/types/api';
import type { ProjectType } from '../types';

export interface CreateProjectTypePayload {
  code: string;
  name: string;
  description?: string;
  isActive: boolean;
}

export async function createProjectType(payload: CreateProjectTypePayload): Promise<ProjectType> {
  try {
    const { data } = await api.post<ApiSuccessResponse<ProjectType>>(
      getApiPath('/project-types'),
      payload
    );
    return data.data;
  } catch (error: unknown) {
    handleApiError(error);
  }
}
