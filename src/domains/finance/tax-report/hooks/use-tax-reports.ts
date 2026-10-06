import { useQuery } from '@tanstack/react-query';
import type { GetTaxReportsParams } from '../api/get-tax-reports';
import { getTaxReports } from '../api/get-tax-reports';
import { getTaxTypes } from '../api/get-tax-types';

export const TAX_REPORT_QUERY_KEYS = {
  all: ['tax-report'] as const,
  lists: () => [...TAX_REPORT_QUERY_KEYS.all, 'list'] as const,
  list: (filters: string) => [...TAX_REPORT_QUERY_KEYS.lists(), { filters }] as const,
  details: () => [...TAX_REPORT_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: string, companyId?: string) =>
    [...TAX_REPORT_QUERY_KEYS.details(), id, companyId] as const,
  taxTypes: () => [...TAX_REPORT_QUERY_KEYS.all, 'tax-types'] as const,
};

export function useTaxReports(params?: GetTaxReportsParams) {
  return useQuery({
    queryKey: TAX_REPORT_QUERY_KEYS.list(JSON.stringify(params)),
    queryFn: () => getTaxReports(params),
    enabled: !!params?.companyId,
  });
}

export function useTaxTypes() {
  return useQuery({
    queryKey: TAX_REPORT_QUERY_KEYS.taxTypes(),
    queryFn: getTaxTypes,
  });
}
