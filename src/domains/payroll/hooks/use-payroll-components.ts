'use client';

import { type UseQueryResult, useQuery } from '@tanstack/react-query';
import type { ApiPaginatedResponse } from '@/shared/types/api';
import { getPayrollComponents } from '../api/get-payroll-components';
import type { PayrollComponent } from '../types';
import { PAYROLL_QUERY_KEYS } from './query-keys';

export function usePayrollComponents(
  params: Record<string, unknown>
): UseQueryResult<ApiPaginatedResponse<PayrollComponent[]>> {
  return useQuery({
    queryKey: [...PAYROLL_QUERY_KEYS.components, params],
    queryFn: () => getPayrollComponents(params as any),
  });
}
