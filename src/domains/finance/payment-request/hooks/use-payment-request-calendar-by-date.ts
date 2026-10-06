'use client';

import { useQuery } from '@tanstack/react-query';
import { getCalendarByDate } from '../api/get-calendar-by-date';

export const PAYMENT_REQUEST_CALENDAR_BY_DATE_QUERY_KEYS = {
  all: ['payment-request-calendar-by-date'] as const,
  detail: (date: string, companyId?: string) =>
    [...PAYMENT_REQUEST_CALENDAR_BY_DATE_QUERY_KEYS.all, date, companyId] as const,
};

export function usePaymentRequestCalendarByDate(date: string | null, companyId?: string) {
  return useQuery({
    queryKey: PAYMENT_REQUEST_CALENDAR_BY_DATE_QUERY_KEYS.detail(date ?? '', companyId),
    queryFn: () => getCalendarByDate(date!, companyId),
    enabled: !!date,
  });
}
