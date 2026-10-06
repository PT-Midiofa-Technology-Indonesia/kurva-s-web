import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiSuccessResponse } from '@/types/api';
import type { ProspectProjectDocumentUploadResult } from '../types';

export interface UploadProjectDocumentPayload {
  projectId: string;
  documentTypeId: string;
  file: File;
  onUploadProgress?: (progress: number) => void;
}

export type UploadProjectDocumentResponse = ApiSuccessResponse<ProspectProjectDocumentUploadResult>;

export async function uploadProjectDocument({
  projectId,
  documentTypeId,
  file,
  onUploadProgress,
}: UploadProjectDocumentPayload): Promise<ProspectProjectDocumentUploadResult> {
  try {
    const formData = new FormData();
    formData.append('documentTypeId', documentTypeId);
    formData.append('files[0]', file);

    const { data } = await api.post<UploadProjectDocumentResponse>(
      getApiPath(`/projects/${projectId}/documents`),
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
