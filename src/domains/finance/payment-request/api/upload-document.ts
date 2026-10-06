import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiSuccessResponse } from '@/shared/types/api';
import type { PaymentRequestDocument } from '../types';

export type UploadDocumentResponse = ApiSuccessResponse<PaymentRequestDocument>;

export interface UploadDocumentPayload {
  paymentRequestId: string;
  documentTypeId: string;
  file: File;
  onUploadProgress?: (progress: number) => void;
}

/**
 * Upload document for a payment request
 * POST /v1/finance/payment-requests/:id/documents
 */
export async function uploadPaymentRequestDocument({
  paymentRequestId,
  documentTypeId,
  file,
  onUploadProgress,
}: UploadDocumentPayload): Promise<UploadDocumentResponse> {
  try {
    const formData = new FormData();
    formData.append('documentTypeId', documentTypeId);
    formData.append('files[0]', file);

    const { data } = await api.post<UploadDocumentResponse>(
      getApiPath(`/finance/payment-requests/${paymentRequestId}/documents`),
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (event) => {
          if (onUploadProgress && event.total) {
            onUploadProgress(Math.round((event.loaded * 100) / event.total));
          }
        },
      }
    );

    return data;
  } catch (error: unknown) {
    return handleApiError(error);
  }
}
