import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiResponse } from '@/shared/types/api';

export async function deleteProjectHierarchyNode(nodeId: string): Promise<ApiResponse<null>> {
  try {
    const { data } = await api.delete<ApiResponse<null>>(
      getApiPath(`/project-hierarchy-nodes/${nodeId}`)
    );
    return data;
  } catch (error: unknown) {
    handleApiError(error);
  }
}
