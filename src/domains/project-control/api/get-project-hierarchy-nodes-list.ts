import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiPaginatedResponse } from '@/shared/types/api';
import type { BaseQueryParams } from '@/shared/types/query-params';

export interface GetProjectHierarchyNodesListParams extends BaseQueryParams {
  projectId: string;
  excludeNodeId?: string;
}

export interface ProjectHierarchyNodeListItem {
  id: string;
  positionId: string;
  position: {
    id: string;
    code: string;
    name: string;
    level: number;
    isActive: boolean;
  };
  parentId: string | null;
  isActive: boolean;
}

export type GetProjectHierarchyNodesListResponse = ApiPaginatedResponse<
  ProjectHierarchyNodeListItem[]
>;

export async function getProjectHierarchyNodesList(
  projectId: string,
  params?: Omit<GetProjectHierarchyNodesListParams, 'projectId'>
): Promise<GetProjectHierarchyNodesListResponse> {
  try {
    const { data } = await api.get<ApiPaginatedResponse<ProjectHierarchyNodeListItem[]>>(
      getApiPath(`/projects/${projectId}/hierarchy-nodes/list`),
      { params }
    );
    return data;
  } catch (error: unknown) {
    return handleApiError<ProjectHierarchyNodeListItem>(error, true);
  }
}
