import { useQuery } from '@tanstack/react-query';
import { type GetFinanceReportsParams, getFinanceReports } from '../api/get-finance-reports';

export const FINANCE_REPORT_QUERY_KEYS = {
  all: ['finance-reports'] as const,
  lists: () => [...FINANCE_REPORT_QUERY_KEYS.all, 'list'] as const,
  list: (params?: GetFinanceReportsParams) =>
    [...FINANCE_REPORT_QUERY_KEYS.lists(), params] as const,
  detail: (id: string) => [...FINANCE_REPORT_QUERY_KEYS.all, 'detail', id] as const,
};

export function useFinanceReports(params?: GetFinanceReportsParams) {
  return useQuery({
    queryKey: FINANCE_REPORT_QUERY_KEYS.list(params),
    queryFn: () => getFinanceReports(params),
    placeholderData: (previousData) => previousData,
  });
}
