import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiResponse } from '@/types/api';
import type { ProjectHierarchyTemplateFormInput } from '../types';

export interface SyncProjectHierarchyTemplatesPayload {
  items: ProjectHierarchyTemplateFormInput[];
  deletedIds: string[];
}

export async function syncProjectHierarchyTemplates(
  payload: SyncProjectHierarchyTemplatesPayload
): Promise<ApiResponse<any>> {
  try {
    const { data } = await api.post<ApiResponse<any>>(
      getApiPath('/project-hierarchy-templates/sync'),
      payload
    );
    return data;
  } catch (error: unknown) {
    return handleApiError<any>(error, true);
  }
}

export async function deleteProjectHierarchyTemplate(
  payload: SyncProjectHierarchyTemplatesPayload
): Promise<ApiResponse<any>> {
  try {
    const { data } = await api.post<ApiResponse<any>>(
      getApiPath('/project-hierarchy-templates/sync'),
      payload
    );
    return data;
  } catch (error: unknown) {
    return handleApiError<any>(error, true);
  }
}
