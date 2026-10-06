'use client';

import type { ColumnDef } from '@tanstack/react-table';
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
import { toTitleCase } from '@/shared/utils/string';
import type { BaseQueryParams } from '@/types/query-params';
import { WarehouseDetailDrawer } from '../components/WarehouseDetailDrawer';
import { STATUS_OPTIONS, WAREHOUSE_LABELS } from '../constants';
import { useWarehousePage } from '../hooks/use-warehouse-page';
import type { WarehouseListItem } from '../types';

interface WarehouseUrlParams extends BaseQueryParams {
  isActive?: string;
}

function WarehouseActionsCell({
  row,
  onDetail,
  onEdit,
  onDeleteClick,
}: {
  row: { original: WarehouseListItem };
  onDetail?: (r: WarehouseListItem) => void;
  onEdit?: (r: WarehouseListItem) => void;
  onDeleteClick: (r: WarehouseListItem) => void;
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
          {WAREHOUSE_LABELS.LIST.ACTIONS.EDIT}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onDetail?.(row.original)}>
          <Eye className="mr-2 h-4 w-4" />
          {WAREHOUSE_LABELS.LIST.ACTIONS.DETAIL}
        </DropdownMenuItem>
        <Separator className="flex-1 h-[0.05rem]" />
        <DropdownMenuItem
          onClick={() => onDeleteClick(row.original)}
          className="text-destructive focus:text-destructive"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          {WAREHOUSE_LABELS.LIST.ACTIONS.DELETE}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function WarehouseListPage() {
  const { queryParams, updateQueryParam, setQueryParams } = useQueryParams<WarehouseUrlParams>();

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
    warehouses,
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
  } = useWarehousePage(pageOptions);

  const columns = useMemo<ColumnDef<WarehouseListItem>[]>(
    () => [
      {
        accessorKey: 'type',
        header: WAREHOUSE_LABELS.LIST.COLUMNS.TYPE,
        size: 150,
        cell: ({ row }) => <Badge variant="secondary">{toTitleCase(row.original.type)}</Badge>,
      },
      {
        accessorKey: 'code',
        header: WAREHOUSE_LABELS.LIST.COLUMNS.CODE,
        size: 120,
      },
      {
        accessorKey: 'name',
        header: WAREHOUSE_LABELS.LIST.COLUMNS.NAME,
        size: 250,
      },
      {
        accessorKey: 'workStartTime',
        header: WAREHOUSE_LABELS.LIST.COLUMNS.WORK_START_TIME,
        cell: ({ row }) => (
          <span className="text-sm text-slate-700">{row.original.workStartTime ?? '-'}</span>
        ),
        size: 120,
      },
      {
        accessorKey: 'workEndTime',
        header: WAREHOUSE_LABELS.LIST.COLUMNS.WORK_END_TIME,
        cell: ({ row }) => (
          <span className="text-sm text-slate-700">{row.original.workEndTime ?? '-'}</span>
        ),
        size: 120,
      },
      {
        id: 'company',
        header: WAREHOUSE_LABELS.LIST.COLUMNS.COMPANY,
        cell: ({ row }) => (
          <span className="text-sm text-slate-700">
            {row.original.company
              ? `${row.original.company.code} - ${row.original.company.name}`
              : '-'}
          </span>
        ),
        size: 250,
      },
      {
        accessorKey: 'status',
        header: WAREHOUSE_LABELS.LIST.COLUMNS.STATUS,
        cell: ({ row }) =>
          row.original.isActive ? (
            <Badge variant="success">{WAREHOUSE_LABELS.LIST.STATUS.ACTIVE}</Badge>
          ) : (
            <Badge variant="destructive">{WAREHOUSE_LABELS.LIST.STATUS.INACTIVE}</Badge>
          ),
        size: 120,
      },
      {
        id: 'actions',
        header: WAREHOUSE_LABELS.LIST.COLUMNS.ACTIONS,
        enableSorting: false,
        enableHiding: false,
        size: 60,
        cell: ({ row }) => (
          <WarehouseActionsCell
            row={row}
            onDetail={handleDetail}
            onEdit={handleEdit}
            onDeleteClick={handleDeleteClick}
          />
        ),
      },
    ],
    [handleDeleteClick, handleEdit, handleDetail]
  );

  const filters = useMemo(
    () => (
      <AsyncSelect
        className="w-48 focus:ring-1 ring-primary"
        options={STATUS_OPTIONS}
        value={queryParams.isActive ?? null}
        placeholder={WAREHOUSE_LABELS.LIST.FILTERS.STATUS}
        isSearchable={false}
        onChange={handleIsActiveChange}
        isClearable
      />
    ),
    [handleIsActiveChange, queryParams.isActive]
  );

  return (
    <>
      <ListPageTemplate<WarehouseListItem>
        title={WAREHOUSE_LABELS.LIST.TITLE}
        headerActions={
          <Button onClick={handleAdd} leftIcon={<PlusIcon />}>
            {WAREHOUSE_LABELS.LIST.ADD_BUTTON}
          </Button>
        }
        data={warehouses}
        columns={columns}
        isLoading={isLoading}
        isError={isError}
        emptyMessage={WAREHOUSE_LABELS.LIST.EMPTY}
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

      <WarehouseDetailDrawer
        open={detailTarget !== null}
        onClose={handleDetailClose}
        onEdit={handleDetailEdit}
        id={detailTarget}
        onSuccess={handleDetailSuccess}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        variant="danger"
        title={WAREHOUSE_LABELS.DIALOG.DELETE_TITLE}
        description={WAREHOUSE_LABELS.DIALOG.DELETE_DESCRIPTION}
        cancelText="Cancel"
        confirmText="Delete"
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
      />
    </>
  );
}
