import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiSuccessResponse } from '@/shared/types/api';
import type { BillingCalendarDay, BillingStatus } from '../types';

// ============================================================================
// Params
// ============================================================================

export interface GetBillingsCalendarParams {
  year: number;
  date: number;
  companyId: string;
  status?: BillingStatus | string;
}

// ============================================================================
// Response
// ============================================================================

export type GetBillingsCalendarResponse = ApiSuccessResponse<BillingCalendarDay[]>;

// ============================================================================
// API Function
// ============================================================================

export async function getBillingsCalendar(
  params: GetBillingsCalendarParams
): Promise<GetBillingsCalendarResponse> {
  try {
    const { companyId, year, date, status } = params;

    const { data } = await api.get<GetBillingsCalendarResponse>(
      getApiPath('/finance/billings/calendar'),
      {
        params: {
          year,
          date,
          ...(status ? { status } : {}),
        },
        headers: { 'X-Company-Id': companyId },
      }
    );

    return data;
  } catch (error: unknown) {
    return handleApiError<BillingCalendarDay>(error, true);
  }
}
