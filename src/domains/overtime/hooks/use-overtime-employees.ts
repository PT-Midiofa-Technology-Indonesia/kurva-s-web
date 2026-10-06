'use client';

import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import type { SelectOption } from '@/shared/components/atoms';
import { getOvertimeEmployees } from '../api/get-overtime-employees';

export const OVERTIME_EMPLOYEES_QUERY_KEY = ['overtime-employees'] as const;

export interface UseOvertimeEmployeesOptions {
  companyId: string | null;
  enabled?: boolean;
}

export function useOvertimeEmployees({ companyId, enabled = true }: UseOvertimeEmployeesOptions) {
  const query = useQuery({
    queryKey: [...OVERTIME_EMPLOYEES_QUERY_KEY, companyId],
    queryFn: () => getOvertimeEmployees(companyId!),
    enabled: enabled && !!companyId,
  });

  const options: SelectOption[] = useMemo(
    () =>
      (query.data ?? []).map((e) => ({
        value: e.id,
        label: `${e.code} - ${e.full_name}`,
      })),
    [query.data]
  );

  return { ...query, options };
}
