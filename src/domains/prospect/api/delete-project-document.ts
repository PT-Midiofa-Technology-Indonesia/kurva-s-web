import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';

export interface DeleteProjectDocumentPayload {
  projectId: string;
  uploadedDocId: string;
}

export async function deleteProjectDocument({
  projectId,
  uploadedDocId,
}: DeleteProjectDocumentPayload): Promise<void> {
  try {
    await api.delete(getApiPath(`/projects/${projectId}/documents/${uploadedDocId}`));
  } catch (error: unknown) {
    handleApiError(error);
  }
}
