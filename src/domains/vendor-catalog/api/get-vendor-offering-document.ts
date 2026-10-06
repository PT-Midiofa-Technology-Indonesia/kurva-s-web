import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiSuccessResponse } from '@/types/api';
import type { VendorOfferingDocument } from '../types';

export async function getVendorOfferingDocument(id: string): Promise<VendorOfferingDocument> {
  try {
    const { data } = await api.get<ApiSuccessResponse<VendorOfferingDocument>>(
      getApiPath(`/vendor-offering-documents/${id}`)
    );
    return data.data;
  } catch (error: unknown) {
    handleApiError(error);
  }
}
