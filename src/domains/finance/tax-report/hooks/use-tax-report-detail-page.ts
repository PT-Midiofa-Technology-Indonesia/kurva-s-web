'use client';

import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import { useTaxReport } from './use-tax-report';

export function useTaxReportDetailPage(taxReportId: string, companyId?: string) {
  const router = useRouter();
  const { data, isLoading, isError } = useTaxReport({ id: taxReportId, companyId });
  const handleBack = useCallback(() => router.back(), [router]);

  return { taxReport: data?.data ?? null, isLoading, isError, handleBack };
}
