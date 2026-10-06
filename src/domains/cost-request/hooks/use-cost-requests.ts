import { useQuery } from '@tanstack/react-query';
import { type GetCostRequestsParams, getCostRequests } from '../api/get-cost-requests';

export const COST_REQUEST_QUERY_KEYS = {
  all: ['cost-requests'] as const,
  lists: () => [...COST_REQUEST_QUERY_KEYS.all, 'list'] as const,
  list: (params?: GetCostRequestsParams) => [...COST_REQUEST_QUERY_KEYS.lists(), params] as const,
  details: () => [...COST_REQUEST_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...COST_REQUEST_QUERY_KEYS.details(), id] as const,
};

export function useCostRequests(params?: GetCostRequestsParams) {
  return useQuery({
    queryKey: COST_REQUEST_QUERY_KEYS.list(params),
    queryFn: () => getCostRequests(params),
    placeholderData: (previousData) => previousData,
    enabled: !!params?.companyId,
  });
}
