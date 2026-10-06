'use client';

import { useQuery } from '@tanstack/react-query';
import { getFinanceReportDetail } from '../api/get-finance-report-detail';
import { FINANCE_REPORT_QUERY_KEYS } from './use-finance-reports';

export interface UseFinanceReportDetailParams {
  id: string;
  companyId?: string;
}

export function useFinanceReportDetail({ id, companyId }: UseFinanceReportDetailParams) {
  return useQuery({
    queryKey: [...FINANCE_REPORT_QUERY_KEYS.detail(id), companyId],
    queryFn: () => getFinanceReportDetail({ id, companyId }),
    enabled: !!id,
  });
}
