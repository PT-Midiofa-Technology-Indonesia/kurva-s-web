'use client';

import { useQuery } from '@tanstack/react-query';

import { getEmployeeSkill } from '../api/get-employee-skill';
import { EMPLOYEE_SKILL_QUERY_KEYS } from './use-employee-skills';

export function useEmployeeSkill(employeeId: string, skillId: string) {
  return useQuery({
    queryKey: EMPLOYEE_SKILL_QUERY_KEYS.detail(employeeId, skillId),
    queryFn: () => getEmployeeSkill(employeeId, skillId),
    enabled: !!employeeId && !!skillId,
    select: (data) => (data ? data.data : null),
  });
}
