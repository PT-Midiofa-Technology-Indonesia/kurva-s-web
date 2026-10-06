import { useQuery } from '@tanstack/react-query';
import { getCostRequest } from '../api/get-cost-request';
import { COST_REQUEST_QUERY_KEYS } from './use-cost-requests';

export function useCostRequest(id: string, companyId?: string) {
  return useQuery({
    queryKey: COST_REQUEST_QUERY_KEYS.detail(id),
    queryFn: () => getCostRequest({ id, companyId }),
    enabled: !!id && !!companyId,
  });
}
