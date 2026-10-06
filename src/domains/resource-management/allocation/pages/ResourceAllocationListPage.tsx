'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { EllipsisVertical, Eye, Pencil, PlusIcon } from 'lucide-react';
import { useCallback, useEffect, useMemo } from 'react';
import { useQueryParams } from '@/hooks/use-query-params';
import { AsyncSelect, Button, type SelectValue } from '@/shared/components/atoms';
import { ListPageTemplate } from '@/shared/components/templates/ListPageTemplate';
import { Badge } from '@/shared/components/ui';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import type { BaseQueryParams } from '@/types/query-params';
import { ResourceAllocationDetailDrawer } from '../components/ResourceAllocationDetailDrawer';
import { ResourceAllocationFormDrawer } from '../components/ResourceAllocationFormDrawer';
import { RESOURCE_ALLOCATION_LABELS } from '../constants';
import { useMyProjects } from '../hooks/use-my-projects';
import { useResourceAllocationPage } from '../hooks/use-resource-allocation-page';
import type { ResourceAllocation } from '../types';

interface ResourceAllocationUrlParams extends BaseQueryParams {
  projectId?: string;
  status?: string;
  allocationId?: string;
}

function AllocationStatusCell({ status }: { status: string }) {
  const variant = status === 'allocated' ? 'info' : 'success';
  return <Badge variant={variant as any}>{status}</Badge>;
}

function AllocationActionsCell({
  row,
  onDetail,
  onEdit,
}: {
  row: { original: ResourceAllocation };
  onDetail: (r: ResourceAllocation) => void;
  onEdit: (r: ResourceAllocation) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-6 w-6 p-0">
          <EllipsisVertical className="h-4 w-4 text-slate-950" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onEdit(row.original)}>
          <Pencil className="mr-2 h-4 w-4" />
          {RESOURCE_ALLOCATION_LABELS.LIST.ACTIONS.EDIT}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onDetail(row.original)}>
          <Eye className="mr-2 h-4 w-4" />
          {RESOURCE_ALLOCATION_LABELS.LIST.ACTIONS.DETAIL}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function ResourceAllocationListPage() {
  const { queryParams, updateQueryParam, setQueryParams } =
    useQueryParams<ResourceAllocationUrlParams>();

  // ── Projects from /me ──
  const { options: projectOptions, isLoading: projectsLoading } = useMyProjects();
  const effectiveProjectId =
    typeof queryParams.projectId === 'string'
      ? queryParams.projectId
      : ((projectOptions[0]?.value as string | undefined) ?? undefined);

  useEffect(() => {
    if (!queryParams.projectId && effectiveProjectId) {
      updateQueryParam('projectId', effectiveProjectId);
    }
  }, [effectiveProjectId, queryParams.projectId, updateQueryParam]);

  const handleProjectChange = useCallback(
    (value: SelectValue) => {
      const id = Array.isArray(value) ? value[0] : value;
      if (id) {
        setQueryParams({ projectId: id as string, page: '1' } as any);
      }
    },
    [setQueryParams]
  );

  const params = useMemo(
    () => ({
      page: queryParams.page ?? 1,
      perPage: queryParams.perPage ?? 10,
      sortBy: queryParams.sortBy ?? 'code',
      sortOrder: (queryParams.sortOrder || 'asc') as 'asc' | 'desc',
      search: queryParams.search,
      status: queryParams.status,
      projectId: effectiveProjectId,
    }),
    [effectiveProjectId, queryParams]
  );

  const pageOptions = useMemo(
    () => ({
      params,
      projectId: effectiveProjectId,
      onUpdateQueryParam: updateQueryParam,
      onSetQueryParams: setQueryParams,
    }),
    [effectiveProjectId, params, updateQueryParam, setQueryParams]
  );

  const {
    allocations,
    totalItems,
    totalPages,
    isLoading,
    isError,
    handleAdd,
    handleEdit,
    handleDetail,
    openDetailById,
    detailTarget,
    handleDetailClose,
    handleDetailEdit,
    drawerOpen,
    editId,
    handleDrawerClose,
    handleDrawerSuccess,
  } = useResourceAllocationPage(pageOptions);

  // Deep-link support: /resource-management/allocation?allocationId=xxx
  // opens the detail drawer directly (e.g. from Stock Movement's Source link).
  const allocationIdParam =
    typeof queryParams.allocationId === 'string' ? queryParams.allocationId : undefined;

  useEffect(() => {
    if (allocationIdParam) {
      openDetailById(allocationIdParam);
    }
  }, [allocationIdParam, openDetailById]);

  const handleDetailDrawerClose = useCallback(() => {
    handleDetailClose();
    updateQueryParam('allocationId', undefined);
  }, [handleDetailClose, updateQueryParam]);

  const columns = useMemo<ColumnDef<ResourceAllocation>[]>(
    () => [
      { accessorKey: 'code', header: RESOURCE_ALLOCATION_LABELS.LIST.COLUMNS.CODE, size: 120 },
      {
        id: 'project',
        header: RESOURCE_ALLOCATION_LABELS.LIST.COLUMNS.PROJECT,
        size: 200,
        cell: ({ row }) => row.original.project?.name ?? '-',
      },
      {
        id: 'resource',
        header: RESOURCE_ALLOCATION_LABELS.LIST.COLUMNS.RESOURCE,
        size: 200,
        cell: ({ row }) => {
          const r = row.original;
          return r.resourceUnit?.itemCatalog?.name ?? r.itemCatalog?.name ?? '-';
        },
      },
      {
        accessorKey: 'allocationType',
        header: RESOURCE_ALLOCATION_LABELS.LIST.COLUMNS.TYPE,
        size: 120,
      },
      {
        id: 'dateRange',
        header: RESOURCE_ALLOCATION_LABELS.LIST.COLUMNS.ALLOCATION_DATE,
        size: 200,
        cell: ({ row }) => {
          const r = row.original;
          return `${r.allocatedFromDate} s/d ${r.allocatedToDate}`;
        },
      },
      {
        accessorKey: 'status',
        header: RESOURCE_ALLOCATION_LABELS.LIST.COLUMNS.STATUS,
        size: 120,
        cell: ({ row }) => <AllocationStatusCell status={row.original.status} />,
      },
      {
        id: 'actions',
        header: RESOURCE_ALLOCATION_LABELS.LIST.COLUMNS.ACTIONS,
        enableSorting: false,
        enableHiding: false,
        size: 60,
        cell: ({ row }) => (
          <AllocationActionsCell row={row} onDetail={handleDetail} onEdit={handleEdit} />
        ),
      },
    ],
    [handleEdit, handleDetail]
  );

  return (
    <>
      <ListPageTemplate<ResourceAllocation>
        title={RESOURCE_ALLOCATION_LABELS.LIST.TITLE}
        headerActions={
          <div className="flex items-center gap-2">
            <AsyncSelect
              className="w-52"
              options={projectOptions}
              value={effectiveProjectId ?? null}
              onChange={handleProjectChange}
              placeholder="Project"
              isSearchable={false}
              isClearable={false}
              isLoading={projectsLoading}
            />
            <Button onClick={handleAdd} leftIcon={<PlusIcon />}>
              {RESOURCE_ALLOCATION_LABELS.LIST.ADD_BUTTON}
            </Button>
          </div>
        }
        data={allocations}
        columns={columns}
        isLoading={isLoading}
        isError={isError}
        emptyMessage={RESOURCE_ALLOCATION_LABELS.LIST.EMPTY}
        search={queryParams.search}
        onSearchChange={(v) => updateQueryParam('search', v)}
        sortBy={params.sortBy}
        sortOrder={params.sortOrder}
        onSort={(sortBy, sortOrder) => setQueryParams({ sortBy, sortOrder })}
        page={params.page}
        perPage={params.perPage}
        totalItems={totalItems}
        totalPages={totalPages}
        onPaginationChange={(page, perPage) => setQueryParams({ page, perPage })}
      />

      <ResourceAllocationFormDrawer
        open={drawerOpen}
        onClose={handleDrawerClose}
        onSuccess={handleDrawerSuccess}
        editId={editId}
        projectId={effectiveProjectId!}
      />

      <ResourceAllocationDetailDrawer
        open={detailTarget !== null}
        onClose={handleDetailDrawerClose}
        onEdit={handleDetailEdit}
        id={detailTarget}
        projectId={effectiveProjectId!}
      />
    </>
  );
}
