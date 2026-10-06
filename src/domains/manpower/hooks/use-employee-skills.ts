import { useQuery } from '@tanstack/react-query';
import { type GetEmployeeSkillsParams, getEmployeeSkills } from '../api/get-employee-skills';

export const EMPLOYEE_SKILL_QUERY_KEYS = {
  all: ['employee-skills'] as const,
  lists: () => [...EMPLOYEE_SKILL_QUERY_KEYS.all, 'list'] as const,
  list: (employeeId: string, params?: string) =>
    [...EMPLOYEE_SKILL_QUERY_KEYS.lists(), employeeId, params] as const,
  details: () => [...EMPLOYEE_SKILL_QUERY_KEYS.all, 'detail'] as const,
  detail: (employeeId: string, skillId: string) =>
    [...EMPLOYEE_SKILL_QUERY_KEYS.details(), employeeId, skillId] as const,
};

export function useEmployeeSkills(employeeId: string, params?: GetEmployeeSkillsParams) {
  return useQuery({
    queryKey: EMPLOYEE_SKILL_QUERY_KEYS.list(employeeId, JSON.stringify(params)),
    queryFn: () => getEmployeeSkills(employeeId, params),
    enabled: !!employeeId,
  });
}
