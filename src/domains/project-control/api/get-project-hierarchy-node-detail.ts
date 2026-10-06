import axios from '@/lib/axios';
import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import type { ApiResponse } from '@/shared/types/api';
import type { ProjectHierarchyNode } from '../types/project-hierarchy-node';

export async function getProjectHierarchyNodeDetail(
  nodeId: string
): Promise<ApiResponse<ProjectHierarchyNode>> {
  try {
    const { data } = await axios.get<ApiResponse<ProjectHierarchyNode>>(
      getApiPath(`/project-hierarchy-nodes/${nodeId}`)
    );
    return data;
  } catch (error: unknown) {
    handleApiError(error);
  }
}
