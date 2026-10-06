'use client';

import { type ColumnDef, type Row } from '@tanstack/react-table';
import { EllipsisVertical, Eye, Pencil, PlusIcon, Trash2, User } from 'lucide-react';
import { useMemo } from 'react';

import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useQueryParams } from '@/hooks/use-query-params';
import { AsyncSelect, Button } from '@/shared/components/atoms';
import { ConfirmDialog } from '@/shared/components/molecules/AlertDialog';
import { ListPageTemplate } from '@/shared/components/templates/ListPageTemplate';
import { Separator } from '@/shared/components/ui';
import { COMMON_STATUS_OPTIONS } from '@/shared/constants';
import type { BaseQueryParams } from '@/types/query-params';

import { ROLE_LABELS } from '../constants';
import { useRolePermissionsPage } from '../hooks/use-role-permissions-page';
import type { Role } from '../types';

// URL query params — isActive is a string in the URL
interface RolePermissionsUrlParams extends BaseQueryParams {
  isActive?: string;
}

// ─── Row actions cell ─────────────────────────────────────────────────────────

function RoleActionsCell({
  row,
  onDetail,
  onEdit,
  onDeleteClick,
}: {
  row: Row<Role>;
  onDetail?: (r: Role) => void;
  onEdit?: (r: Role) => void;
  onDeleteClick: (r: Role) => void;
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
          {ROLE_LABELS.LIST.ACTIONS.EDIT}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onDetail?.(row.original)}>
          <Eye className="mr-2 h-4 w-4" />
          {ROLE_LABELS.LIST.ACTIONS.DETAIL}
        </DropdownMenuItem>
        <Separator className="flex-1 h-[0.05rem]" />
        <DropdownMenuItem
          onClick={() => onDeleteClick(row.original)}
          className="text-destructive focus:text-destructive"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          {ROLE_LABELS.LIST.ACTIONS.DELETE}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function RolePermissionsPage() {
  const { queryParams, updateQueryParam, setQueryParams } =
    useQueryParams<RolePermissionsUrlParams>();

  // Convert URL strings to typed API params
  const params = useMemo(() => {
    const isActive =
      queryParams.isActive === 'true' ? true : queryParams.isActive === 'false' ? false : undefined;

    return {
      page: queryParams.page ?? 1,
      perPage: queryParams.perPage ?? 10,
      sortBy: queryParams.sortBy ?? 'name',
      sortOrder: queryParams.sortOrder || ('asc' as const),
      search: queryParams.search,
      isActive,
    };
  }, [
    queryParams.page,
    queryParams.perPage,
    queryParams.sortBy,
    queryParams.sortOrder,
    queryParams.search,
    queryParams.isActive,
  ]);

  const pageOptions = useMemo(
    () => ({
      params,
      onUpdateQueryParam: updateQueryParam,
      onSetQueryParams: setQueryParams,
    }),
    [params, updateQueryParam, setQueryParams]
  );

  const {
    roles,
    totalItems,
    totalPages,
    isLoading,
    isError,
    handleAdd,
    handleDetail,
    handleEdit,
    deleteTarget,
    setDeleteTarget,
    handleDeleteClick,
    handleDeleteConfirm,
    isDeleting,
    handleIsActiveChange,
    handleSearchChange,
    handleSort,
    handlePaginationChange,
  } = useRolePermissionsPage(pageOptions);

  // ── Columns ──────────────────────────────────────────────────────────────
  const columns: ColumnDef<Role>[] = useMemo(
    () => [
      {
        accessorKey: 'name',
        header: ROLE_LABELS.LIST.COLUMNS.ROLE,
        cell: ({ row }) => <span className="text-sm text-slate-950">{row.original.name}</span>,
      },
      {
        accessorKey: 'usersCount',
        header: ROLE_LABELS.LIST.COLUMNS.USERS_COUNT,
        enableSorting: false,
        cell: ({ row }) => (
          <span className="text-sm text-slate-950 flex items-center gap-1">
            <User size={14} />
            {row.original.usersCount ?? '-'}
          </span>
        ),
      },
      {
        accessorKey: 'status',
        header: ROLE_LABELS.LIST.COLUMNS.STATUS,
        cell: ({ row }) =>
          row.original.isActive ? (
            <Badge variant="success">{ROLE_LABELS.LIST.STATUS.ACTIVE}</Badge>
          ) : (
            <Badge variant="destructive">{ROLE_LABELS.LIST.STATUS.INACTIVE}</Badge>
          ),
      },
      {
        id: 'actions',
        header: ROLE_LABELS.LIST.COLUMNS.ACTIONS,
        enableSorting: false,
        enableHiding: false,
        size: 60,
        cell: ({ row }) => (
          <RoleActionsCell
            row={row}
            onDetail={handleDetail}
            onEdit={handleEdit}
            onDeleteClick={handleDeleteClick}
          />
        ),
      },
    ],
    [handleDetail, handleEdit, handleDeleteClick]
  );

  // ── Status filter ─────────────────────────────────────────────────────────
  const statusFilter = (
    <AsyncSelect
      className="w-60 focus:ring-1 ring-primary"
      aria-label="Status"
      value={queryParams.isActive ?? 'all'}
      options={[{ label: 'Status', value: 'all' }, ...COMMON_STATUS_OPTIONS]}
      placeholder="Status"
      isSearchable={false}
      onChange={handleIsActiveChange}
    />
  );

  return (
    <>
      <ListPageTemplate<Role>
        title={ROLE_LABELS.LIST.PAGE_TITLE}
        headerActions={
          <Button onClick={handleAdd} leftIcon={<PlusIcon />}>
            {ROLE_LABELS.LIST.ADD_BUTTON}
          </Button>
        }
        data={roles}
        columns={columns}
        isLoading={isLoading}
        isError={isError}
        emptyMessage={ROLE_LABELS.LIST.EMPTY}
        search={queryParams.search}
        searchPlaceholder={ROLE_LABELS.LIST.SEARCH_PLACEHOLDER}
        onSearchChange={handleSearchChange}
        sortBy={params.sortBy}
        sortOrder={params.sortOrder}
        onSort={handleSort}
        page={params.page}
        perPage={params.perPage}
        totalItems={totalItems}
        totalPages={totalPages}
        onPaginationChange={handlePaginationChange}
        toolbarRight={statusFilter}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        variant="danger"
        title={ROLE_LABELS.DETAIL.DELETE_DIALOG.TITLE}
        description={ROLE_LABELS.DETAIL.DELETE_DIALOG.DESCRIPTION}
        cancelText={ROLE_LABELS.DETAIL.DELETE_DIALOG.CANCEL}
        confirmText={ROLE_LABELS.DETAIL.DELETE_DIALOG.CONFIRM}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        isLoading={isDeleting}
      />
    </>
  );
}
