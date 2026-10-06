import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiResponse } from '@/types/api';
import type { DocumentType } from '../types';

export type GetDocumentTypeResponse = ApiResponse<DocumentType>;

export async function getDocumentType(id: string): Promise<GetDocumentTypeResponse | null> {
  try {
    const { data } = await api.get<ApiResponse<DocumentType>>(getApiPath(`/document-types/${id}`));
    return data;
  } catch (error: unknown) {
    if ((error as { response?: { status?: number } })?.response?.status === 404) {
      return null;
    }
    handleApiError(error);
  }
}
