'use client';

import { useQuery } from '@tanstack/react-query';
import { getPosition } from '../api/get-position';
import { POSITION_QUERY_KEYS } from './use-positions';

export function usePosition(positionId: string) {
  return useQuery({
    queryKey: POSITION_QUERY_KEYS.detail(positionId),
    queryFn: () => getPosition(positionId),
    enabled: !!positionId,
    select: (data) => (data ? data.data : null),
  });
}
