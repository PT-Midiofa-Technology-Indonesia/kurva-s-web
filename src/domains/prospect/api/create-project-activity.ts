import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiSuccessResponse } from '@/types/api';
import type { ProjectActivityCreated } from '../types';

export interface CreateProjectActivityPayload {
  projectId: string;
  description: string;
}

export type CreateProjectActivityResponse = ApiSuccessResponse<ProjectActivityCreated>;

export async function createProjectActivity({
  projectId,
  description,
}: CreateProjectActivityPayload): Promise<ProjectActivityCreated> {
  try {
    const { data } = await api.post<CreateProjectActivityResponse>(
      getApiPath(`/projects/${projectId}/activities`),
      { description }
    );
    return data.data;
  } catch (error: unknown) {
    handleApiError(error);
  }
}
