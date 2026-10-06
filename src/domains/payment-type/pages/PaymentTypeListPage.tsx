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
import { PaymentTypeDetailDrawer } from '../components/PaymentTypeDetailDrawer';
import { PAYMENT_TYPE_LABELS, STATUS_OPTIONS } from '../constants';
import { usePaymentTypePage } from '../hooks/use-payment-type-page';
import type { PaymentType } from '../types';

interface PaymentTypeUrlParams extends BaseQueryParams {
  isActive?: string;
}

function PaymentTypeActionsCell({
  row,
  onDetail,
  onEdit,
  onDeleteClick,
}: {
  row: Row<PaymentType>;
  onDetail?: (r: PaymentType) => void;
  onEdit?: (r: PaymentType) => void;
  onDeleteClick: (r: PaymentType) => void;
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
          {PAYMENT_TYPE_LABELS.LIST.ACTIONS.EDIT}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onDetail?.(row.original)}>
          <Eye className="mr-2 h-4 w-4" />
          {PAYMENT_TYPE_LABELS.LIST.ACTIONS.DETAIL}
        </DropdownMenuItem>
        <Separator className="flex-1 h-[0.05rem]" />
        <DropdownMenuItem
          onClick={() => onDeleteClick(row.original)}
          className="text-destructive focus:text-destructive"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          {PAYMENT_TYPE_LABELS.LIST.ACTIONS.DELETE}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function PaymentTypeListPage() {
  const { queryParams, updateQueryParam, setQueryParams } = useQueryParams<PaymentTypeUrlParams>();

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
    paymentTypes,
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
  } = usePaymentTypePage(pageOptions);

  void PaymentTypeActionsCell;
  void PlusIcon;
  void handleAdd;
  void handleEdit;
  void handleDetail;
  void handleDeleteClick;

  const columns = useMemo<ColumnDef<PaymentType>[]>(
    () => [
      {
        accessorKey: 'code',
        header: PAYMENT_TYPE_LABELS.LIST.COLUMNS.CODE,
        size: 100,
      },
      {
        accessorKey: 'name',
        header: PAYMENT_TYPE_LABELS.LIST.COLUMNS.NAME,
        size: 350,
      },
      {
        accessorKey: 'status',
        header: PAYMENT_TYPE_LABELS.LIST.COLUMNS.STATUS,
        cell: ({ row }) =>
          row.original.isActive ? (
            <Badge variant="success">{PAYMENT_TYPE_LABELS.LIST.STATUS.ACTIVE}</Badge>
          ) : (
            <Badge variant="destructive">{PAYMENT_TYPE_LABELS.LIST.STATUS.INACTIVE}</Badge>
          ),
      },
      // hanya sementara
      // {
      //   id: 'actions',
      //   header: PAYMENT_TYPE_LABELS.LIST.COLUMNS.ACTIONS,
      //   enableSorting: false,
      //   enableHiding: false,
      //   size: 60,
      //   cell: ({ row }) => (
      //     <PaymentTypeActionsCell
      //       row={row}
      //       onDetail={handleDetail}
      //       onEdit={handleEdit}
      //       onDeleteClick={handleDeleteClick}
      //     />
      //   ),
      // },
    ],
    [
      // hanya sementara
      // handleDeleteClick,
      // handleDetail,
      // handleEdit,
    ]
  );

  const filters = useMemo(
    () => (
      <AsyncSelect
        className="w-48 focus:ring-1 ring-primary"
        options={STATUS_OPTIONS}
        value={queryParams.isActive ?? null}
        placeholder={PAYMENT_TYPE_LABELS.LIST.FILTERS.STATUS}
        isSearchable={false}
        onChange={handleIsActiveChange}
        isClearable
      />
    ),
    [handleIsActiveChange, queryParams.isActive]
  );

  return (
    <>
      <ListPageTemplate<PaymentType>
        title={PAYMENT_TYPE_LABELS.LIST.TITLE}
        // hanya sementara
        // headerActions={
        //   <Button onClick={handleAdd} leftIcon={<PlusIcon />}>
        //     {PAYMENT_TYPE_LABELS.LIST.ADD_BUTTON}
        //   </Button>
        // }
        data={paymentTypes}
        columns={columns}
        isLoading={isLoading}
        isError={isError}
        emptyMessage={PAYMENT_TYPE_LABELS.LIST.EMPTY}
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
        title={PAYMENT_TYPE_LABELS.DIALOG.DELETE_TITLE}
        description={PAYMENT_TYPE_LABELS.DIALOG.DELETE_DESCRIPTION}
        cancelText="Cancel"
        confirmText="Delete"
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
      />

      <PaymentTypeDetailDrawer
        open={detailTarget !== null}
        onClose={handleDetailClose}
        onEdit={handleDetailEdit}
        id={detailTarget}
        onSuccess={handleDetailSuccess}
      />
    </>
  );
}
