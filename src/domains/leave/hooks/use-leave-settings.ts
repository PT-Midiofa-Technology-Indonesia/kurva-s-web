'use client';

import { useQuery } from '@tanstack/react-query';
import { getLeaveSettings } from '../api/get-leave-settings';

export const LEAVE_SETTINGS_QUERY_KEYS = {
  all: ['leave-settings'] as const,
  byCompany: (companyId?: string | null) => ['leave-settings', companyId] as const,
};

export function useLeaveSettings(companyId?: string | null) {
  return useQuery({
    queryKey: LEAVE_SETTINGS_QUERY_KEYS.byCompany(companyId),
    queryFn: () => getLeaveSettings(companyId),
  });
}
