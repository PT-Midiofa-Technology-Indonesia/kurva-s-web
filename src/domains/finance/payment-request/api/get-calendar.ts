import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiSuccessResponse } from '@/shared/types/api';
import type { PaymentRequestStatus } from '../types';

// ============================================================================
// Params
// ============================================================================

export interface GetCalendarParams {
  year: number;
  date: number;
  status?: string;
  companyId?: string;
}

// ============================================================================
// Types
// ============================================================================

export interface CalendarStatusCounts {
  pending: number;
  partialPaid: number;
  paid: number;
  cancelled: number;
}

export interface CalendarDayItem {
  id: string;
  code: string;
  sourceType: string;
  sourceTypeLabel: string;
  sourceId: string;
  companyId: string;
  companyName: string;
  dueDate: string;
  amount: number;
  paidAmount: number;
  remainingAmount: number;
  status: PaymentRequestStatus;
  statusLabel: string;
}

export interface CalendarDay {
  date: string;
  totalCount: number;
  totalAmount: number;
  totalPaidAmount: number;
  totalRemainingAmount: number;
  statusCounts: CalendarStatusCounts;
  items: CalendarDayItem[];
}

// ============================================================================
// API Function — GET /finance/payment-requests/calendar
// ============================================================================

export type GetCalendarResponse = ApiSuccessResponse<CalendarDay[]>;

export async function getCalendar(params: GetCalendarParams): Promise<GetCalendarResponse> {
  try {
    const headers = params.companyId ? { 'X-Company-Id': params.companyId } : undefined;

    const { data } = await api.get<GetCalendarResponse>(
      getApiPath('/finance/payment-requests/calendar'),
      {
        params: {
          year: params.year,
          date: params.date,
          ...(params.status ? { status: params.status } : {}),
        },
        headers,
      }
    );

    return data;
  } catch (error: unknown) {
    return handleApiError<CalendarDay>(error, true);
  }
}
