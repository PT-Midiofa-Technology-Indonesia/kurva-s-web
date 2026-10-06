'use client';

import { useQuery } from '@tanstack/react-query';
import type { GetPoDraftsParams } from '../api/get-po-drafts';
import { getPoDrafts } from '../api/get-po-drafts';

export const PROCUREMENT_QUERY_KEYS = {
  all: ['procurement', 'po-drafts'] as const,
  lists: () => [...PROCUREMENT_QUERY_KEYS.all, 'list'] as const,
  list: (filters: string) => [...PROCUREMENT_QUERY_KEYS.lists(), { filters }] as const,
};

export function usePoDrafts(params?: GetPoDraftsParams) {
  return useQuery({
    queryKey: PROCUREMENT_QUERY_KEYS.list(JSON.stringify(params)),
    queryFn: () => getPoDrafts(params),
  });
}
