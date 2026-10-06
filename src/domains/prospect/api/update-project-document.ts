import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiSuccessResponse } from '@/types/api';
import type { ProspectProjectDocumentUploadResult } from '../types';

export interface UpdateProjectDocumentPayload {
  projectId: string;
  uploadedDocId: string;
  file: File;
  onUploadProgress?: (progress: number) => void;
}

export type UpdateProjectDocumentResponse = ApiSuccessResponse<ProspectProjectDocumentUploadResult>;

export async function updateProjectDocument({
  projectId,
  uploadedDocId,
  file,
  onUploadProgress,
}: UpdateProjectDocumentPayload): Promise<ProspectProjectDocumentUploadResult> {
  try {
    const formData = new FormData();
    formData.append('files[0]', file);

    const { data } = await api.post<UpdateProjectDocumentResponse>(
      getApiPath(`/projects/${projectId}/documents/${uploadedDocId}`),
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (event) => {
          if (onUploadProgress && event.total) {
            onUploadProgress(Math.round((event.loaded * 100) / event.total));
          }
        },
      }
    );
    return data.data;
  } catch (error: unknown) {
    handleApiError(error);
  }
}
