import axios from '@/lib/axios';
import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';

export async function cancelProject(projectId: string): Promise<void> {
  try {
    const response = await axios.post(getApiPath(`/projects/${projectId}/cancel`));
    return response.data.data;
  } catch (error: unknown) {
    handleApiError(error);
  }
}
