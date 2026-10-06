'use client';

import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import type { SelectOption } from '@/shared/components/atoms';
import { getPicOptions } from '../api/get-pic-options';

export interface UsePicOptionsOptions {
  enabled?: boolean;
  approverType?: string;
  approverId?: string;
  companyId?: string;
}

export function usePicOptionsInfinite(options?: UsePicOptionsOptions) {
  const { approverType, approverId, companyId } = options ?? {};

  const normalizedType = approverType?.toLowerCase() as 'role' | 'department' | undefined;
  const isReady =
    options?.enabled !== false &&
    (normalizedType === 'role' || normalizedType === 'department') &&
    !!approverId;

  const { data, isLoading, error } = useQuery({
    queryKey: ['approval-workflow', 'pic-options', normalizedType, approverId, companyId],
    queryFn: () =>
      getPicOptions({
        companyId,
        approverType: normalizedType!,
        approverId: approverId!,
      }),
    enabled: isReady,
  });

  const picOptions: SelectOption[] = useMemo(
    () => (data ?? []).map((item) => ({ value: String(item.value), label: item.label })),
    [data]
  );

  return {
    options: picOptions,
    isLoading,
    error: error ? (error as Error) : null,
  };
}
