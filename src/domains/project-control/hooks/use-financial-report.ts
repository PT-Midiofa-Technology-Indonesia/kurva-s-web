'use client';

import { useQuery } from '@tanstack/react-query';
import type { GetFinancialReportParams } from '../api/get-financial-report';
import { getFinancialReport } from '../api/get-financial-report';

export const FINANCIAL_REPORT_QUERY_KEYS = {
  all: ['financial-report'] as const,
  detail: (projectId: string, params?: GetFinancialReportParams) =>
    [...FINANCIAL_REPORT_QUERY_KEYS.all, projectId, params ?? {}] as const,
};

export function useFinancialReport(
  projectId: string | null | undefined,
  params?: GetFinancialReportParams
) {
  return useQuery({
    queryKey: FINANCIAL_REPORT_QUERY_KEYS.detail(projectId ?? '', params),
    queryFn: () => getFinancialReport(projectId!, params),
    enabled: !!projectId,
  });
}
