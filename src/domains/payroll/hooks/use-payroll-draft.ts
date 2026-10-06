'use client';

import { useQuery } from '@tanstack/react-query';
import { getPayrollDraft } from '../api/get-payroll-draft';
import { PAYROLL_QUERY_KEYS } from './query-keys';

export function usePayrollDraft(id?: string | null, companyId?: string | null) {
  return useQuery({
    queryKey: PAYROLL_QUERY_KEYS.payrollDraftDetail(id ?? '', companyId ?? ''),
    queryFn: () => getPayrollDraft({ id: id as string, companyId: companyId as string }),
    enabled: Boolean(id && companyId),
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
  });
}
