'use client';

import { useQuery } from '@tanstack/react-query';
import { getOvertimeSettings } from '../api/get-overtime-settings';

export const OVERTIME_SETTINGS_QUERY_KEYS = {
  all: ['overtime-settings'] as const,
  byCompany: (companyId?: string | null) => ['overtime-settings', companyId] as const,
};

export function useOvertimeSettings(companyId?: string | null) {
  return useQuery({
    queryKey: OVERTIME_SETTINGS_QUERY_KEYS.byCompany(companyId),
    queryFn: () => getOvertimeSettings(companyId),
    enabled: !!companyId,
  });
}
