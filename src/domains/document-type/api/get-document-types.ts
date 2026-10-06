import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { BaseQueryParams } from '@/shared/types/query-params';
import type { ApiPaginatedResponse } from '@/types/api';
import type { DocumentTypeListItem } from '../types';

export interface GetDocumentTypesParams extends BaseQueryParams {
  isActive?: boolean;
  groupId?: string;
  rootOnly?: boolean;
}

export type GetDocumentTypesResponse = ApiPaginatedResponse<DocumentTypeListItem[]>;

export async function getDocumentTypes(
  params?: GetDocumentTypesParams
): Promise<GetDocumentTypesResponse> {
  try {
    const { data } = await api.get<ApiPaginatedResponse<DocumentTypeListItem[]>>(
      getApiPath('/document-types'),
      { params }
    );
    return data;
  } catch (error: unknown) {
    return handleApiError<DocumentTypeListItem>(error, true);
  }
}
