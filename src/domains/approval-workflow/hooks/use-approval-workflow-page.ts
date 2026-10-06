'use client';

import { useCallback, useState } from 'react';
import type { GetApprovalWorkflowsParams } from '../api/get-approval-workflows';
import type { ApprovalWorkflow } from '../types';
import { useApprovalWorkflows } from './use-approval-workflows';

export interface UseApprovalWorkflowPageOptions {
  params?: GetApprovalWorkflowsParams;
  onSetQueryParams?: (params: Record<string, string | number | undefined>) => void;
}

export function useApprovalWorkflowPage(options?: UseApprovalWorkflowPageOptions) {
  const { data, isLoading, isError } = useApprovalWorkflows(options?.params);
  const [settingsTarget, setSettingsTarget] = useState<ApprovalWorkflow | null>(null);

  const approvalWorkflows = data?.data ?? [];
  const totalItems = data?.meta?.total;
  const totalPages = data?.meta?.lastPage;

  const handleSettingsClick = (workflow: ApprovalWorkflow) => {
    setSettingsTarget(workflow);
  };

  const handleSettingsClose = () => {
    setSettingsTarget(null);
  };

  const handleSearchChange = useCallback(
    (value: string | undefined) => {
      options?.onSetQueryParams?.({ search: value, page: 1 });
    },
    [options]
  );

  const handleSort = useCallback(
    (sortBy: string, sortOrder: 'asc' | 'desc') => {
      options?.onSetQueryParams?.({ sortBy, sortOrder });
    },
    [options]
  );

  const handlePaginationChange = useCallback(
    (page: number, perPage: number) => {
      options?.onSetQueryParams?.({ page, perPage });
    },
    [options]
  );

  return {
    approvalWorkflows,
    totalItems,
    totalPages,
    isLoading,
    isError,
    settingsTarget,
    setSettingsTarget,
    handleSettingsClick,
    handleSettingsClose,
    handleSearchChange,
    handleSort,
    handlePaginationChange,
  };
}
