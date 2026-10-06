'use client';

import { useQuery } from '@tanstack/react-query';
import { type GetCalendarParams, getCalendar } from '../api/get-calendar';

export const PAYMENT_REQUEST_CALENDAR_QUERY_KEYS = {
  all: ['payment-request-calendar'] as const,
  calendar: (params: string) => [...PAYMENT_REQUEST_CALENDAR_QUERY_KEYS.all, { params }] as const,
};

export function usePaymentRequestCalendar(params?: GetCalendarParams) {
  return useQuery({
    queryKey: PAYMENT_REQUEST_CALENDAR_QUERY_KEYS.calendar(JSON.stringify(params)),
    queryFn: () => getCalendar(params!),
    enabled: !!params?.year && !!params?.date && !!params?.companyId,
    select: (response) => {
      return response.data ?? [];
    },
  });
}
