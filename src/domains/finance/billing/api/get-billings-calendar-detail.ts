import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiSuccessResponse } from '@/shared/types/api';
import type { BillingCalendarDetail } from '../types';

// ============================================================================
// Params
// ============================================================================

export interface GetBillingsCalendarDetailParams {
  date: string;
  companyId?: string;
}

// ============================================================================
// Response
// ============================================================================

export type GetBillingsCalendarDetailResponse = ApiSuccessResponse<BillingCalendarDetail>;

// ============================================================================
// API Function
// ============================================================================

export async function getBillingsCalendarDetail(
  params: GetBillingsCalendarDetailParams
): Promise<GetBillingsCalendarDetailResponse> {
  try {
    const { date, companyId } = params;
    const headers = companyId ? { 'X-Company-Id': companyId } : undefined;

    const { data } = await api.get<GetBillingsCalendarDetailResponse>(
      getApiPath(`/finance/billings/calendar/${date}`),
      {
        headers,
      }
    );

    return data;
  } catch (error: unknown) {
    return handleApiError(error);
  }
}
