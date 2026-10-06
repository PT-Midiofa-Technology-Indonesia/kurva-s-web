import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiSuccessResponse } from '@/types/api';
import type { ActivityDocumentItem } from '../types';

export interface UploadActivityDocumentPayload {
  projectId: string;
  file: File;
  onUploadProgress?: (progress: number) => void;
}

export async function uploadActivityDocument({
  projectId,
  file,
  onUploadProgress,
}: UploadActivityDocumentPayload): Promise<ActivityDocumentItem> {
  try {
    const formData = new FormData();
    formData.append('files[0]', file);

    const { data } = await api.post<ApiSuccessResponse<ActivityDocumentItem>>(
      getApiPath(`/projects/${projectId}/activities/documents`),
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
