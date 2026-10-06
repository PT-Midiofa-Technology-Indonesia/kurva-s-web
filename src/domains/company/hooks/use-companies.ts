import { useQuery } from '@tanstack/react-query';
import { type GetCompaniesParams, getCompanies } from '../api/get-companies';

export const COMPANY_QUERY_KEYS = {
  all: ['companies'] as const,
  lists: () => [...COMPANY_QUERY_KEYS.all, 'list'] as const,
  list: (filters: string) => [...COMPANY_QUERY_KEYS.lists(), { filters }] as const,
  details: () => [...COMPANY_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...COMPANY_QUERY_KEYS.details(), id] as const,
  infinite: () => ['companies-infinite'] as const,
};

export function useCompanies(params?: GetCompaniesParams) {
  return useQuery({
    queryKey: COMPANY_QUERY_KEYS.list(JSON.stringify(params)),
    queryFn: () => getCompanies(params),
  });
}
