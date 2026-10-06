'use client';

import { useQuery } from '@tanstack/react-query';

import { getCompany } from '../api/get-company';
import { COMPANY_QUERY_KEYS } from './use-companies';

export function useCompany(id: string) {
  return useQuery({
    queryKey: COMPANY_QUERY_KEYS.detail(id),
    queryFn: () => getCompany(id),
    enabled: !!id,
    select: (data) => (data ? data : null),
  });
}
