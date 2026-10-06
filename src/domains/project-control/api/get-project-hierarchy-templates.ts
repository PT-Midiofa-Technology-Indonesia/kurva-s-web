import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiPaginatedResponse, ApiResponse } from '@/shared/types/api';
import type { BaseQueryParams } from '@/shared/types/query-params';
import type { ProjectHierarchyTemplateDetail, ProjectHierarchyTemplateListItem } from '../types';

export interface GetProjectHierarchyTemplatesParams extends BaseQueryParams {
  isActive?: boolean;
}

export type GetProjectHierarchyTemplatesResponse =
  ApiPaginatedResponse<ProjectHierarchyTemplateListItem>;

export async function getProjectHierarchyTemplates(
  params?: GetProjectHierarchyTemplatesParams
): Promise<GetProjectHierarchyTemplatesResponse> {
  try {
    const { data } = await api.get<ApiPaginatedResponse<ProjectHierarchyTemplateListItem>>(
      getApiPath('/project-hierarchy-templates'),
      { params }
    );
    return data;
  } catch (error: unknown) {
    return handleApiError<ProjectHierarchyTemplateListItem>(error, true);
  }
}

export async function getProjectHierarchyTemplateDetail(
  id: string
): Promise<ApiResponse<ProjectHierarchyTemplateDetail>> {
  try {
    const { data } = await api.get<ApiResponse<ProjectHierarchyTemplateDetail>>(
      getApiPath(`/project-hierarchy-templates/${id}`)
    );
    return data;
  } catch (error: unknown) {
    handleApiError(error);
  }
}
