'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { EllipsisVertical, History, SlidersHorizontal, TriangleAlert } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useMemo } from 'react';
import { useQueryParams } from '@/hooks/use-query-params';
import { AsyncSelect, Button } from '@/shared/components/atoms';
import { ListPageTemplate } from '@/shared/components/templates/ListPageTemplate';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import { useCompanyFilter } from '@/shared/hooks/use-company-filter';
import type { BaseQueryParams } from '@/types/query-params';
import { SetThresholdModal } from '../components/SetThresholdModal';
import { StockStatusBadge } from '../components/StockStatusBadge';
import { WarehouseFilter } from '../components/WarehouseFilter';
import { STOCK_MONITORING_LABELS, STOCK_STATUS_BADGE_VARIANTS } from '../constants';
import { useStockMaterialPage } from '../hooks/use-stock-material-page';
import type { StockMaterialListItem } from '../types';

interface StockMaterialUrlParams extends BaseQueryParams {
  tab?: string;
  companyId?: string;
  warehouseId?: string;
}

const LABELS = STOCK_MONITORING_LABELS.MATERIAL;

function formatLastUpdate(value: string) {
  try {
    return format(new Date(value), 'dd/MM/yyyy');
  } catch {
    return value;
  }
}

export function StockMaterialTab() {
  const router = useRouter();
  const { queryParams, updateQueryParam, setQueryParams } =
    useQueryParams<StockMaterialUrlParams>();
  const { companyId, companyOptions, handleCompanyChange } = useCompanyFilter();
  const warehouseId =
    typeof queryParams.warehouseId === 'string' ? queryParams.warehouseId : undefined;

  const params = useMemo(
    () => ({
      page: queryParams.page ?? 1,
      perPage: queryParams.perPage ?? 10,
      sortBy: queryParams.sortBy ?? 'code',
      sortOrder: (queryParams.sortOrder || 'asc') as 'asc' | 'desc',
      search: queryParams.search,
      warehouseId,
    }),
    [queryParams, warehouseId]
  );

  const pageOptions = useMemo(
    () => ({
      params,
      companyId,
      onUpdateQueryParam: updateQueryParam,
      onSetQueryParams: setQueryParams,
    }),
    [params, companyId, updateQueryParam, setQueryParams]
  );

  const {
    materials,
    totalItems,
    totalPages,
    isLoading,
    isError,
    thresholdTarget,
    handleThresholdClick,
    handleThresholdClose,
    handleSearchChange,
    handleWarehouseChange,
    handleSort,
    handlePaginationChange,
  } = useStockMaterialPage(pageOptions);

  const handleMovementHistory = useCallback(
    (item: StockMaterialListItem) => {
      const qs = new URLSearchParams({
        itemType: 'material',
        itemId: item.itemCatalogId,
        code: item.code,
        name: item.name,
        warehouseName: item.warehouseName,
      });
      router.push(`/inventory/stock-monitoring/movement-history?${qs.toString()}`);
    },
    [router]
  );

  const columns = useMemo<ColumnDef<StockMaterialListItem>[]>(
    () => [
      {
        accessorKey: 'code',
        header: LABELS.COLUMNS.CODE,
        size: 110,
      },
      {
        accessorKey: 'name',
        header: LABELS.COLUMNS.NAME,
        size: 220,
        cell: ({ row }) => (
          <button
            type="button"
            className="flex items-center gap-1.5 text-left hover:underline"
            onClick={() => handleMovementHistory(row.original)}
          >
            <span>{row.original.name}</span>
            {row.original.isDeleted && (
              <span className="flex items-center gap-1 text-destructive" title="Item telah dihapus">
                <TriangleAlert className="h-3.5 w-3.5" />
                <span className="text-xs">{STOCK_MONITORING_LABELS.DELETED_ITEM}</span>
              </span>
            )}
          </button>
        ),
      },
      {
        accessorKey: 'warehouseName',
        header: LABELS.COLUMNS.WAREHOUSE,
        size: 160,
      },
      {
        id: 'qtyOnHand',
        accessorKey: 'qtyOnHand',
        header: LABELS.COLUMNS.QTY_ON_HAND,
        size: 120,
        cell: ({ row }) => `${row.original.qtyOnHand} ${row.original.uom}`,
      },
      {
        accessorKey: 'reserved',
        header: LABELS.COLUMNS.RESERVED,
        size: 100,
        cell: ({ row }) => `${row.original.reserved} ${row.original.uom}`,
      },
      {
        accessorKey: 'available',
        header: LABELS.COLUMNS.AVAILABLE,
        size: 100,
        cell: ({ row }) => `${row.original.available} ${row.original.uom}`,
      },
      {
        accessorKey: 'lastUpdate',
        header: LABELS.COLUMNS.LAST_UPDATE,
        size: 120,
        cell: ({ row }) => formatLastUpdate(row.original.lastUpdate),
      },
      {
        accessorKey: 'status',
        header: LABELS.COLUMNS.STATUS,
        size: 140,
        cell: ({ row }) => (
          <StockStatusBadge status={row.original.status} variants={STOCK_STATUS_BADGE_VARIANTS} />
        ),
      },
      {
        id: 'actions',
        header: LABELS.COLUMNS.ACTIONS,
        enableSorting: false,
        enableHiding: false,
        size: 60,
        cell: ({ row }) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button type="button" variant="ghost" className="h-6 w-6 p-0">
                <EllipsisVertical className="h-4 w-4 text-slate-950" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleMovementHistory(row.original)}>
                <History className="mr-2 h-4 w-4" />
                {LABELS.ACTIONS.MOVEMENT_HISTORY}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleThresholdClick(row.original)}>
                <SlidersHorizontal className="mr-2 h-4 w-4" />
                {LABELS.ACTIONS.SET_THRESHOLD}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    [handleThresholdClick, handleMovementHistory]
  );

  const filters = useMemo(
    () => (
      <div className="flex gap-3">
        <WarehouseFilter
          value={warehouseId}
          onChange={handleWarehouseChange}
          companyId={companyId}
        />
      </div>
    ),
    [warehouseId, handleWarehouseChange, companyId]
  );

  return (
    <>
      <ListPageTemplate<StockMaterialListItem>
        title={LABELS.TITLE}
        headerActions={
          <AsyncSelect
            className="w-52"
            options={companyOptions}
            value={companyId ?? null}
            onChange={handleCompanyChange}
            placeholder={STOCK_MONITORING_LABELS.COMPANY_PLACEHOLDER}
            isSearchable={false}
            isClearable={false}
          />
        }
        data={materials}
        columns={columns}
        isLoading={isLoading}
        isError={isError}
        emptyMessage={LABELS.EMPTY}
        search={queryParams.search}
        onSearchChange={handleSearchChange}
        toolbarRight={filters}
        sortBy={params.sortBy}
        sortOrder={params.sortOrder}
        onSort={handleSort}
        page={params.page}
        perPage={params.perPage}
        totalItems={totalItems}
        totalPages={totalPages}
        onPaginationChange={handlePaginationChange}
      />

      <SetThresholdModal
        open={thresholdTarget !== null}
        onClose={handleThresholdClose}
        item={thresholdTarget}
        companyId={companyId}
      />
    </>
  );
}
