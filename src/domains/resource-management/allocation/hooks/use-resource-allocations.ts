'use client';

import { useQuery } from '@tanstack/react-query';
import {
  type GetResourceAllocationsParams,
  getResourceAllocations,
} from '../api/get-resource-allocations';

export const RESOURCE_ALLOCATION_QUERY_KEYS = {
  all: ['resource-allocations'] as const,
  lists: () => [...RESOURCE_ALLOCATION_QUERY_KEYS.all, 'list'] as const,
  list: (filters: string) => [...RESOURCE_ALLOCATION_QUERY_KEYS.lists(), { filters }] as const,
  details: () => [...RESOURCE_ALLOCATION_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...RESOURCE_ALLOCATION_QUERY_KEYS.details(), id] as const,
};

export function useResourceAllocations(params?: GetResourceAllocationsParams, projectId?: string) {
  return useQuery({
    queryKey: [...RESOURCE_ALLOCATION_QUERY_KEYS.all, params, projectId],
    queryFn: () => getResourceAllocations(params, projectId),
    placeholderData: (previousData) => previousData,
  });
}
