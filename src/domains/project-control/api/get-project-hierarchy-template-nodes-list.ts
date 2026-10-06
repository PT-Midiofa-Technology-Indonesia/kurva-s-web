import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiPaginatedResponse } from '@/shared/types/api';
import type { BaseQueryParams } from '@/shared/types/query-params';

export interface GetProjectHierarchyTemplateNodesListParams extends BaseQueryParams {
  templateId: string;
}

export interface ProjectHierarchyTemplateNodeListItem {
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

export type GetProjectHierarchyTemplateNodesListResponse = ApiPaginatedResponse<
  ProjectHierarchyTemplateNodeListItem[]
>;

export async function getProjectHierarchyTemplateNodesList(
  templateId: string,
  params?: Omit<GetProjectHierarchyTemplateNodesListParams, 'templateId'>
): Promise<GetProjectHierarchyTemplateNodesListResponse> {
  try {
    const { data } = await api.get<ApiPaginatedResponse<ProjectHierarchyTemplateNodeListItem[]>>(
      getApiPath(`/project-hierarchy-template-nodes/${templateId}/list`),
      { params }
    );
    return data;
  } catch (error: unknown) {
    return handleApiError<ProjectHierarchyTemplateNodeListItem>(error, true);
  }
}
