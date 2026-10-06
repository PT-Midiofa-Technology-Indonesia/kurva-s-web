import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiSuccessResponse } from '@/shared/types/api';

export type DeleteDocumentResponse = ApiSuccessResponse<null>;

/**
 * Delete a document from a payment request
 * DELETE /v1/finance/payment-requests/:paymentRequestId/documents/:documentId
 */
export async function deletePaymentRequestDocument(
  paymentRequestId: string,
  documentId: string
): Promise<DeleteDocumentResponse> {
  try {
    const { data } = await api.delete<DeleteDocumentResponse>(
      getApiPath(`/finance/payment-requests/${paymentRequestId}/documents/${documentId}`)
    );

    return data;
  } catch (error: unknown) {
    return handleApiError(error);
  }
}
