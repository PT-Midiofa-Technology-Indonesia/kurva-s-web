'use client';

import type { ColumnDef, Row } from '@tanstack/react-table';
import { EllipsisVertical, Eye, Pencil, PlusIcon, Trash2 } from 'lucide-react';
import { useMemo } from 'react';

import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { useQueryParams } from '@/hooks/use-query-params';
import { AsyncSelect, Button } from '@/shared/components/atoms';
import { ConfirmDialog } from '@/shared/components/molecules/AlertDialog';
import { ListPageTemplate } from '@/shared/components/templates/ListPageTemplate';
import { useUserTypes } from '@/shared/hooks/use-enums';
import { formatPhone } from '@/shared/utils/masks';
import type { BaseQueryParams } from '@/types/query-params';
import { toTitleCase } from '@/utils/string';
import type { GetUsersParams } from '../api/get-users';
import { USER_LABELS } from '../constants';
import { useUserManagementPage } from '../hooks/use-user-management-page';
import type { UserListItem } from '../types';

// URL query params — status, roleId, and userType are strings in the URL
interface UserManagementUrlParams extends BaseQueryParams {
  status?: string;
  roleId?: string;
  userType?: string;
}

// ─── Row actions cell ─────────────────────────────────────────────────────────

function UserActionsCell({
  row,
  onDetail,
  onEdit,
  onDeleteClick,
}: {
  row: Row<UserListItem>;
  onDetail?: (u: UserListItem) => void;
  onEdit?: (u: UserListItem) => void;
  onDeleteClick: (u: UserListItem) => void;
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
          {USER_LABELS.LIST.ACTIONS.EDIT}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onDetail?.(row.original)}>
          <Eye className="mr-2 h-4 w-4" />
          {USER_LABELS.LIST.ACTIONS.VIEW}
        </DropdownMenuItem>
        <Separator className="flex-1 h-[0.05rem]" />
        <DropdownMenuItem
          onClick={() => onDeleteClick(row.original)}
          className="text-destructive focus:text-destructive"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          {USER_LABELS.LIST.ACTIONS.DELETE}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function UserManagementPage() {
  const { queryParams, updateQueryParam, setQueryParams } =
    useQueryParams<UserManagementUrlParams>();
  const { data: userTypeOptions } = useUserTypes();

  // Convert URL strings to typed API params
  const params = useMemo(() => {
    const apiParams: GetUsersParams = {
      page: queryParams.page ?? 1,
      perPage: queryParams.perPage ?? 10,
      sortBy: queryParams.sortBy ?? 'name',
      sortOrder: queryParams.sortOrder || ('asc' as const),
      search: queryParams.search,
    };

    if (queryParams.status) {
      apiParams.status = queryParams.status as 'active' | 'inactive';
    }
    if (queryParams.roleId) {
      apiParams.roleId = queryParams.roleId;
    }
    if (queryParams.userType) {
      apiParams.userType = queryParams.userType;
    }

    return apiParams;
  }, [queryParams]);

  const selectedUserTypeOption = useMemo(
    () => userTypeOptions?.find((option) => option.value === queryParams.userType),
    [queryParams.userType, userTypeOptions]
  );

  const pageOptions = useMemo(
    () => ({
      params,
      onUpdateQueryParam: updateQueryParam,
      onSetQueryParams: setQueryParams,
    }),
    [params, updateQueryParam, setQueryParams]
  );

  const {
    users,
    totalItems,
    totalPages,
    isLoading,
    isError,
    handleAdd,
    handleEdit,
    handleDetail,
    deleteTarget,
    setDeleteTarget,
    handleDeleteClick,
    handleDeleteConfirm,
    isDeleting,
    handleRoleChange,
    handleUserTypeChange,
    handleSearchChange,
    handleSort,
    handlePaginationChange,
    roleOptions,
    isLoadingRoles,
    handleLoadMoreRoles,
    handleRoleSearchChange,
  } = useUserManagementPage(pageOptions);

  const selectedRoleOption = useMemo(
    () => roleOptions.find((option) => option.value === queryParams.roleId),
    [queryParams.roleId, roleOptions]
  );

  // ── Columns ──────────────────────────────────────────────────────────────
  const columns: ColumnDef<UserListItem>[] = useMemo(
    () => [
      {
        accessorKey: 'name',
        header: USER_LABELS.LIST.COLUMNS.USER,
        cell: ({ row }) => <span className="text-sm text-slate-950">{row.original.name}</span>,
      },
      {
        accessorKey: 'email',
        header: USER_LABELS.LIST.COLUMNS.EMAIL,
        enableSorting: false,
        cell: ({ row }) => <span className="text-sm text-slate-500">{row.original.email}</span>,
      },
      {
        accessorKey: 'phoneNumber',
        header: USER_LABELS.LIST.COLUMNS.PHONE,
        enableSorting: false,
        cell: ({ row }) => (
          <span className="text-sm text-slate-500">
            {formatPhone(row.original.phoneNumber) ?? '-'}
          </span>
        ),
      },
      {
        accessorKey: 'role',
        header: USER_LABELS.LIST.COLUMNS.ROLE,
        cell: ({ row }) => (
          <span className="text-sm text-slate-500">{row.original.role?.name ?? '-'}</span>
        ),
      },
      {
        accessorKey: 'userType',
        header: USER_LABELS.LIST.COLUMNS.USER_TYPE,
        cell: ({ row }) => (
          <span className="text-sm text-slate-950">{toTitleCase(row.original.userType)}</span>
        ),
      },
      {
        accessorKey: 'status',
        header: USER_LABELS.LIST.COLUMNS.STATUS,
        cell: ({ row }) =>
          row.original.isActive ? (
            <Badge variant="success">{USER_LABELS.LIST.STATUS.ACTIVE}</Badge>
          ) : (
            <Badge variant="destructive">{USER_LABELS.LIST.STATUS.INACTIVE}</Badge>
          ),
      },
      {
        id: 'actions',
        header: USER_LABELS.LIST.COLUMNS.ACTIONS,
        enableSorting: false,
        enableHiding: false,
        size: 60,
        cell: ({ row }) => (
          <UserActionsCell
            row={row}
            onEdit={handleEdit}
            onDetail={handleDetail}
            onDeleteClick={handleDeleteClick}
          />
        ),
      },
    ],
    [handleEdit, handleDetail, handleDeleteClick]
  );

  // ── Filters ──────────────────────────────────────────────────────────────
  const roleFilter = (
    <AsyncSelect
      className="w-40"
      aria-label={USER_LABELS.LIST.FILTERS.ROLE}
      value={selectedRoleOption?.value}
      options={roleOptions}
      placeholder={USER_LABELS.LIST.FILTERS.ROLE}
      isSearchable
      isLoading={isLoadingRoles}
      onChange={handleRoleChange}
      onScrollToBottom={handleLoadMoreRoles}
      onSearchChange={handleRoleSearchChange}
    />
  );

  const userTypeFilter = (
    <AsyncSelect
      className="w-44"
      aria-label={USER_LABELS.LIST.FILTERS.USER_TYPE}
      value={selectedUserTypeOption?.value}
      options={userTypeOptions ?? []}
      placeholder={USER_LABELS.LIST.FILTERS.USER_TYPE}
      isSearchable={false}
      onChange={handleUserTypeChange}
    />
  );

  return (
    <>
      <ListPageTemplate<UserListItem>
        title={USER_LABELS.LIST.PAGE_TITLE}
        headerActions={
          <Button onClick={handleAdd} leftIcon={<PlusIcon />}>
            {USER_LABELS.LIST.ADD_BUTTON}
          </Button>
        }
        data={users}
        columns={columns}
        isLoading={isLoading}
        isError={isError}
        emptyMessage={USER_LABELS.LIST.EMPTY}
        search={queryParams.search}
        searchPlaceholder={USER_LABELS.LIST.SEARCH_PLACEHOLDER}
        onSearchChange={handleSearchChange}
        sortBy={params.sortBy}
        sortOrder={params.sortOrder}
        onSort={handleSort}
        page={params.page}
        perPage={params.perPage}
        totalItems={totalItems}
        totalPages={totalPages}
        onPaginationChange={handlePaginationChange}
        toolbarRight={
          <div className="flex gap-3">
            {roleFilter}
            {userTypeFilter}
          </div>
        }
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        variant="danger"
        title={USER_LABELS.DETAIL?.DELETE_DIALOG.TITLE ?? 'Hapus User?'}
        description={
          USER_LABELS.DETAIL?.DELETE_DIALOG.DESCRIPTION ??
          'Anda akan menghapus user ini secara permanen.'
        }
        cancelText={USER_LABELS.DETAIL?.DELETE_DIALOG.CANCEL ?? 'Batal'}
        confirmText={USER_LABELS.DETAIL?.DELETE_DIALOG.CONFIRM ?? 'Hapus'}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        isLoading={isDeleting}
      />
    </>
  );
}
