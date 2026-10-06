'use client';

import { type UseQueryResult, useQuery } from '@tanstack/react-query';
import { getEmployeeSalaryAdjustmentDetail } from '../api/get-employee-salary-adjustment-detail';
import type { EmployeeSalaryAdjustmentDetail } from '../types';
import { PAYROLL_QUERY_KEYS } from './query-keys';

export function useEmployeeSalaryAdjustmentDetail(
  employeeId: string | null,
  companyId?: string | null,
  enabled = true
): UseQueryResult<EmployeeSalaryAdjustmentDetail> {
  return useQuery({
    queryKey: [...PAYROLL_QUERY_KEYS.employeeSalaryAdjustmentDetail, employeeId, companyId],
    queryFn: () => getEmployeeSalaryAdjustmentDetail(employeeId!, companyId),
    enabled: enabled && !!employeeId && !!companyId,
  });
}
