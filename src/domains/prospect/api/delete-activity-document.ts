import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';

export interface DeleteActivityDocumentPayload {
  projectId: string;
  documentId: string;
}

export async function deleteActivityDocument({
  projectId,
  documentId,
}: DeleteActivityDocumentPayload): Promise<void> {
  try {
    await api.delete(getApiPath(`/projects/${projectId}/activities/documents/${documentId}`));
  } catch (error: unknown) {
    handleApiError(error);
  }
}
