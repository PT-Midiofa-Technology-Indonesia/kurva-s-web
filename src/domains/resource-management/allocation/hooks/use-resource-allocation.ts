'use client';

import { useQuery } from '@tanstack/react-query';
import { getResourceAllocation } from '../api/get-resource-allocation';
import { RESOURCE_ALLOCATION_QUERY_KEYS } from './use-resource-allocations';

export function useResourceAllocation(resourceAllocationId: string, projectId: string) {
  return useQuery({
    queryKey: [...RESOURCE_ALLOCATION_QUERY_KEYS.detail(resourceAllocationId), projectId],
    queryFn: () => getResourceAllocation(resourceAllocationId, projectId),
    enabled: !!resourceAllocationId && !!projectId,
    select: (data) => (data ? data.data : null),
  });
}
