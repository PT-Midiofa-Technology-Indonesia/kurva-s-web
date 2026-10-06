'use client';

import { useQuery } from '@tanstack/react-query';
import { getBulkPrepare } from '../api/get-bulk-prepare';

export const BULK_QUERY_KEYS = {
  all: ['bulkPrepare'] as const,
  prepare: (date: string) => [...BULK_QUERY_KEYS.all, date] as const,
};

export function useBulkPrepare(date: string, companyId?: string | null) {
  return useQuery({
    queryKey: BULK_QUERY_KEYS.prepare(date),
    queryFn: () => getBulkPrepare(date, companyId),
    enabled: !!date,
  });
}
