'use client';

import { useQuery } from '@tanstack/react-query';
import { type GetBillingsCalendarDetailParams, getBillingsCalendarDetail } from '../api';

export const BILLINGS_CALENDAR_DETAIL_QUERY_KEYS = {
  all: ['billings-calendar-detail'] as const,
  detail: (params?: GetBillingsCalendarDetailParams) =>
    [...BILLINGS_CALENDAR_DETAIL_QUERY_KEYS.all, { params }] as const,
};

export function useBillingsCalendarDetail(params?: GetBillingsCalendarDetailParams) {
  return useQuery({
    queryKey: BILLINGS_CALENDAR_DETAIL_QUERY_KEYS.detail(params),
    queryFn: () => getBillingsCalendarDetail(params!),
    enabled: !!params?.date && !!params?.companyId,
    select: (response) => response.data,
  });
}
