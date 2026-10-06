'use client';

import { useQuery } from '@tanstack/react-query';

import { getOffice } from '../api/get-office';
import { OFFICE_QUERY_KEYS } from './use-offices';

export function useOffice(id: string) {
  return useQuery({
    queryKey: OFFICE_QUERY_KEYS.detail(id),
    queryFn: () => getOffice(id),
    enabled: !!id,
    select: (data) => (data ? data : null),
  });
}
