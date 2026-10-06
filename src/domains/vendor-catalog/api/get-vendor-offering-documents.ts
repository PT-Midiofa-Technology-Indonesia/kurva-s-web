import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { BaseQueryParams } from '@/shared/types/query-params';
import type { ApiPaginatedResponse } from '@/types/api';
import type { VendorOfferingDocumentListItem } from '../types';

export interface GetVendorOfferingDocumentsParams extends BaseQueryParams {
  vendorId?: string;
  isActive?: boolean;
}

export type GetVendorOfferingDocumentsResponse = ApiPaginatedResponse<
  VendorOfferingDocumentListItem[]
>;

export async function getVendorOfferingDocuments(
  params?: GetVendorOfferingDocumentsParams
): Promise<GetVendorOfferingDocumentsResponse> {
  try {
    const { data } = await api.get<GetVendorOfferingDocumentsResponse>(
      getApiPath('/vendor-offering-documents'),
      { params }
    );
    return data;
  } catch (error: unknown) {
    return handleApiError<VendorOfferingDocumentListItem>(error, true);
  }
}
