'use client';

import { useQuery } from '@tanstack/react-query';
import { type GetBillingsCalendarParams, getBillingsCalendar } from '../api';

export const BILLINGS_CALENDAR_QUERY_KEYS = {
  all: ['billings-calendar'] as const,
  calendar: (params?: GetBillingsCalendarParams) =>
    [...BILLINGS_CALENDAR_QUERY_KEYS.all, { params }] as const,
};

export function useBillingsCalendar(params?: GetBillingsCalendarParams) {
  return useQuery({
    queryKey: BILLINGS_CALENDAR_QUERY_KEYS.calendar(params),
    queryFn: () => getBillingsCalendar(params!),
    enabled: !!params?.year && !!params?.date && !!params?.companyId,
    select: (response) => response.data ?? [],
  });
}
