import axios from '@/lib/axios';
import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import type { ApiSuccessResponse } from '@/types/api';
import type { ProjectBOData } from './get-project-boq';

export interface GenerateBOQPayload {
  boqTemplateId: string;
}

export async function generateProjectBOQ(
  projectId: string,
  payload: GenerateBOQPayload
): Promise<ProjectBOData> {
  try {
    const response = await axios.post<ApiSuccessResponse<ProjectBOData>>(
      getApiPath(`/projects/${projectId}/boq/generate`),
      payload
    );
    return response.data.data;
  } catch (error: unknown) {
    handleApiError(error);
  }
}
