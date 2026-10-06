'use client';

import { useQuery } from '@tanstack/react-query';
import { getQcReportDetail } from '../api/get-qc-report-detail';
import { QC_REPORTS_QUERY_KEYS } from './use-qc-reports';

export function useQcReportDetail(reportId: string | null) {
  return useQuery({
    queryKey: [...QC_REPORTS_QUERY_KEYS.qcReports(), 'detail', reportId] as const,
    queryFn: () => getQcReportDetail(reportId ?? ''),
    enabled: !!reportId,
  });
}
