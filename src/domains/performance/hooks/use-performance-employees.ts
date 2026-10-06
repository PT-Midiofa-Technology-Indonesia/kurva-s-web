'use client';

import { useQuery } from '@tanstack/react-query';
import {
  type GetPerformanceEmployeesParams,
  getPerformanceEmployees,
} from '../api/get-performance-employees';

export const PERFORMANCE_QUERY_KEYS = {
  all: ['performance'] as const,
  employees: (params?: GetPerformanceEmployeesParams) =>
    [...PERFORMANCE_QUERY_KEYS.all, 'employees', params] as const,
  employee: (employeeId: string, params?: any) =>
    [...PERFORMANCE_QUERY_KEYS.all, 'employee', employeeId, params] as const,
  employeeHistory: (employeeId: string, params?: any) =>
    [...PERFORMANCE_QUERY_KEYS.all, 'employee', employeeId, 'history', params] as const,
  employeeProjectHistory: (employeeId: string, params?: any) =>
    [...PERFORMANCE_QUERY_KEYS.all, 'employee', employeeId, 'project-history', params] as const,
  employeeViolations: (employeeId: string, params?: any) =>
    [...PERFORMANCE_QUERY_KEYS.all, 'employee', employeeId, 'violations', params] as const,
  detail: (performanceId: string) =>
    [...PERFORMANCE_QUERY_KEYS.all, 'detail', performanceId] as const,
};

export function usePerformanceEmployees(params?: GetPerformanceEmployeesParams) {
  return useQuery({
    queryKey: PERFORMANCE_QUERY_KEYS.employees(params),
    queryFn: () => getPerformanceEmployees(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}
