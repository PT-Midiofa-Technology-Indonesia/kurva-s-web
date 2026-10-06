'use client';

import { useQuery } from '@tanstack/react-query';
import { type GetResourceUnitsParams, getResourceUnits } from '../api/get-resource-units';

export const RESOURCE_UNIT_QUERY_KEYS = {
  all: ['resource-units'] as const,
  lists: () => [...RESOURCE_UNIT_QUERY_KEYS.all, 'list'] as const,
  list: (filters: string) => [...RESOURCE_UNIT_QUERY_KEYS.lists(), { filters }] as const,
  details: () => [...RESOURCE_UNIT_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...RESOURCE_UNIT_QUERY_KEYS.details(), id] as const,
};

export function useResourceUnits(params?: GetResourceUnitsParams, companyId?: string) {
  return useQuery({
    queryKey: [...RESOURCE_UNIT_QUERY_KEYS.all, params, companyId],
    queryFn: () => getResourceUnits(params, companyId),
    placeholderData: (previousData) => previousData,
  });
}
