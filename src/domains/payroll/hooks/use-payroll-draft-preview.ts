'use client';

import { useQuery } from '@tanstack/react-query';
import { getPayrollDraftPreview } from '../api/get-payroll-draft-preview';
import { PAYROLL_QUERY_KEYS } from './query-keys';

export function usePayrollDraftPreview(
  id?: string | null,
  companyId?: string | null,
  enabled: boolean = true
) {
  return useQuery({
    queryKey: PAYROLL_QUERY_KEYS.payrollDraftPreview(id ?? '', companyId ?? ''),
    queryFn: () => getPayrollDraftPreview({ id: id as string, companyId: companyId as string }),
    enabled: Boolean(enabled && id && companyId),
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
  });
}
