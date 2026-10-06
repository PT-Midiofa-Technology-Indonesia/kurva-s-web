import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiResponse } from '@/shared/types/api';
import type { ProjectHierarchyTemplateNode } from '../types';

export async function getProjectHierarchyTemplateNodes(
  templateId: string
): Promise<ApiResponse<ProjectHierarchyTemplateNode[]>> {
  try {
    const { data } = await api.get<ApiResponse<ProjectHierarchyTemplateNode[]>>(
      getApiPath(`/project-hierarchy-templates-nodes/${templateId}`)
    );
    return data;
  } catch (error: unknown) {
    handleApiError(error);
  }
}
