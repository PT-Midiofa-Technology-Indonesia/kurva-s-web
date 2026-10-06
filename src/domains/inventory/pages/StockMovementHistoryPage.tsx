'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { ArrowLeft } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { DateRange } from 'react-day-picker';
import { SearchBar } from '@/components/molecules/SearchBar';
import { useQueryParams } from '@/hooks/use-query-params';
import { AsyncSelect, Button } from '@/shared/components/atoms';
import { DatePicker } from '@/shared/components/molecules/DatePicker/DatePicker';
import { DataTableLayout } from '@/shared/components/templates/DataTableLayout';
import { Badge } from '@/shared/components/ui';
import { useCompanyFilter } from '@/shared/hooks/use-company-filter';
import { useSelectedCompanyStore } from '@/shared/store/selected-company';
import type { BaseQueryParams } from '@/types/query-params';
import { MovementTypeBadge } from '../components/MovementTypeBadge';
import { SourceLink } from '../components/SourceLink';
import { WarehouseFilter } from '../components/WarehouseFilter';
import { MOVEMENT_TYPE_OPTIONS, STOCK_MONITORING_LABELS } from '../constants';
import { useStockMovementPage } from '../hooks/use-stock-movement-page';
import type { StockMovementItemType, StockMovementListItem } from '../types';

const LABELS = STOCK_MONITORING_LABELS.MOVEMENT_HISTORY;

interface StockMovementHistoryUrlParams extends BaseQueryParams {
  companyId?: string;
  warehouseId?: string;
  movementType?: string;
  startDate?: string;
  endDate?: string;
  itemType?: string;
  itemId?: string;
  code?: string;
  name?: string;
  warehouseName?: string;
}

function toDate(value?: string) {
  return value ? new Date(`${value}T00:00:00`) : undefined;
}

function toDateRange(startDate?: string, endDate?: string): DateRange | undefined {
  if (!startDate && !endDate) return undefined;
  return { from: toDate(startDate), to: toDate(endDate) };
}

export function StockMovementHistoryPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { queryParams, updateQueryParam, setQueryParams, replaceQueryParams } =
    useQueryParams<StockMovementHistoryUrlParams>();
  const itemType = (searchParams.get('itemType') ?? 'material') as StockMovementItemType;
  const itemId = searchParams.get('itemId') ?? '';
  const code = searchParams.get('code') ?? undefined;
  const name = searchParams.get('name') ?? undefined;
  const warehouseName = searchParams.get('warehouseName') ?? undefined;
  const { companyId, companyOptions } = useCompanyFilter();
  const setSelectedCompanyId = useSelectedCompanyStore((s) => s.setSelectedCompanyId);
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
      ...(itemType === 'material' ? { itemCatalogId: itemId } : { resourceUnitId: itemId }),
    }),
    [queryParams, warehouseId, itemType, itemId]
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
    handleWarehouseChange,
    handleMovementTypeChange,
    handleDateRangeChange,
    handlePaginationChange,
  } = useStockMovementPage(pageOptions);

  const handleBack = useCallback(() => router.push('/inventory/stock-monitoring'), [router]);

  // Local echo of `search` so the input updates every keystroke; the URL
  // (and thus the query) only updates once debounced by SearchBar.
  const [searchInput, setSearchInput] = useState(queryParams.search ?? '');
  useEffect(() => {
    setSearchInput(queryParams.search ?? '');
  }, [queryParams.search]);

  const handleSearchDebounce = useCallback(
    (value: string) => setQueryParams({ search: value || undefined, page: 1 }),
    [setQueryParams]
  );

  const handleSearchClear = useCallback(() => {
    setSearchInput('');
    setQueryParams({ search: undefined, page: 1 });
  }, [setQueryParams]);

  const handleCompanyChange = useCallback(
    (value: string | string[] | null | undefined) => {
      const id = Array.isArray(value) ? value[0] : value;
      if (!id) return;

      // Reset list filters on company switch, but keep navigation context params.
      replaceQueryParams({
        companyId: id,
        itemType,
        ...(itemId ? { itemId } : {}),
        ...(code ? { code } : {}),
        ...(name ? { name } : {}),
        ...(warehouseName ? { warehouseName } : {}),
      });
      setSelectedCompanyId(id);
    },
    [itemType, itemId, code, name, warehouseName, replaceQueryParams, setSelectedCompanyId]
  );

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

  const columns = useMemo<ColumnDef<StockMovementListItem>[]>(() => {
    const base: ColumnDef<StockMovementListItem>[] = [
      {
        accessorKey: 'timestamp',
        header: LABELS.COLUMNS.TIMESTAMP,
        size: 160,
      },
    ];

    if (itemType === 'material') {
      base.push({
        id: 'qty',
        header: LABELS.COLUMNS.QTY,
        size: 100,
        cell: ({ row }) => `${row.original.qty} ${row.original.uom}`,
      });
    }

    base.push(
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
      }
    );

    if (itemType === 'material') {
      base.push({
        accessorKey: 'balanceAfter',
        header: LABELS.COLUMNS.BALANCE_AFTER,
        size: 120,
        cell: ({ row }) => `${row.original.balanceAfter} ${row.original.uom}`,
      });
    }

    base.push({
      accessorKey: 'user',
      header: LABELS.COLUMNS.USER,
      size: 140,
    });

    return base;
  }, [itemType]);

  const filterBar = (
    <div className="flex gap-3 items-center p-4">
      <SearchBar
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
        onDebounce={handleSearchDebounce}
        onClear={handleSearchClear}
        width="288px"
        showClear
      />
      <div className="flex-1" />
      <WarehouseFilter value={warehouseId} onChange={handleWarehouseChange} companyId={companyId} />
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
  );

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={handleBack}
          aria-label={LABELS.BACK}
          className="h-9 px-3"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-lg font-semibold text-slate-950">
          {code ? `${code} - ${name}` : name}
        </h1>
        {warehouseName && <Badge variant="secondary">{warehouseName}</Badge>}
        <div className="ml-auto">
          <AsyncSelect
            className="w-52"
            options={companyOptions}
            value={companyId ?? null}
            onChange={handleCompanyChange}
            placeholder={STOCK_MONITORING_LABELS.COMPANY_PLACEHOLDER}
            isSearchable={false}
            isClearable={false}
          />
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        {isError ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-red-600">Something went wrong. Please try again.</p>
          </div>
        ) : (
          <DataTableLayout<StockMovementListItem, unknown>
            columns={columns}
            data={movements}
            initialPage={params.page}
            initialPageSize={params.perPage}
            onPaginationChange={handlePaginationChange}
            totalItems={totalItems}
            totalPages={totalPages}
            emptyMessage={LABELS.EMPTY}
            enableRowSelection={false}
            enableColumnResize={false}
            enableColumnDnd={false}
            enablePagination={true}
            enableZebraStripes={false}
            filter={filterBar}
            className="shadow-none rounded-none"
            isLoading={isLoading}
          />
        )}
      </div>
    </div>
  );
}
