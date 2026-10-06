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
import { OfficeDetailDrawer } from '../components/OfficeDetailDrawer';
import { OFFICE_LABELS, STATUS_OPTIONS } from '../constants';
import { useOfficePage } from '../hooks/use-office-page';
import type { OfficeListItem } from '../types';

interface OfficeUrlParams extends BaseQueryParams {
  isActive?: string;
}

function OfficeActionsCell({
  row,
  onDetail,
  onEdit,
  onDeleteClick,
}: {
  row: Row<OfficeListItem>;
  onDetail?: (r: OfficeListItem) => void;
  onEdit?: (r: OfficeListItem) => void;
  onDeleteClick: (r: OfficeListItem) => void;
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
          {OFFICE_LABELS.LIST.ACTIONS.EDIT}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onDetail?.(row.original)}>
          <Eye className="mr-2 h-4 w-4" />
          {OFFICE_LABELS.LIST.ACTIONS.DETAIL}
        </DropdownMenuItem>
        <Separator className="flex-1 h-[0.05rem]" />
        <DropdownMenuItem
          onClick={() => onDeleteClick(row.original)}
          className="text-destructive focus:text-destructive"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          {OFFICE_LABELS.LIST.ACTIONS.DELETE}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function OfficeListPage() {
  const { queryParams, updateQueryParam, setQueryParams } = useQueryParams<OfficeUrlParams>();

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
    offices,
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
  } = useOfficePage(pageOptions);

  const columns = useMemo<ColumnDef<OfficeListItem>[]>(
    () => [
      {
        accessorKey: 'code',
        header: OFFICE_LABELS.LIST.COLUMNS.CODE,
        size: 100,
      },
      {
        accessorKey: 'name',
        header: OFFICE_LABELS.LIST.COLUMNS.NAME,
        size: 250,
      },
      {
        accessorKey: 'type',
        header: OFFICE_LABELS.LIST.COLUMNS.TYPE,
        cell: ({ row }) => {
          const type = row.original.type;
          return type === 'main_office'
            ? 'Kantor Pusat'
            : type === 'branch_office'
              ? 'Kantor Cabang'
              : type;
        },
        size: 150,
      },
      {
        accessorKey: 'company',
        header: OFFICE_LABELS.LIST.COLUMNS.COMPANY,
        cell: ({ row }) => (
          <span className="text-sm text-slate-700">{row.original.company?.name ?? '-'}</span>
        ),
        size: 200,
      },
      {
        id: 'workTime',
        header: OFFICE_LABELS.LIST.COLUMNS.WORK_TIME,
        cell: ({ row }) => {
          const start = row.original.workStartTime;
          const end = row.original.workEndTime;
          return (
            <span className="text-sm text-slate-700">
              {start && end ? `${start} - ${end}` : '-'}
            </span>
          );
        },
        size: 160,
      },
      {
        accessorKey: 'status',
        header: OFFICE_LABELS.LIST.COLUMNS.STATUS,
        cell: ({ row }) =>
          row.original.isActive ? (
            <Badge variant="success">{OFFICE_LABELS.LIST.STATUS.ACTIVE}</Badge>
          ) : (
            <Badge variant="destructive">{OFFICE_LABELS.LIST.STATUS.INACTIVE}</Badge>
          ),
        size: 120,
      },
      {
        id: 'actions',
        header: OFFICE_LABELS.LIST.COLUMNS.ACTIONS,
        enableSorting: false,
        enableHiding: false,
        size: 60,
        cell: ({ row }) => (
          <OfficeActionsCell
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
      <AsyncSelect
        className="w-48 focus:ring-1 ring-primary"
        options={STATUS_OPTIONS}
        value={queryParams.isActive ?? null}
        placeholder={OFFICE_LABELS.LIST.FILTERS.STATUS}
        isSearchable={false}
        onChange={handleIsActiveChange}
        isClearable
      />
    ),
    [handleIsActiveChange, queryParams.isActive]
  );

  return (
    <>
      <ListPageTemplate<OfficeListItem>
        title={OFFICE_LABELS.LIST.TITLE}
        headerActions={
          <Button onClick={handleAdd} leftIcon={<PlusIcon />}>
            {OFFICE_LABELS.LIST.ADD_BUTTON}
          </Button>
        }
        data={offices}
        columns={columns}
        isLoading={isLoading}
        isError={isError}
        emptyMessage={OFFICE_LABELS.LIST.EMPTY}
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
        title={OFFICE_LABELS.DIALOG.DELETE_TITLE}
        description={OFFICE_LABELS.DIALOG.DELETE_DESCRIPTION}
        cancelText="Cancel"
        confirmText="Delete"
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
      />

      <OfficeDetailDrawer
        open={detailTarget !== null}
        onClose={handleDetailClose}
        onEdit={handleDetailEdit}
        id={detailTarget}
        onSuccess={handleDetailSuccess}
      />
    </>
  );
}
