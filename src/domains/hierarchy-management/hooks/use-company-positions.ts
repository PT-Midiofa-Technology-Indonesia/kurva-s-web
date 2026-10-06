import { useQuery } from '@tanstack/react-query';
import { type GetCompanyPositionsParams, getCompanyPositions } from '../api/get-company-positions';
import { HIERARCHY_MANAGEMENT_QUERY_KEYS } from './use-hierarchy-managements';

export function useCompanyPositions(params?: GetCompanyPositionsParams) {
  return useQuery({
    queryKey: HIERARCHY_MANAGEMENT_QUERY_KEYS.positions(JSON.stringify(params)),
    queryFn: () => getCompanyPositions(params),
    enabled: Boolean(params?.companyId),
  });
}
