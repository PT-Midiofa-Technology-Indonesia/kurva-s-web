'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { useMemo } from 'react';
import { useQueryParams } from '@/hooks/use-query-params';
import { AsyncSelect } from '@/shared/components/atoms';
import { ListPageTemplate } from '@/shared/components/templates/ListPageTemplate';
import { Badge, Button } from '@/shared/components/ui';
import { useCompanyFilter } from '@/shared/hooks/use-company-filter';
import type { BaseQueryParams } from '@/types/query-params';
import { ApprovalWorkflowSettingsDrawer } from '../components/ApprovalWorkflowSettingsDrawer';
import { APPROVAL_WORKFLOW_LABELS } from '../constants';
import { useApprovalWorkflowPage } from '../hooks/use-approval-workflow-page';
import type { ApprovalWorkflow } from '../types';

interface ApprovalWorkflowUrlParams extends BaseQueryParams {
  companyId?: string;
}

export function ApprovalWorkflowListPage() {
  const { queryParams, setQueryParams } = useQueryParams<ApprovalWorkflowUrlParams>();

  const { companyId, companyOptions, handleCompanyChange } = useCompanyFilter();

  // ── Table params ──────────────────────────────────────────────────────────

  const params = useMemo(() => {
    return {
      page: queryParams.page ?? 1,
      perPage: queryParams.perPage ?? 10,
      sortBy: queryParams.sortBy,
      sortOrder: (queryParams.sortOrder || 'asc') as 'asc' | 'desc',
      search: queryParams.search,
      companyId,
    };
  }, [queryParams, companyId]);

  const pageOptions = useMemo(
    () => ({
      params,
      onSetQueryParams: setQueryParams,
    }),
    [params, setQueryParams]
  );

  const {
    approvalWorkflows,
    totalItems,
    totalPages,
    isLoading,
    isError,
    settingsTarget,
    handleSettingsClick,
    handleSettingsClose,
    handleSearchChange,
    handleSort,
    handlePaginationChange,
  } = useApprovalWorkflowPage(pageOptions);

  // ── Columns ───────────────────────────────────────────────────────────────

  const columns = useMemo<ColumnDef<ApprovalWorkflow>[]>(
    () => [
      {
        accessorKey: 'name',
        header: APPROVAL_WORKFLOW_LABELS.LIST.COLUMNS.NAME,
      },
      {
        accessorKey: 'stepsCount',
        header: APPROVAL_WORKFLOW_LABELS.LIST.COLUMNS.STEPS_COUNT,
        size: 160,
        cell: ({ row }) => (
          <Badge variant="outline" className="rounded-full">
            {row.original.stepsCount}
          </Badge>
        ),
      },
      {
        id: 'actions',
        header: APPROVAL_WORKFLOW_LABELS.LIST.COLUMNS.ACTIONS,
        enableSorting: false,
        enableHiding: false,
        size: 100,
        cell: ({ row }) => (
          <Button
            variant="link"
            size="sm"
            onClick={() => handleSettingsClick(row.original)}
            className="h-auto p-0"
          >
            {APPROVAL_WORKFLOW_LABELS.LIST.ACTIONS.SETTINGS}
          </Button>
        ),
      },
    ],
    [handleSettingsClick]
  );

  return (
    <>
      <ListPageTemplate<ApprovalWorkflow>
        title={APPROVAL_WORKFLOW_LABELS.LIST.TITLE}
        headerActions={
          <AsyncSelect
            className="w-52"
            options={companyOptions}
            value={companyId ?? null}
            onChange={handleCompanyChange}
            placeholder={APPROVAL_WORKFLOW_LABELS.LIST.FILTERS.COMPANY}
            isSearchable={false}
            isClearable={false}
          />
        }
        data={approvalWorkflows}
        columns={columns}
        isLoading={isLoading}
        isError={isError}
        emptyMessage={APPROVAL_WORKFLOW_LABELS.LIST.EMPTY}
        search={queryParams.search}
        searchPlaceholder={APPROVAL_WORKFLOW_LABELS.LIST.SEARCH_PLACEHOLDER}
        onSearchChange={handleSearchChange}
        sortBy={params.sortBy}
        sortOrder={params.sortOrder}
        onSort={handleSort}
        page={params.page}
        perPage={params.perPage}
        totalItems={totalItems}
        totalPages={totalPages}
        onPaginationChange={handlePaginationChange}
      />

      <ApprovalWorkflowSettingsDrawer
        open={settingsTarget !== null}
        workflow={settingsTarget}
        onClose={handleSettingsClose}
      />
    </>
  );
}
