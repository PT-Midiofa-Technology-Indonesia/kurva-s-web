'use client';

import { useQuery } from '@tanstack/react-query';
import { getResourceUnit } from '../api/get-resource-unit';
import { RESOURCE_UNIT_QUERY_KEYS } from './use-resource-units';

export function useResourceUnit(resourceUnitId: string, companyId?: string) {
  return useQuery({
    queryKey: RESOURCE_UNIT_QUERY_KEYS.detail(resourceUnitId),
    queryFn: () => getResourceUnit(resourceUnitId, companyId),
    enabled: !!resourceUnitId,
    select: (data) => (data ? data.data : null),
  });
}
