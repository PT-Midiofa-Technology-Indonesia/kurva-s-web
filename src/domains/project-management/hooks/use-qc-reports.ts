'use client';

import { useQuery } from '@tanstack/react-query';
import type { GetQcReportsParams } from '../api/get-qc-reports';
import { getQcReports } from '../api/get-qc-reports';
import { MANPOWER_PLAN_QUERY_KEYS } from './use-manpower-plan';

/**
 * QC keys nest inside the manpower-plan namespace, so invalidating
 * `MANPOWER_PLAN_QUERY_KEYS.all` refreshes BOTH pages (QC list + manpower tree/assignment).
 * The pagination/search/status params ride inside `{ filters }` — a page/search/status change
 * produces a new key and therefore a fresh fetch, while a claim/review invalidation refetches
 * the currently rendered page only.
 */
export const QC_REPORTS_QUERY_KEYS = {
  qcReports: () => [...MANPOWER_PLAN_QUERY_KEYS.all, 'qc-reports'] as const,
  qcReportList: (filters: GetQcReportsParams | undefined) =>
    [...QC_REPORTS_QUERY_KEYS.qcReports(), { filters }] as const,
} as const;

/** Paginated QC list — resolves to `QcReportsPage` (`rows` + wire paginator `meta`). */
export function useQcReports(params?: GetQcReportsParams) {
  return useQuery({
    queryKey: QC_REPORTS_QUERY_KEYS.qcReportList(params),
    queryFn: () => getQcReports(params),
  });
}
