import axios from '@/lib/axios';
import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import type { ApiSuccessResponse } from '@/types/api';
import type { ProjectBOData } from './get-project-boq';

export async function createProjectBOQ(projectId: string): Promise<ProjectBOData> {
  try {
    const response = await axios.post<ApiSuccessResponse<ProjectBOData>>(
      getApiPath(`/projects/${projectId}/boq`)
    );
    return response.data.data;
  } catch (error: unknown) {
    handleApiError(error);
  }
}
