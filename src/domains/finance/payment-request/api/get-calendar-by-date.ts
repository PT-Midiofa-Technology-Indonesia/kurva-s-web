import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiSuccessResponse } from '@/shared/types/api';
import type { CalendarDay } from './get-calendar';

// ============================================================================
// Response
// ============================================================================

export type GetCalendarByDateResponse = ApiSuccessResponse<CalendarDay>;

// ============================================================================
// API Function — GET /finance/payment-requests/calendar/:date
// ============================================================================

export async function getCalendarByDate(
  date: string,
  companyId?: string
): Promise<GetCalendarByDateResponse> {
  try {
    const headers = companyId ? { 'X-Company-Id': companyId } : undefined;

    const { data } = await api.get<GetCalendarByDateResponse>(
      getApiPath(`/finance/payment-requests/calendar/${date}`),
      { headers }
    );

    return data;
  } catch (error: unknown) {
    return handleApiError(error);
  }
}
