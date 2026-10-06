'use client';

import { useQuery } from '@tanstack/react-query';
import { getFinancialReportItemCosts } from '../api/get-financial-report-item-costs';

export const FINANCIAL_REPORT_ITEM_COSTS_QUERY_KEYS = {
  all: ['financial-report-item-costs'] as const,
  detail: (projectId: string, itemId: string) =>
    [...FINANCIAL_REPORT_ITEM_COSTS_QUERY_KEYS.all, projectId, itemId] as const,
};

export function useFinancialReportItemCosts(
  projectId: string | null | undefined,
  itemId: string | null | undefined,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: FINANCIAL_REPORT_ITEM_COSTS_QUERY_KEYS.detail(projectId ?? '', itemId ?? ''),
    queryFn: () => getFinancialReportItemCosts(projectId!, itemId!),
    enabled: !!projectId && !!itemId && options?.enabled !== false,
  });
}
