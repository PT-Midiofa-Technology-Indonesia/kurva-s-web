import axios from '@/lib/axios';
import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import type { ApiResponse } from '@/shared/types/api';
import type {
  ProjectHierarchyNode,
  UpdateProjectHierarchyNodePayload,
} from '../types/project-hierarchy-node';

export async function updateProjectHierarchyNode(
  nodeId: string,
  payload: UpdateProjectHierarchyNodePayload
): Promise<ApiResponse<ProjectHierarchyNode>> {
  try {
    const { data } = await axios.put<ApiResponse<ProjectHierarchyNode>>(
      getApiPath(`/project-hierarchy-nodes/${nodeId}`),
      payload
    );
    return data;
  } catch (error: unknown) {
    handleApiError(error);
  }
}
