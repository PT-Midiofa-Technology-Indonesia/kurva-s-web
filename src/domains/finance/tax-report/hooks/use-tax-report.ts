import { useQuery } from '@tanstack/react-query';
import type { GetTaxReportParams } from '../api/get-tax-report';
import { getTaxReport } from '../api/get-tax-report';
import { TAX_REPORT_QUERY_KEYS } from './use-tax-reports';

export function useTaxReport(params: GetTaxReportParams) {
  return useQuery({
    queryKey: TAX_REPORT_QUERY_KEYS.detail(params.id, params.companyId),
    queryFn: () => getTaxReport(params),
    enabled: !!params.id && !!params.companyId,
  });
}
