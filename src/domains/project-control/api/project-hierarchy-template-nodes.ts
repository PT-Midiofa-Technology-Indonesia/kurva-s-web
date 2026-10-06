import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiResponse } from '@/shared/types/api';
import type {
  CreateProjectHierarchyTemplateNodePayload,
  ProjectHierarchyTemplateNode,
  UpdateProjectHierarchyTemplateNodePayload,
} from '../types';

export async function getProjectHierarchyTemplateNodeDetail(
  nodeId: string
): Promise<ApiResponse<ProjectHierarchyTemplateNode>> {
  try {
    const { data } = await api.get<ApiResponse<ProjectHierarchyTemplateNode>>(
      getApiPath(`/project-hierarchy-template-nodes/${nodeId}`)
    );
    return data;
  } catch (error: unknown) {
    handleApiError(error);
  }
}

export async function createProjectHierarchyTemplateNode(
  payload: CreateProjectHierarchyTemplateNodePayload
): Promise<ApiResponse<ProjectHierarchyTemplateNode>> {
  try {
    const { data } = await api.post<ApiResponse<ProjectHierarchyTemplateNode>>(
      getApiPath('/project-hierarchy-template-nodes'),
      payload
    );
    return data;
  } catch (error: unknown) {
    handleApiError(error);
  }
}

export async function updateProjectHierarchyTemplateNode(
  nodeId: string,
  payload: UpdateProjectHierarchyTemplateNodePayload
): Promise<ApiResponse<ProjectHierarchyTemplateNode>> {
  try {
    const { data } = await api.put<ApiResponse<ProjectHierarchyTemplateNode>>(
      getApiPath(`/project-hierarchy-template-nodes/${nodeId}`),
      payload
    );
    return data;
  } catch (error: unknown) {
    handleApiError(error);
  }
}

export async function deleteProjectHierarchyTemplateNode(
  nodeId: string
): Promise<ApiResponse<null>> {
  try {
    const { data } = await api.delete<ApiResponse<null>>(
      getApiPath(`/project-hierarchy-template-nodes/${nodeId}`)
    );
    return data;
  } catch (error: unknown) {
    handleApiError(error);
  }
}
