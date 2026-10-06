import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiPaginatedResponse } from '@/shared/types/api';
import type { BaseQueryParams } from '@/shared/types/query-params';
import type { PaymentRequest, PaymentRequestSummary } from '../types';

export interface PaymentRequestsPayload {
  summary?: PaymentRequestSummary;
  items: PaymentRequest[];
}

export type PaymentRequestsData = PaymentRequestsPayload | PaymentRequest[];

// ============================================================================
// Params
// ============================================================================

export interface GetPaymentRequestsParams extends BaseQueryParams {
  sourceType?: string;
  status?: string;
  companyId?: string;
  startDate?: string;
  endDate?: string;
}

// ============================================================================
// Response
// ============================================================================

export type GetPaymentRequestsResponse = Omit<ApiPaginatedResponse<PaymentRequestsData>, 'data'> & {
  data: PaymentRequestsData;
};

// ============================================================================
// API Function
// ============================================================================

export async function getPaymentRequests(
  params?: GetPaymentRequestsParams
): Promise<GetPaymentRequestsResponse> {
  try {
    const headers = params?.companyId ? { 'X-Company-Id': params.companyId } : undefined;

    const { data } = await api.get<GetPaymentRequestsResponse>(
      getApiPath('/finance/payment-requests'),
      {
        params,
        headers,
      }
    );

    return data;
  } catch (error: unknown) {
    return handleApiError<PaymentRequest>(error, true);
  }
}
