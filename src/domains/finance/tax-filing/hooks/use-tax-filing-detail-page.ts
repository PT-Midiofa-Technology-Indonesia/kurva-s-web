'use client';

import { useRouter } from 'next/navigation';
import { useTaxFiling } from './use-tax-filings';
export function useTaxFilingDetailPage(taxFilingId: string, companyId?: string) {
  const router = useRouter();
  const { data, isLoading, isError } = useTaxFiling({ id: taxFilingId, companyId });
  return { taxFiling: data?.data, isLoading, isError, handleBack: () => router.back() };
}
