import axios from '@/lib/axios';
import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import type { ApiSuccessResponse } from '@/types/api';

export async function startProjectExecution(projectId: string): Promise<void> {
  try {
    await axios.post<ApiSuccessResponse<null>>(getApiPath(`/projects/${projectId}/start`));
  } catch (error: unknown) {
    handleApiError(error);
  }
}
