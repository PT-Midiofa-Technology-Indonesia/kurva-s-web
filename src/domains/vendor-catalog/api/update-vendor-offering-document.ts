import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiSuccessResponse } from '@/types/api';
import type { VendorOfferingDocument } from '../types';

export interface UpdateVendorOfferingDocumentPayload {
  vendorId?: string;
  code?: string;
  title?: string;
  periodStart?: string;
  periodEnd?: string;
  description?: string;
  isActive?: boolean;
  files?: File[];
  existingIds?: string[];
}

export async function updateVendorOfferingDocument(
  id: string,
  payload: UpdateVendorOfferingDocumentPayload
): Promise<VendorOfferingDocument> {
  try {
    const formData = new FormData();
    if (payload.vendorId !== undefined) formData.append('vendorId', payload.vendorId);
    if (payload.code !== undefined) formData.append('code', payload.code);
    if (payload.title !== undefined) formData.append('title', payload.title);
    if (payload.periodStart !== undefined) formData.append('periodStart', payload.periodStart);
    if (payload.periodEnd !== undefined) formData.append('periodEnd', payload.periodEnd);
    if (payload.description !== undefined) formData.append('description', payload.description);
    if (payload.isActive !== undefined) formData.append('isActive', payload.isActive ? '1' : '0');
    payload.files?.forEach((file, index) => {
      formData.append(`files[${index}]`, file);
    });
    payload.existingIds?.forEach((id) => {
      formData.append('existingIds[]', id);
    });
    formData.append('_method', 'PUT');

    const { data } = await api.post<ApiSuccessResponse<VendorOfferingDocument>>(
      getApiPath(`/vendor-offering-documents/${id}`),
      formData,
      {
        headers: { 'Content-Type': undefined },
      }
    );
    return data.data;
  } catch (error: unknown) {
    handleApiError(error);
  }
}
