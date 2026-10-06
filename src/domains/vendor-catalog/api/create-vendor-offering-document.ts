import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiSuccessResponse } from '@/types/api';
import type { VendorOfferingDocument } from '../types';

export interface CreateVendorOfferingDocumentPayload {
  vendorId: string;
  code: string;
  title: string;
  periodStart: string;
  periodEnd: string;
  description?: string;
  isActive: boolean;
  files: File[];
  existingIds: string[];
}

export async function createVendorOfferingDocument(
  payload: CreateVendorOfferingDocumentPayload
): Promise<VendorOfferingDocument> {
  try {
    const formData = new FormData();
    formData.append('vendorId', payload.vendorId);
    formData.append('code', payload.code);
    formData.append('title', payload.title);
    formData.append('periodStart', payload.periodStart);
    formData.append('periodEnd', payload.periodEnd);
    if (payload.description) formData.append('description', payload.description);
    formData.append('isActive', payload.isActive ? '1' : '0');
    payload.files.forEach((file, index) => {
      formData.append(`files[${index}]`, file);
    });
    payload.existingIds.forEach((id) => {
      formData.append('existingIds[]', id);
    });

    const { data } = await api.post<ApiSuccessResponse<VendorOfferingDocument>>(
      getApiPath('/vendor-offering-documents'),
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
