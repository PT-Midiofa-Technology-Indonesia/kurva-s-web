import { useQuery } from '@tanstack/react-query';
import {
  type GetEmployeeRatingSummaryParams,
  type GetEmployeeRatingSummaryResponse,
  getEmployeeRatingSummary,
} from '../api/get-employee-rating-summary';

export const EMPLOYEE_RATING_SUMMARY_QUERY_KEYS = {
  all: ['employee-rating-summary'] as const,
  details: () => [...EMPLOYEE_RATING_SUMMARY_QUERY_KEYS.all, 'detail'] as const,
  detail: (employeeId: string, showAll: boolean = false) =>
    [...EMPLOYEE_RATING_SUMMARY_QUERY_KEYS.details(), employeeId, { showAll }] as const,
};

export function useEmployeeRatingSummary(params: Partial<GetEmployeeRatingSummaryParams>) {
  const employeeId = params.employeeId;
  const showAll = params.showAll ?? false;

  return useQuery<GetEmployeeRatingSummaryResponse>({
    queryKey: employeeId
      ? EMPLOYEE_RATING_SUMMARY_QUERY_KEYS.detail(employeeId, showAll)
      : [...EMPLOYEE_RATING_SUMMARY_QUERY_KEYS.details(), employeeId, { showAll }],
    queryFn: () =>
      getEmployeeRatingSummary({
        employeeId: employeeId!,
        showAll,
      }),
    enabled: !!employeeId,
    placeholderData: (previousData) => previousData,
  });
}
