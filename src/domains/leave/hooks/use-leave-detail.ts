'use client';

import { useQuery } from '@tanstack/react-query';
import { getLeaveDetail } from '../api/get-leave-detail';

export const LEAVE_DETAIL_QUERY_KEYS = {
  all: ['leave-detail'] as const,
  detail: (id?: string | null, companyId?: string | null) =>
    [...LEAVE_DETAIL_QUERY_KEYS.all, id, companyId] as const,
};

export function useLeaveDetail(id?: string | null, companyId?: string | null) {
  return useQuery({
    queryKey: LEAVE_DETAIL_QUERY_KEYS.detail(id, companyId),
    queryFn: () => getLeaveDetail(id ?? '', companyId),
    enabled: !!id,
  });
}
