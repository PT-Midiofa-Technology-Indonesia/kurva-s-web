import { getApiPath } from '@/shared/lib/api-config';
import api from '@/shared/lib/axios';
import type { ApiResponse } from '@/shared/types/api';
import type { ProjectHierarchyNode } from '../types/project-hierarchy-node';

export async function getProjectHierarchyNodes(
  projectId: string
): Promise<ApiResponse<ProjectHierarchyNode[]>> {
  const { data } = await api.get<ApiResponse<ProjectHierarchyNode[]>>(
    getApiPath(`/projects/${projectId}/hierarchy-nodes`)
  );
  return data;
}
