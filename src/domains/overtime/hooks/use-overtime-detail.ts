'use client';

import { useQuery } from '@tanstack/react-query';
import { getOvertimeDetail } from '../api/get-overtime-detail';
import { OVERTIME_QUERY_KEYS } from './use-overtimes';

export function useOvertimeDetail(id: string | null, companyId: string | null) {
  return useQuery({
    queryKey: [...OVERTIME_QUERY_KEYS.all, 'detail', id],
    queryFn: () => getOvertimeDetail(id!, companyId!),
    enabled: !!id && !!companyId,
  });
}
