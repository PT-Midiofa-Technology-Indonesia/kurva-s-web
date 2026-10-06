import { useQuery } from '@tanstack/react-query';
import {
  type GetEmployeeRatingsParams,
  type GetEmployeeRatingsResponse,
  getEmployeeRatings,
} from '../api/get-employee-ratings';

export const EMPLOYEE_RATINGS_QUERY_KEYS = {
  all: ['employee-ratings'] as const,
  lists: () => [...EMPLOYEE_RATINGS_QUERY_KEYS.all, 'list'] as const,
  list: (params: Partial<GetEmployeeRatingsParams>) =>
    [...EMPLOYEE_RATINGS_QUERY_KEYS.lists(), params] as const,
};

export function useEmployeeRatings(params: Partial<GetEmployeeRatingsParams>) {
  const employeeId = params.employeeId;

  return useQuery<GetEmployeeRatingsResponse>({
    queryKey: EMPLOYEE_RATINGS_QUERY_KEYS.list(params),
    queryFn: () =>
      getEmployeeRatings({
        employeeId: employeeId!,
        sourceType: params.sourceType,
        dateFrom: params.dateFrom,
        dateTo: params.dateTo,
        page: params.page,
        perPage: params.perPage,
      }),
    enabled: !!employeeId,
    placeholderData: (previousData) => previousData,
  });
}
