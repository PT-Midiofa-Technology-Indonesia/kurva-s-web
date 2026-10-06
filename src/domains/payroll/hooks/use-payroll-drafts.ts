'use client';

import { type UseQueryResult, useQuery } from '@tanstack/react-query';
import type { ApiPaginatedResponse } from '@/shared/types/api';
import { type GetPayrollDraftsParams, getPayrollDrafts } from '../api/get-payroll-drafts';
import type { PayrollDraftSummary } from '../types';
import { PAYROLL_QUERY_KEYS } from './query-keys';

export function usePayrollDrafts(
  params: GetPayrollDraftsParams,
  companyId?: string | null
): UseQueryResult<ApiPaginatedResponse<PayrollDraftSummary[]>> {
  return useQuery({
    queryKey: [...PAYROLL_QUERY_KEYS.payrollDrafts, params, companyId],
    queryFn: () => getPayrollDrafts({ ...params, companyId: companyId as string }),
    enabled: !!companyId,
  });
}
