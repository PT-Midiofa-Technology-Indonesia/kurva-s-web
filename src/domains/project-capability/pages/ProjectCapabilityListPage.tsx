'use client';

import type { ColumnDef, Row } from '@tanstack/react-table';
import { EllipsisVertical, Eye, Pencil, PlusIcon, Trash2 } from 'lucide-react';
import { useMemo } from 'react';
import { useQueryParams } from '@/hooks/use-query-params';
import { AsyncSelect, Button } from '@/shared/components/atoms';
import { ConfirmDialog } from '@/shared/components/molecules/AlertDialog';
import { ListPageTemplate } from '@/shared/components/templates/ListPageTemplate';
import { Badge, Separator } from '@/shared/components/ui';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import type { BaseQueryParams } from '@/types/query-params';
import { ProjectCapabilityDetailDrawer } from '../components/ProjectCapabilityDetailDrawer';
import { PROJECT_CAPABILITY_LABELS, STATUS_OPTIONS } from '../constants';
import { useProjectCapabilityPage } from '../hooks/use-project-capability-page';
import type { ProjectCapability } from '../types';

interface ProjectCapabilityUrlParams extends BaseQueryParams {
  isActive?: string;
}

function ProjectCapabilityActionsCell({
  row,
  onDetail,
  onEdit,
  onDeleteClick,
}: {
  row: Row<ProjectCapability>;
  onDetail?: (r: ProjectCapability) => void;
  onEdit?: (r: ProjectCapability) => void;
  onDeleteClick: (r: ProjectCapability) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-6 w-6 p-0">
          <EllipsisVertical className="h-4 w-4 text-slate-950" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onEdit?.(row.original)}>
          <Pencil className="mr-2 h-4 w-4" />
          {PROJECT_CAPABILITY_LABELS.LIST.ACTIONS.EDIT}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onDetail?.(row.original)}>
          <Eye className="mr-2 h-4 w-4" />
          {PROJECT_CAPABILITY_LABELS.LIST.ACTIONS.DETAIL}
        </DropdownMenuItem>
        <Separator className="flex-1 h-[0.05rem]" />
        <DropdownMenuItem
          onClick={() => onDeleteClick(row.original)}
          className="text-destructive focus:text-destructive"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          {PROJECT_CAPABILITY_LABELS.LIST.ACTIONS.DELETE}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function ProjectCapabilityListPage() {
  const { queryParams, updateQueryParam, setQueryParams } =
    useQueryParams<ProjectCapabilityUrlParams>();

  const params = useMemo(() => {
    const isActive =
      queryParams.isActive === 'true' ? true : queryParams.isActive === 'false' ? false : undefined;

    return {
      page: queryParams.page ?? 1,
      perPage: queryParams.perPage ?? 10,
      sortBy: queryParams.sortBy ?? 'name',
      sortOrder: (queryParams.sortOrder || 'asc') as 'asc' | 'desc',
      search: queryParams.search,
      isActive,
    };
  }, [queryParams]);

  const pageOptions = useMemo(
    () => ({
      params,
      onUpdateQueryParam: updateQueryParam,
      onSetQueryParams: setQueryParams,
    }),
    [params, updateQueryParam, setQueryParams]
  );

  const {
    projectCapabilities,
    totalItems,
    totalPages,
    isLoading,
    isError,
    handleAdd,
    handleEdit,
    handleDetail,
    detailTarget,
    handleDetailClose,
    handleDetailEdit,
    handleDetailSuccess,
    deleteTarget,
    setDeleteTarget,
    handleDeleteClick,
    handleDeleteConfirm,
    handleIsActiveChange,
    handleSearchChange,
    handleSort,
    handlePaginationChange,
  } = useProjectCapabilityPage(pageOptions);

  const columns = useMemo<ColumnDef<ProjectCapability>[]>(
    () => [
      {
        accessorKey: 'code',
        header: PROJECT_CAPABILITY_LABELS.LIST.COLUMNS.CODE,
        size: 100,
      },
      {
        accessorKey: 'name',
        header: PROJECT_CAPABILITY_LABELS.LIST.COLUMNS.NAME,
        size: 450,
      },
      {
        accessorKey: 'status',
        header: PROJECT_CAPABILITY_LABELS.LIST.COLUMNS.STATUS,
        cell: ({ row }) =>
          row.original.isActive ? (
            <Badge variant="success">{PROJECT_CAPABILITY_LABELS.LIST.STATUS.ACTIVE}</Badge>
          ) : (
            <Badge variant="destructive">{PROJECT_CAPABILITY_LABELS.LIST.STATUS.INACTIVE}</Badge>
          ),
      },
      {
        id: 'actions',
        header: PROJECT_CAPABILITY_LABELS.LIST.COLUMNS.ACTIONS,
        enableSorting: false,
        enableHiding: false,
        size: 60,
        cell: ({ row }) => (
          <ProjectCapabilityActionsCell
            row={row}
            onDetail={handleDetail}
            onEdit={handleEdit}
            onDeleteClick={handleDeleteClick}
          />
        ),
      },
    ],
    [handleDeleteClick, handleDetail, handleEdit]
  );

  const filters = useMemo(
    () => (
      <div className="flex gap-4">
        <AsyncSelect
          className="w-48 focus:ring-1 ring-primary"
          options={STATUS_OPTIONS}
          placeholder={PROJECT_CAPABILITY_LABELS.LIST.FILTERS.STATUS}
          isSearchable={false}
          onChange={handleIsActiveChange}
          isClearable
        />
      </div>
    ),
    [handleIsActiveChange]
  );

  return (
    <>
      <ListPageTemplate<ProjectCapability>
        title={PROJECT_CAPABILITY_LABELS.LIST.TITLE}
        headerActions={
          <Button onClick={handleAdd} leftIcon={<PlusIcon />}>
            {PROJECT_CAPABILITY_LABELS.LIST.ADD_BUTTON}
          </Button>
        }
        data={projectCapabilities}
        columns={columns}
        isLoading={isLoading}
        isError={isError}
        emptyMessage={PROJECT_CAPABILITY_LABELS.LIST.EMPTY}
        search={queryParams.search}
        onSearchChange={handleSearchChange}
        sortBy={params.sortBy}
        sortOrder={params.sortOrder}
        onSort={handleSort}
        page={params.page}
        perPage={params.perPage}
        totalItems={totalItems}
        totalPages={totalPages}
        onPaginationChange={handlePaginationChange}
        toolbarRight={filters}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        variant="danger"
        title={PROJECT_CAPABILITY_LABELS.DIALOG.DELETE_TITLE}
        description={PROJECT_CAPABILITY_LABELS.DIALOG.DELETE_DESCRIPTION}
        cancelText="Cancel"
        confirmText="Delete"
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
      />

      <ProjectCapabilityDetailDrawer
        open={detailTarget !== null}
        onClose={handleDetailClose}
        onEdit={handleDetailEdit}
        id={detailTarget}
        onSuccess={handleDetailSuccess}
      />
    </>
  );
}
