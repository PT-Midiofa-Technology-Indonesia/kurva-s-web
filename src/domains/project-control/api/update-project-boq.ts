import axios from '@/lib/axios';
import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import type { ApiSuccessResponse } from '@/types/api';

export interface UpdateProjectBOQPayload {
  isRabComplete?: boolean;
  isCcoComplete?: boolean;
}

export async function updateProjectBOQ(
  projectId: string,
  boqId: string,
  payload: UpdateProjectBOQPayload
): Promise<ApiSuccessResponse<null>> {
  try {
    const response = await axios.patch<ApiSuccessResponse<null>>(
      getApiPath(`/projects/${projectId}/boq/${boqId}`),
      payload
    );
    return response.data;
  } catch (error: unknown) {
    handleApiError(error);
  }
}
