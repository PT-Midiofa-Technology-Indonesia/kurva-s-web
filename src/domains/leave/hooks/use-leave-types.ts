'use client';

import { useQuery } from '@tanstack/react-query';
import { type GetLeaveTypesParams, getLeaveTypes } from '../api/get-leave-types';

export const LEAVE_TYPES_QUERY_KEYS = {
  all: ['leave-types'] as const,
  list: (params: GetLeaveTypesParams) => ['leave-types', params] as const,
};

export function useLeaveTypes(params: GetLeaveTypesParams) {
  return useQuery({
    queryKey: LEAVE_TYPES_QUERY_KEYS.list(params),
    queryFn: () => getLeaveTypes(params),
    enabled: !!params.companyId,
  });
}
