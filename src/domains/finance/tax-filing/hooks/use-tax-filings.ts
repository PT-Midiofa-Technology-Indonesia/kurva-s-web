import { useQuery } from '@tanstack/react-query';
import { type GetTaxFilingParams, getTaxFiling } from '../api/get-tax-filing';
import { type GetTaxFilingsParams, getTaxFilings } from '../api/get-tax-filings';
import { getTaxTypes } from '../api/get-tax-types';

export const TAX_FILING_QUERY_KEYS = {
  all: ['tax-filings'] as const,
  lists: () => [...TAX_FILING_QUERY_KEYS.all, 'list'] as const,
  list: (filters: string) => [...TAX_FILING_QUERY_KEYS.lists(), { filters }] as const,
  details: () => [...TAX_FILING_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: string, companyId?: string) =>
    [...TAX_FILING_QUERY_KEYS.details(), id, companyId] as const,
  taxTypes: () => [...TAX_FILING_QUERY_KEYS.all, 'tax-types'] as const,
};
export function useTaxFilings(params?: GetTaxFilingsParams) {
  return useQuery({
    queryKey: TAX_FILING_QUERY_KEYS.list(JSON.stringify(params ?? {})),
    queryFn: () => getTaxFilings(params),
  });
}
export function useTaxFiling(params: GetTaxFilingParams) {
  return useQuery({
    queryKey: TAX_FILING_QUERY_KEYS.detail(params.id, params.companyId),
    queryFn: () => getTaxFiling(params),
    enabled: !!params.id && !!params.companyId,
  });
}

export function useTaxTypes() {
  return useQuery({
    queryKey: TAX_FILING_QUERY_KEYS.taxTypes(),
    queryFn: getTaxTypes,
  });
}
