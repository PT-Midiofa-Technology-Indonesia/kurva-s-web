import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiSuccessResponse } from '@/shared/types/api';
import type { Billing, BillingPaymentMethod } from '../types';

// ============================================================================
// Params
// ============================================================================

export interface PayBillingParams {
  billingId: string;
  companyId: string;
  paymentMethod: BillingPaymentMethod | string;
  paidAt: string;
  amount?: number;
  transferVia?: string;
  documentTypeId?: string;
  checkNumber?: string;
  checkIssueDate?: string;
  checkEffectiveDate?: string;
  notes?: string;
  file?: File;
  files?: File[];
}

// ============================================================================
// Response
// ============================================================================

export type PayBillingResponse = ApiSuccessResponse<Billing>;

// ============================================================================
// API Function
// ============================================================================

export async function payBilling(params: PayBillingParams): Promise<PayBillingResponse> {
  try {
    const { billingId, companyId, file, files, ...payload } = params;
    const formData = new FormData();

    formData.append('paymentMethod', payload.paymentMethod);
    formData.append('paymentDate', payload.paidAt);

    if (payload.amount != null) {
      formData.append('amount', String(payload.amount));
    }

    if (payload.transferVia) {
      formData.append('transferVia', payload.transferVia);
    }

    if (payload.documentTypeId) {
      formData.append('documentTypeId', payload.documentTypeId);
    }

    if (payload.notes) {
      formData.append('notes', payload.notes);
    }

    if (payload.paymentMethod === 'check') {
      if (payload.checkNumber) {
        formData.append('checkNumber', payload.checkNumber);
      }
      if (payload.checkIssueDate) {
        formData.append('checkIssueDate', payload.checkIssueDate);
      }
      if (payload.checkEffectiveDate) {
        formData.append('checkEffectiveDate', payload.checkEffectiveDate);
      }
    }

    if (file) {
      formData.append('files[0]', file);
    }

    files?.forEach((item, index) => {
      formData.append(`files[${index}]`, item);
    });

    const { data } = await api.post<PayBillingResponse>(
      getApiPath(`/finance/billings/${billingId}/pay`),
      formData,
      {
        headers: {
          'X-Company-Id': companyId,
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return data;
  } catch (error: unknown) {
    return handleApiError(error);
  }
}
