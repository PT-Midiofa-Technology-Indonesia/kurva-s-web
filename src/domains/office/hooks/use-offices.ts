import { useQuery } from '@tanstack/react-query';
import { type GetOfficesParams, getOffices } from '../api/get-offices';

export const OFFICE_QUERY_KEYS = {
  all: ['offices'] as const,
  lists: () => [...OFFICE_QUERY_KEYS.all, 'list'] as const,
  list: (filters: string) => [...OFFICE_QUERY_KEYS.lists(), { filters }] as const,
  details: () => [...OFFICE_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...OFFICE_QUERY_KEYS.details(), id] as const,
};

export function useOffices(params?: GetOfficesParams) {
  return useQuery({
    queryKey: OFFICE_QUERY_KEYS.list(JSON.stringify(params)),
    queryFn: () => getOffices(params),
  });
}
