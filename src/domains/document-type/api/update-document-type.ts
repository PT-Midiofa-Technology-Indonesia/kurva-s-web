import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiSuccessResponse } from '@/types/api';
import type { DocumentType } from '../types';

export interface UpdateDocumentTypePayload {
  code?: string;
  name?: string;
  description?: string;
  allowedFileTypes?: string;
  allowedFileSize?: number;
  isActive?: boolean;
}

export async function updateDocumentType(
  id: string,
  payload: UpdateDocumentTypePayload
): Promise<DocumentType> {
  try {
    const { data } = await api.put<ApiSuccessResponse<DocumentType>>(
      getApiPath(`/document-types/${id}`),
      payload
    );
    return data.data;
  } catch (error: unknown) {
    handleApiError(error);
  }
}
