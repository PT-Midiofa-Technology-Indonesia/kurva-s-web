'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { TriangleAlert } from 'lucide-react';
import { useCallback, useMemo } from 'react';
import type { DateRange } from 'react-day-picker';
import { useQueryParams } from '@/hooks/use-query-params';
import { AsyncSelect } from '@/shared/components/atoms';
import { DatePicker } from '@/shared/components/molecules/DatePicker/DatePicker';
import { ListPageTemplate } from '@/shared/components/templates/ListPageTemplate';
import { useCompanyFilter } from '@/shared/hooks/use-company-filter';
import type { BaseQueryParams } from '@/types/query-params';
import { MovementTypeBadge } from '../components/MovementTypeBadge';
import { SourceLink } from '../components/SourceLink';
import { WarehouseFilter } from '../components/WarehouseFilter';
import { MOVEMENT_TYPE_OPTIONS, STOCK_MONITORING_LABELS } from '../constants';
import { useStockMovementPage } from '../hooks/use-stock-movement-page';
import type { StockMovementListItem } from '../types';

const LABELS = STOCK_MONITORING_LABELS.MOVEMENT_HISTORY;

interface StockMovementUrlParams extends BaseQueryParams {
  companyId?: string;
  warehouseId?: string;
  movementType?: string;
  startDate?: string;
  endDate?: string;
}

function formatTimestamp(value: string) {
  try {
    return format(new Date(value), 'dd/MM/yyyy HH:mm');
  } catch {
    return value;
  }
}

function toDate(value?: string) {
  return value ? new Date(`${value}T00:00:00`) : undefined;
}

function toDateRange(startDate?: string, endDate?: string): DateRange | undefined {
  if (!startDate && !endDate) return undefined;
  return { from: toDate(startDate), to: toDate(endDate) };
}

export function StockMovementPage() {
  const { queryParams, updateQueryParam, setQueryParams } =
    useQueryParams<StockMovementUrlParams>();
  const { companyId, companyOptions, handleCompanyChange } = useCompanyFilter();
  const warehouseId =
    typeof queryParams.warehouseId === 'string' ? queryParams.warehouseId : undefined;

  const params = useMemo(
    () => ({
      page: queryParams.page ?? 1,
      perPage: queryParams.perPage ?? 10,
      sortBy: queryParams.sortBy ?? 'createdAt',
      sortOrder: (queryParams.sortOrder || 'desc') as 'asc' | 'desc',
      search: queryParams.search,
      warehouseId,
      movementType:
        typeof queryParams.movementType === 'string' ? queryParams.movementType : undefined,
      startDate: typeof queryParams.startDate === 'string' ? queryParams.startDate : undefined,
      endDate: typeof queryParams.endDate === 'string' ? queryParams.endDate : undefined,
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
    movements,
    totalItems,
    totalPages,
    isLoading,
    isError,
    handleSearchChange,
    handleSort,
    handleWarehouseChange,
    handleMovementTypeChange,
    handleDateRangeChange,
    handlePaginationChange,
  } = useStockMovementPage(pageOptions);

  const handleDateRangeSelect = useCallback(
    (range: Date | DateRange | undefined) => {
      if (!range || range instanceof Date) {
        handleDateRangeChange(undefined, undefined);
        return;
      }
      handleDateRangeChange(
        range.from ? format(range.from, 'yyyy-MM-dd') : undefined,
        range.to ? format(range.to, 'yyyy-MM-dd') : undefined
      );
    },
    [handleDateRangeChange]
  );

  const columns = useMemo<ColumnDef<StockMovementListItem>[]>(
    () => [
      {
        // id must match the backend sort field (`createdAt`) — `timestamp` is
        // just the formatted display value, not a sortable column on its own.
        id: 'createdAt',
        accessorFn: (row) => row.timestamp,
        header: LABELS.COLUMNS.TIMESTAMP,
        size: 160,
        cell: ({ row }) => formatTimestamp(row.original.timestamp),
      },
      {
        id: 'item',
        accessorFn: (row) => row.item.name,
        header: LABELS.COLUMNS.ITEM,
        size: 200,
        cell: ({ row }) => (
          <div className="flex items-center gap-1.5">
            <span>{row.original.item.name}</span>
            {row.original.item.isDeleted && (
              <span className="flex items-center gap-1 text-destructive" title="Item telah dihapus">
                <TriangleAlert className="h-3.5 w-3.5" />
                <span className="text-xs">{STOCK_MONITORING_LABELS.DELETED_ITEM}</span>
              </span>
            )}
          </div>
        ),
      },
      {
        id: 'qty',
        header: LABELS.COLUMNS.QTY,
        size: 100,
        cell: ({ row }) => `${row.original.qty} ${row.original.uom}`,
      },
      {
        accessorKey: 'movementType',
        header: LABELS.COLUMNS.MOVEMENT_TYPE,
        size: 110,
        cell: ({ row }) => <MovementTypeBadge movementType={row.original.movementType} />,
      },
      {
        accessorKey: 'warehouseName',
        header: LABELS.COLUMNS.WAREHOUSE,
        size: 160,
      },
      {
        id: 'source',
        header: LABELS.COLUMNS.SOURCE,
        size: 160,
        cell: ({ row }) => <SourceLink source={row.original.source} />,
      },
      {
        accessorKey: 'balanceAfter',
        header: LABELS.COLUMNS.BALANCE_AFTER,
        size: 120,
        cell: ({ row }) => `${row.original.balanceAfter} ${row.original.uom}`,
      },
      {
        accessorKey: 'user',
        header: LABELS.COLUMNS.USER,
        size: 140,
      },
    ],
    []
  );

  const filters = useMemo(
    () => (
      <div className="flex gap-3">
        <WarehouseFilter
          value={warehouseId}
          onChange={handleWarehouseChange}
          companyId={companyId}
        />
        <AsyncSelect
          className="w-52 focus:ring-1 ring-primary"
          options={MOVEMENT_TYPE_OPTIONS}
          value={typeof queryParams.movementType === 'string' ? queryParams.movementType : null}
          placeholder={STOCK_MONITORING_LABELS.ALL_MOVEMENT_TYPES}
          isSearchable={false}
          isClearable
          onChange={handleMovementTypeChange}
        />
        <DatePicker
          mode="range"
          value={toDateRange(
            typeof queryParams.startDate === 'string' ? queryParams.startDate : undefined,
            typeof queryParams.endDate === 'string' ? queryParams.endDate : undefined
          )}
          onChange={handleDateRangeSelect}
          className="w-64"
        />
      </div>
    ),
    [
      warehouseId,
      handleWarehouseChange,
      companyId,
      queryParams.movementType,
      handleMovementTypeChange,
      queryParams.startDate,
      queryParams.endDate,
      handleDateRangeSelect,
    ]
  );

  return (
    <ListPageTemplate<StockMovementListItem>
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
      data={movements}
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
  );
}
