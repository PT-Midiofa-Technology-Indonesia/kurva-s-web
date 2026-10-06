'use client';

import type { ColumnDef, SortingState } from '@tanstack/react-table';
import { PlusIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useMemo } from 'react';
import { useWarehousesInfinite } from '@/domains/warehouse';
import { AsyncSelect, Button, type SelectValue } from '@/shared/components/atoms';
import { DataTableLayout } from '@/shared/components/templates/DataTableLayout';
import { PageTableTemplate } from '@/shared/components/templates/PageTableTemplate';
import { Badge } from '@/shared/components/ui/badge';
import { useCompanyFilter } from '@/shared/hooks/use-company-filter';
import { useQueryParams } from '@/shared/hooks/use-query-params';
import type { BaseQueryParams } from '@/types/query-params';
import { GR_STATUS_BADGE, PROCUREMENT_LABELS } from '../constants';

const GR_LABELS = PROCUREMENT_LABELS.GOODS_RECEIPT;

import { useGoodsReceiptPage } from '../hooks/use-goods-receipt-page';
import type { GoodsReceiptListItem } from '../types/goods-receipt';

interface GoodsReceiptUrlParams extends BaseQueryParams {
  companyId?: string;
  warehouseId?: string;
}

function StatusBadge({ status }: { status: string }) {
  const badge = GR_STATUS_BADGE[status] ?? { label: status, variant: 'secondary' as const };
  return <Badge variant={badge.variant}>{badge.label}</Badge>;
}

export function GoodsReceiptListPage() {
  const router = useRouter();
  const { queryParams, updateQueryParam, setQueryParams } = useQueryParams<GoodsReceiptUrlParams>();

  const { companyId, companyOptions, handleCompanyChange } = useCompanyFilter();

  // ── Warehouses ──
  const { options: warehouseOptions } = useWarehousesInfinite({
    companyId: companyId ?? undefined,
    enabled: !!companyId,
    isActive: true,
    perPage: 20,
  });

  const handleWarehouseChange = useCallback(
    (value: SelectValue) => {
      const id = Array.isArray(value) ? value[0] : value;
      setQueryParams({ warehouseId: id ? (id as string) : undefined, page: '1' } as any);
    },
    [setQueryParams]
  );

  // ── Table params ──
  const params = useMemo(
    () => ({
      page: queryParams.page ?? 1,
      perPage: queryParams.perPage ?? 10,
      sortBy: queryParams.sortBy,
      sortOrder: (queryParams.sortOrder || 'asc') as 'asc' | 'desc',
      search: queryParams.search,
      warehouseId: queryParams.warehouseId,
      companyId,
    }),
    [queryParams, companyId]
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
    items,
    totalItems,
    totalPages,
    isLoading,
    isError,
    handleSearchChange,
    handleSort,
    handlePaginationChange,
  } = useGoodsReceiptPage(pageOptions);

  const handleAdd = useCallback(() => {
    const query = companyId ? `?companyId=${companyId}` : '';
    router.push(`/procurement/goods-receipt/create${query}`);
  }, [router, companyId]);

  const handleDetail = useCallback(
    (item: GoodsReceiptListItem) => {
      const query = companyId ? `?companyId=${companyId}` : '';
      router.push(`/procurement/goods-receipt/${item.id}${query}`);
    },
    [router, companyId]
  );

  const handleDoDetail = useCallback(
    (item: GoodsReceiptListItem) => {
      console.log('hit');
      const query = companyId ? `?companyId=${companyId}` : '';
      router.push(`/logistic/delivery-order/${item.deliveryOrderId}${query}`);
    },
    [router, companyId]
  );

  // ── Columns ──
  const columns = useMemo<ColumnDef<GoodsReceiptListItem>[]>(
    () => [
      {
        accessorKey: 'code',
        header: GR_LABELS.COLUMNS.CODE,
        cell: ({ row }) => (
          <button
            type="button"
            className="text-teal-600 hover:underline"
            onClick={() => handleDetail(row.original)}
          >
            {row.original.code}
          </button>
        ),
      },
      {
        accessorKey: 'deliveryOrderCode',
        header: GR_LABELS.COLUMNS.DO_CODE,
        cell: ({ row }) => (
          <button
            type="button"
            className="text-teal-600 hover:underline"
            onClick={() => handleDoDetail(row.original)}
          >
            {row.original.deliveryOrderCode}
          </button>
        ),
      },
      {
        accessorKey: 'destinationWarehouseName',
        header: GR_LABELS.COLUMNS.WAREHOUSE,
      },
      {
        accessorKey: 'sourceType',
        header: GR_LABELS.COLUMNS.SOURCE,
      },
      {
        accessorKey: 'receivedAtFormatted',
        header: GR_LABELS.COLUMNS.RECEIVED_AT,
      },
      {
        accessorKey: 'receivedByName',
        header: GR_LABELS.COLUMNS.RECEIVED_BY,
      },
      {
        id: 'status',
        header: GR_LABELS.COLUMNS.STATUS,
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        id: 'actions',
        header: GR_LABELS.COLUMNS.ACTIONS,
        enableSorting: false,
        enableHiding: false,
        size: 60,
        cell: ({ row }) => (
          <button
            type="button"
            className="text-teal-600 hover:underline"
            onClick={() => handleDetail(row.original)}
          >
            Detail
          </button>
        ),
      },
    ],
    [handleDetail, handleDoDetail]
  );

  const initialSorting: SortingState = params.sortBy
    ? [{ id: params.sortBy, desc: params.sortOrder === 'desc' }]
    : [];

  const handleSortingChange = useCallback(
    (newSorting: SortingState) => {
      if (newSorting.length > 0) {
        const { id, desc } = newSorting[0];
        handleSort(id, desc ? 'desc' : 'asc');
      } else {
        handleSort('', 'asc');
      }
    },
    [handleSort]
  );

  return (
    <PageTableTemplate
      title={GR_LABELS.TITLE}
      headerActions={
        <div className="flex items-center gap-2">
          <AsyncSelect
            className="w-52"
            options={companyOptions}
            value={companyId ?? null}
            onChange={handleCompanyChange}
            placeholder="Company"
            isSearchable={false}
            isClearable={false}
          />
          <Button onClick={handleAdd} leftIcon={<PlusIcon />}>
            {GR_LABELS.ADD_BUTTON}
          </Button>
        </div>
      }
      search={queryParams.search}
      onSearchChange={handleSearchChange}
      searchPlaceholder={GR_LABELS.SEARCH}
      toolbarRight={
        <AsyncSelect
          className="w-52"
          options={warehouseOptions}
          value={queryParams.warehouseId ?? null}
          onChange={handleWarehouseChange}
          placeholder={GR_LABELS.WAREHOUSE_PLACEHOLDER}
          isSearchable={false}
          isClearable
        />
      }
    >
      {isError ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-red-600">Something went wrong. Please try again.</p>
        </div>
      ) : (
        <DataTableLayout
          columns={columns}
          data={items}
          initialSorting={initialSorting}
          onSortingChange={handleSortingChange}
          initialPage={params.page}
          initialPageSize={params.perPage}
          onPaginationChange={handlePaginationChange}
          totalItems={totalItems}
          totalPages={totalPages}
          emptyMessage={GR_LABELS.EMPTY}
          enableRowSelection={false}
          enableColumnResize={false}
          enableColumnDnd={false}
          enablePagination
          enableZebraStripes={false}
          className="shadow-none rounded-none"
          isLoading={isLoading}
        />
      )}
    </PageTableTemplate>
  );
}
