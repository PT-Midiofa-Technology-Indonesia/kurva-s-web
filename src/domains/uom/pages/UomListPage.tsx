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
import { COMMON_STATUS_OPTIONS } from '@/shared/constants';
import { useUomGroups } from '@/shared/hooks/use-enums';
import type { BaseQueryParams } from '@/types/query-params';
import { UomDetailDrawer } from '../components/UomDetailDrawer';
import { UOM_LABELS } from '../constants';
import { useUomPage } from '../hooks/use-uom-page';
import type { Uom } from '../types';

interface UomUrlParams extends BaseQueryParams {
  isActive?: string;
  group?: string;
}

function UomActionsCell({
  row,
  onDetail,
  onEdit,
  onDeleteClick,
}: {
  row: Row<Uom>;
  onDetail?: (r: Uom) => void;
  onEdit?: (r: Uom) => void;
  onDeleteClick: (r: Uom) => void;
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
          {UOM_LABELS.LIST.ACTIONS.EDIT}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onDetail?.(row.original)}>
          <Eye className="mr-2 h-4 w-4" />
          {UOM_LABELS.LIST.ACTIONS.DETAIL}
        </DropdownMenuItem>
        <Separator className="flex-1 h-[0.05rem]" />
        <DropdownMenuItem
          onClick={() => onDeleteClick(row.original)}
          className="text-destructive focus:text-destructive"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          {UOM_LABELS.LIST.ACTIONS.DELETE}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function UomListPage() {
  const { queryParams, updateQueryParam, setQueryParams } = useQueryParams<UomUrlParams>();
  const { data: uomGroupOptions = [] } = useUomGroups();

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
      group: queryParams.group,
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
    uoms,
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
    handleGroupChange,
    handleSearchChange,
    handleSort,
    handlePaginationChange,
  } = useUomPage(pageOptions);

  const columns = useMemo<ColumnDef<Uom>[]>(
    () => [
      {
        accessorKey: 'code',
        header: UOM_LABELS.LIST.COLUMNS.CODE,
        size: 100,
      },
      {
        accessorKey: 'name',
        header: UOM_LABELS.LIST.COLUMNS.NAME,
        size: 200,
      },
      {
        accessorKey: 'group',
        header: UOM_LABELS.LIST.COLUMNS.GROUP,
        size: 120,
      },
      {
        accessorKey: 'status',
        header: UOM_LABELS.LIST.COLUMNS.STATUS,
        cell: ({ row }) =>
          row.original.isActive ? (
            <Badge variant="success">{UOM_LABELS.LIST.STATUS.ACTIVE}</Badge>
          ) : (
            <Badge variant="destructive">{UOM_LABELS.LIST.STATUS.INACTIVE}</Badge>
          ),
      },
      {
        id: 'actions',
        header: UOM_LABELS.LIST.COLUMNS.ACTIONS,
        enableSorting: false,
        enableHiding: false,
        size: 60,
        cell: ({ row }) => (
          <UomActionsCell
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
      <div className="flex gap-3">
        <AsyncSelect
          className="w-48 focus:ring-1 ring-primary"
          options={uomGroupOptions}
          value={typeof queryParams.group === 'string' ? queryParams.group : null}
          placeholder={UOM_LABELS.LIST.FILTERS.GROUP}
          isSearchable={false}
          onChange={handleGroupChange}
          isClearable
        />
        <AsyncSelect
          className="w-48 focus:ring-1 ring-primary"
          options={COMMON_STATUS_OPTIONS}
          value={typeof queryParams.isActive === 'string' ? queryParams.isActive : null}
          placeholder={UOM_LABELS.LIST.FILTERS.STATUS}
          isSearchable={false}
          onChange={handleIsActiveChange}
          isClearable
        />
      </div>
    ),
    [
      handleIsActiveChange,
      handleGroupChange,
      uomGroupOptions,
      queryParams.group,
      queryParams.isActive,
    ]
  );

  return (
    <>
      <ListPageTemplate<Uom>
        title={UOM_LABELS.LIST.TITLE}
        headerActions={
          <Button onClick={handleAdd} leftIcon={<PlusIcon />}>
            {UOM_LABELS.LIST.ADD_BUTTON}
          </Button>
        }
        data={uoms}
        columns={columns}
        isLoading={isLoading}
        isError={isError}
        emptyMessage={UOM_LABELS.LIST.EMPTY}
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
        title={UOM_LABELS.DIALOG.DELETE_TITLE}
        description={UOM_LABELS.DIALOG.DELETE_DESCRIPTION}
        cancelText="Cancel"
        confirmText="Delete"
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
      />

      <UomDetailDrawer
        open={detailTarget !== null}
        id={detailTarget}
        onClose={handleDetailClose}
        onEdit={handleDetailEdit}
        onSuccess={handleDetailSuccess}
      />
    </>
  );
}
