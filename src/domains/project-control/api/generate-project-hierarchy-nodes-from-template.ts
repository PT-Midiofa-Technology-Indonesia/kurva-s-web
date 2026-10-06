import { getApiPath } from '@/shared/lib/api-config';
import api from '@/shared/lib/axios';
import type { ApiResponse } from '@/shared/types/api';

export interface GenerateFromTemplatePayload {
  projectId: string;
  templateId: string;
}

export interface GenerateFromTemplateResponse {
  projectId: string;
}

export async function generateProjectHierarchyNodesFromTemplate(
  payload: GenerateFromTemplatePayload
): Promise<ApiResponse<GenerateFromTemplateResponse>> {
  const response = await api.post<ApiSuccessResponseData>(
    getApiPath('/project-hierarchy-nodes/generate-from-template'),
    payload
  );
  return response.data as ApiResponse<GenerateFromTemplateResponse>;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ApiSuccessResponseData = { success: boolean; message: string; data: any };
