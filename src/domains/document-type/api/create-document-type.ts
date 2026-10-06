import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiSuccessResponse } from '@/types/api';
import type { DocumentType } from '../types';

export interface CreateDocumentTypePayload {
  code: string;
  name: string;
  description?: string;
  allowedFileTypes?: string;
  allowedFileSize?: number;
  isActive: boolean;
}

export async function createDocumentType(
  payload: CreateDocumentTypePayload
): Promise<DocumentType> {
  try {
    const { data } = await api.post<ApiSuccessResponse<DocumentType>>(
      getApiPath('/document-types'),
      payload
    );
    return data.data;
  } catch (error: unknown) {
    handleApiError(error);
  }
}
