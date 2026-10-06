import axios from '@/lib/axios';
import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import type { ApiResponse } from '@/shared/types/api';
import type {
  CreateProjectHierarchyNodePayload,
  ProjectHierarchyNode,
} from '../types/project-hierarchy-node';

export async function createProjectHierarchyNode(
  payload: CreateProjectHierarchyNodePayload
): Promise<ApiResponse<ProjectHierarchyNode>> {
  try {
    const { data } = await axios.post<ApiResponse<ProjectHierarchyNode>>(
      getApiPath('/project-hierarchy-nodes'),
      payload
    );
    return data;
  } catch (error: unknown) {
    handleApiError(error);
  }
}
