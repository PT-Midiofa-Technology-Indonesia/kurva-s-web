import { useQuery } from '@tanstack/react-query';
import { type GetPositionsParams, getPositions } from '../api/get-positions';

export const POSITION_QUERY_KEYS = {
  all: ['positions'] as const,
  lists: () => [...POSITION_QUERY_KEYS.all, 'list'] as const,
  list: (filters: string) => [...POSITION_QUERY_KEYS.lists(), { filters }] as const,
  details: () => [...POSITION_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...POSITION_QUERY_KEYS.details(), id] as const,
  infinite: () => ['positions-infinite'] as const,
};

export function usePositions(params?: GetPositionsParams) {
  return useQuery({
    queryKey: [...POSITION_QUERY_KEYS.all, params],
    queryFn: () => getPositions(params),
    placeholderData: (previousData) => previousData,
  });
}
