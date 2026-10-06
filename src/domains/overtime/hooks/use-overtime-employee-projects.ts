'use client';

import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import type { SelectOption } from '@/shared/components/atoms';
import { getOvertimeEmployeeProjects } from '../api/get-overtime-employee-projects';

export const OVERTIME_EMPLOYEE_PROJECTS_QUERY_KEY = ['overtime-employee-projects'] as const;

export interface UseOvertimeEmployeeProjectsOptions {
  employeeId: string | null;
  companyId: string | null;
  enabled?: boolean;
}

export function useOvertimeEmployeeProjects({
  employeeId,
  companyId,
  enabled = true,
}: UseOvertimeEmployeeProjectsOptions) {
  const query = useQuery({
    queryKey: [...OVERTIME_EMPLOYEE_PROJECTS_QUERY_KEY, employeeId, companyId],
    queryFn: () => getOvertimeEmployeeProjects(employeeId!, companyId!),
    enabled: enabled && !!employeeId && !!companyId,
  });

  const projectOptions: SelectOption[] = useMemo(
    () =>
      (query.data?.projects ?? []).map((p) => ({
        value: p.id,
        label: p.name,
      })),
    [query.data?.projects]
  );

  return {
    ...query,
    projectOptions,
    autoLocation: query.data?.autoLocation ?? null,
  };
}
