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
import type { BaseQueryParams } from '@/types/query-params';
import { VENDOR_CATALOG_LABELS } from '../constants';
import { useVendorCatalogPage } from '../hooks/use-vendor-catalog-page';
import type { VendorCatalog } from '../types';

interface VendorUrlParams extends BaseQueryParams {
  isActive?: string;
}

function VendorTypeCell({ vendor }: { vendor: VendorCatalog }) {
  const types: string[] = [];
  if (vendor.isSubcontractor) types.push('Subcontractor');
  if (vendor.isSupplier) types.push('Supplier');
  if (vendor.isLogistic) types.push('Logistic');

  if (types.length === 0) return <span className="text-xs text-slate-400">-</span>;

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {types.map((type) => (
        <Badge key={type} variant="secondary" className="text-[11px] font-normal px-1.5 py-0 h-5">
          {type}
        </Badge>
      ))}
    </div>
  );
}

function VendorActionsCell({
  row,
  onDetail,
  onEdit,
  onDeleteClick,
}: {
  row: Row<VendorCatalog>;
  onDetail?: (r: VendorCatalog) => void;
  onEdit?: (r: VendorCatalog) => void;
  onDeleteClick: (r: VendorCatalog) => void;
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
          {VENDOR_CATALOG_LABELS.LIST.ACTIONS.EDIT}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onDetail?.(row.original)}>
          <Eye className="mr-2 h-4 w-4" />
          {VENDOR_CATALOG_LABELS.LIST.ACTIONS.DETAIL}
        </DropdownMenuItem>
        <Separator className="flex-1 h-[0.05rem]" />
        <DropdownMenuItem
          onClick={() => onDeleteClick(row.original)}
          className="text-destructive focus:text-destructive"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          {VENDOR_CATALOG_LABELS.LIST.ACTIONS.DELETE}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function VendorCatalogListPage() {
  const { queryParams, updateQueryParam, setQueryParams } = useQueryParams<VendorUrlParams>();

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
    vendors,
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
    handleIsActiveChange,
    handleSearchChange,
    handleSort,
    handlePaginationChange,
  } = useVendorCatalogPage(pageOptions);

  const columns = useMemo<ColumnDef<VendorCatalog>[]>(
    () => [
      {
        accessorKey: 'code',
        header: VENDOR_CATALOG_LABELS.LIST.COLUMNS.CODE,
        size: 120,
      },
      {
        accessorKey: 'name',
        header: VENDOR_CATALOG_LABELS.LIST.COLUMNS.NAME,
        size: 280,
      },
      {
        id: 'type',
        header: VENDOR_CATALOG_LABELS.LIST.COLUMNS.TYPE,
        size: 200,
        enableSorting: false,
        cell: ({ row }) => <VendorTypeCell vendor={row.original} />,
      },
      {
        accessorKey: 'status',
        header: VENDOR_CATALOG_LABELS.LIST.COLUMNS.STATUS,
        cell: ({ row }) =>
          row.original.isActive ? (
            <Badge variant="success">{VENDOR_CATALOG_LABELS.LIST.STATUS.ACTIVE}</Badge>
          ) : (
            <Badge variant="destructive">{VENDOR_CATALOG_LABELS.LIST.STATUS.INACTIVE}</Badge>
          ),
      },
      {
        id: 'actions',
        header: VENDOR_CATALOG_LABELS.LIST.COLUMNS.ACTIONS,
        enableSorting: false,
        enableHiding: false,
        size: 60,
        cell: ({ row }) => (
          <VendorActionsCell
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
          options={COMMON_STATUS_OPTIONS}
          value={queryParams.isActive ?? null}
          placeholder={VENDOR_CATALOG_LABELS.LIST.FILTERS.STATUS}
          isSearchable={false}
          onChange={handleIsActiveChange}
          isClearable
        />
      </div>
    ),
    [handleIsActiveChange, queryParams.isActive]
  );

  return (
    <>
      <ListPageTemplate<VendorCatalog>
        title={VENDOR_CATALOG_LABELS.LIST.TITLE}
        headerActions={
          <Button onClick={handleAdd} leftIcon={<PlusIcon />}>
            {VENDOR_CATALOG_LABELS.LIST.ADD_BUTTON}
          </Button>
        }
        data={vendors}
        columns={columns}
        isLoading={isLoading}
        isError={isError}
        emptyMessage={VENDOR_CATALOG_LABELS.LIST.EMPTY}
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
        title={VENDOR_CATALOG_LABELS.DIALOG.DELETE_TITLE}
        description={VENDOR_CATALOG_LABELS.DIALOG.DELETE_DESCRIPTION}
        cancelText="Cancel"
        confirmText="Delete"
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
      />
    </>
  );
}
