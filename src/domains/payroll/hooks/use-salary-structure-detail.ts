'use client';

import { type UseQueryResult, useQuery } from '@tanstack/react-query';
import { getSalaryStructureDetail } from '../api/get-salary-structure-detail';
import type { SalaryStructureDetail } from '../types';
import { PAYROLL_QUERY_KEYS } from './query-keys';

export function useSalaryStructureDetail(
  gradeId: string | null,
  salaryType: string
): UseQueryResult<SalaryStructureDetail | null> {
  return useQuery({
    queryKey: [...PAYROLL_QUERY_KEYS.salaryStructureDetail, gradeId, salaryType],
    queryFn: () => getSalaryStructureDetail(gradeId!, salaryType),
    enabled: !!gradeId,
  });
}
