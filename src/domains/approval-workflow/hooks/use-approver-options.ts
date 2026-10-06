'use client';

import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import type { SelectOption } from '@/shared/components/atoms';
import { getApproverOptions } from '../api/get-approver-options';
import { APPROVAL_WORKFLOW_QUERY_KEYS } from './use-approval-workflows';

function toSelectOptions(items: { value: string | number; label: string }[]): SelectOption[] {
  return items.map((item) => ({ value: String(item.value), label: item.label }));
}

export function useApproverOptions(companyId?: string) {
  const { data, isLoading, error } = useQuery({
    queryKey: APPROVAL_WORKFLOW_QUERY_KEYS.approverOptions(companyId),
    queryFn: () => getApproverOptions(companyId),
    enabled: !!companyId,
  });

  const tipeApproverOptions: SelectOption[] = useMemo(
    () => toSelectOptions(data?.tipeApprover ?? []),
    [data?.tipeApprover]
  );

  const roleOptions: SelectOption[] = useMemo(
    () => toSelectOptions(data?.roles ?? []),
    [data?.roles]
  );

  const departmentOptions: SelectOption[] = useMemo(
    () => toSelectOptions(data?.departments ?? []),
    [data?.departments]
  );

  return {
    tipeApproverOptions,
    roleOptions,
    departmentOptions,
    isLoading,
    error: error ? (error as Error) : null,
  };
}
