import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiSuccessResponse } from '@/shared/types/api';

export interface UploadOfferingDocPayload {
  vendorId: string;
  title: string;
  periodStart: string;
  periodEnd: string;
  file: File;
  notes?: string;
}

export async function uploadOfferingDoc(
  draftId: string,
  payload: UploadOfferingDocPayload,
  companyId?: string
): Promise<void> {
  try {
    const formData = new FormData();
    formData.append('vendorId', payload.vendorId);
    formData.append('title', payload.title);
    formData.append('periodStart', payload.periodStart);
    formData.append('periodEnd', payload.periodEnd);
    formData.append('file', payload.file);
    if (payload.notes) formData.append('notes', payload.notes);

    await api.post<ApiSuccessResponse<void>>(
      getApiPath(`/procurement/po-drafts/${draftId}/offering-docs`),
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          ...(companyId ? { 'X-Company-Id': companyId } : {}),
        },
      }
    );
  } catch (error: unknown) {
    handleApiError(error);
    throw error;
  }
}
