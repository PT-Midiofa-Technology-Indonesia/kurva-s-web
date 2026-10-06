import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiSuccessResponse } from '@/shared/types/api';

export interface PayPaymentRequestPayload {
  amount: number;
  paymentDate: string;
  paymentMethod: string;
  transferVia?: string;
  checkNumber?: string;
  checkIssueDate?: string;
  checkEffectiveDate?: string;
  notes?: string;
  documentTypeId?: string;
  file?: File;
}

export type PayPaymentRequestResponse = ApiSuccessResponse<null>;

/**
 * Process payment for a payment request
 * POST /v1/finance/payment-requests/:id/pay
 */
export async function payPaymentRequest(
  paymentRequestId: string,
  payload: PayPaymentRequestPayload
): Promise<PayPaymentRequestResponse> {
  try {
    const formData = new FormData();
    formData.append('amount', String(payload.amount));
    formData.append('paymentDate', payload.paymentDate);
    formData.append('paymentMethod', payload.paymentMethod);
    if (payload.transferVia) formData.append('transferVia', payload.transferVia);
    if (payload.checkNumber) formData.append('checkNumber', payload.checkNumber);
    if (payload.checkIssueDate) formData.append('checkIssueDate', payload.checkIssueDate);
    if (payload.checkEffectiveDate)
      formData.append('checkEffectiveDate', payload.checkEffectiveDate);
    if (payload.notes) formData.append('notes', payload.notes);
    if (payload.documentTypeId) formData.append('documentTypeId', payload.documentTypeId);
    if (payload.file) formData.append('files[0]', payload.file);

    const { data } = await api.post<PayPaymentRequestResponse>(
      getApiPath(`/finance/payment-requests/${paymentRequestId}/pay`),
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return data;
  } catch (error: unknown) {
    return handleApiError(error);
  }
}
