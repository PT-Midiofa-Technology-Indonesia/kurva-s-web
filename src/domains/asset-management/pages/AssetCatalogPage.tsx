'use client';

import type { ColumnDef, Row } from '@tanstack/react-table';
import { EllipsisVertical, Eye, PlusIcon } from 'lucide-react';
import { useMemo } from 'react';
import { useQueryParams } from '@/hooks/use-query-params';
import { AsyncSelect, Button } from '@/shared/components/atoms';
import { ListPageTemplate } from '@/shared/components/templates/ListPageTemplate';
import { Badge } from '@/shared/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import { useCompanyFilter } from '@/shared/hooks/use-company-filter';
import {
  formatCurrencyIDR,
  formatDateLong,
  formatDateTimeLong,
  formatNumber,
} from '@/shared/utils/format';
import type { BaseQueryParams } from '@/types/query-params';
import { AssetCatalogCategoryFilter } from '../components/AssetCatalogCategoryFilter';
import { AssetCatalogWarehouseFilter } from '../components/AssetCatalogWarehouseFilter';
import { AssetRegistrationDetailDrawer } from '../components/AssetRegistrationDetailDrawer';
import { AssetRegistrationRegisterDrawer } from '../components/AssetRegistrationRegisterDrawer';
import { ASSET_CATALOG_LABELS, ASSET_REGISTRATION_STATUS_META } from '../constants';
import { useAssetCatalogPage } from '../hooks/use-asset-catalog-page';
import type { AssetRegistrationListItem, AssetRegistrationStatus } from '../types';

interface AssetCatalogPageUrlParams extends BaseQueryParams {
  companyId?: string;
  status?: string;
  categoryId?: string;
  warehouseId?: string;
}

const SORTABLE_FIELDS = [
  'registeredAt',
  'acquisitionDate',
  'depreciationStartDate',
  'monthsElapsed',
] as const;
const STATUS_ORDER: AssetRegistrationStatus[] = ['active', 'disposed', 'superseded'];

function isAssetCatalogSortBy(value?: string): value is (typeof SORTABLE_FIELDS)[number] {
  return !!value && (SORTABLE_FIELDS as readonly string[]).includes(value);
}

function AssetRegistrationActionsCell({
  row,
  onDetail,
}: {
  row: Row<AssetRegistrationListItem>;
  onDetail: (item: AssetRegistrationListItem) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-6 w-6 p-0">
          <EllipsisVertical className="h-4 w-4 text-slate-950" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onDetail(row.original)}>
          <Eye className="mr-2 h-4 w-4" />
          {ASSET_CATALOG_LABELS.LIST.ACTIONS.DETAIL}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function AssetCatalogPage() {
  const { queryParams, setQueryParams, updateQueryParam } =
    useQueryParams<AssetCatalogPageUrlParams>();
  const { companyId, companyOptions, handleCompanyChange } = useCompanyFilter();

  const params = useMemo(
    () => ({
      page: queryParams.page ?? 1,
      perPage: queryParams.perPage ?? 10,
      sortBy: isAssetCatalogSortBy(queryParams.sortBy) ? queryParams.sortBy : 'registeredAt',
      sortOrder: (queryParams.sortOrder || 'desc') as 'asc' | 'desc',
      search: queryParams.search,
      companyId,
      status:
        queryParams.status === 'all' ||
        queryParams.status === 'active' ||
        queryParams.status === 'disposed' ||
        queryParams.status === 'superseded'
          ? (queryParams.status as 'active' | 'disposed' | 'superseded' | 'all')
          : 'active',
      categoryId: typeof queryParams.categoryId === 'string' ? queryParams.categoryId : undefined,
      warehouseId:
        typeof queryParams.warehouseId === 'string' ? queryParams.warehouseId : undefined,
    }),
    [companyId, queryParams]
  );
  const statusValue = params.status;

  const pageOptions = useMemo(
    () => ({
      params,
      onUpdateQueryParam: updateQueryParam,
      onSetQueryParams: setQueryParams,
    }),
    [params, setQueryParams, updateQueryParam]
  );

  const {
    assetRegistrations,
    totalItems,
    totalPages,
    isLoading,
    isError,
    detailTarget,
    handleDetail,
    handleDetailClose,
    registerDrawerOpen,
    handleRegisterClick,
    handleRegisterDrawerClose,
    handleSearchChange,
    handleStatusChange,
    handleCategoryChange,
    handleWarehouseChange,
    handleSort,
    handlePaginationChange,
  } = useAssetCatalogPage(pageOptions);

  const statusFilterOptions = useMemo(() => {
    const presentStatuses = new Set(assetRegistrations.map((item) => item.status));
    const options = [
      {
        value: 'active',
        label: ASSET_REGISTRATION_STATUS_META.active.label,
      },
      { value: 'all', label: 'Semua Status' },
      ...STATUS_ORDER.filter((status) => status !== 'active' && presentStatuses.has(status)).map(
        (status) => ({
          value: status,
          label: ASSET_REGISTRATION_STATUS_META[status]?.label ?? status,
        })
      ),
    ];

    if (
      params.status !== 'active' &&
      params.status !== 'all' &&
      !presentStatuses.has(params.status)
    ) {
      options.push({
        value: params.status,
        label: ASSET_REGISTRATION_STATUS_META[params.status]?.label ?? params.status,
      });
    }

    return options;
  }, [assetRegistrations, params.status]);

  const columns = useMemo<ColumnDef<AssetRegistrationListItem>[]>(
    () => [
      {
        accessorKey: 'unitCode',
        header: ASSET_CATALOG_LABELS.LIST.COLUMNS.UNIT_CODE,
        size: 170,
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex flex-col gap-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-medium text-slate-950">{row.original.unitCode}</span>
              {row.original.unitDeleted && (
                <Badge variant="destructive" className="text-[10px]">
                  Deleted Unit
                </Badge>
              )}
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'serialNumber',
        header: ASSET_CATALOG_LABELS.LIST.COLUMNS.SERIAL_NUMBER,
        size: 160,
        enableSorting: false,
        cell: ({ row }) => row.original.serialNumber ?? '-',
      },
      {
        accessorKey: 'itemName',
        header: ASSET_CATALOG_LABELS.LIST.COLUMNS.ITEM_NAME,
        size: 240,
        enableSorting: false,
      },
      {
        id: 'category',
        header: ASSET_CATALOG_LABELS.LIST.COLUMNS.CATEGORY,
        size: 180,
        enableSorting: false,
        cell: ({ row }) => <Badge variant="secondary">{row.original.category.name}</Badge>,
      },
      {
        id: 'warehouse',
        header: ASSET_CATALOG_LABELS.LIST.COLUMNS.WAREHOUSE,
        size: 180,
        enableSorting: false,
        cell: ({ row }) =>
          row.original.inProject ? (
            <Badge variant="secondary">In Project</Badge>
          ) : (
            (row.original.warehouse?.name ?? '-')
          ),
      },
      {
        accessorKey: 'acquisitionDate',
        header: ASSET_CATALOG_LABELS.LIST.COLUMNS.ACQUISITION_DATE,
        size: 140,
        cell: ({ row }) => formatDateLong(row.original.acquisitionDate),
      },
      {
        accessorKey: 'acquisitionCost',
        header: ASSET_CATALOG_LABELS.LIST.COLUMNS.ACQUISITION_COST,
        size: 150,
        enableSorting: false,
        cell: ({ row }) => formatCurrencyIDR(Number(row.original.acquisitionCost)),
      },
      {
        accessorKey: 'depreciationStartDate',
        header: ASSET_CATALOG_LABELS.LIST.COLUMNS.DEPRECIATION_START_DATE,
        size: 160,
        cell: ({ row }) => formatDateLong(row.original.depreciationStartDate),
      },
      {
        accessorKey: 'bookValue',
        header: ASSET_CATALOG_LABELS.LIST.COLUMNS.BOOK_VALUE,
        size: 150,
        enableSorting: false,
        cell: ({ row }) => formatCurrencyIDR(row.original.bookValue),
      },
      {
        accessorKey: 'monthsElapsed',
        header: ASSET_CATALOG_LABELS.LIST.COLUMNS.MONTHS_ELAPSED,
        size: 140,
        cell: ({ row }) => `${formatNumber(row.original.monthsElapsed)} bulan`,
      },
      {
        accessorKey: 'registeredAt',
        header: ASSET_CATALOG_LABELS.LIST.COLUMNS.REGISTERED_AT,
        size: 170,
        cell: ({ row }) => formatDateTimeLong(row.original.registeredAt),
      },
      {
        accessorKey: 'status',
        header: ASSET_CATALOG_LABELS.LIST.COLUMNS.STATUS,
        size: 110,
        enableSorting: false,
        cell: ({ row }) => {
          const badge = ASSET_REGISTRATION_STATUS_META[row.original.status];
          return (
            <Badge variant={badge?.variant ?? 'secondary'}>
              {badge?.label ?? row.original.status}
            </Badge>
          );
        },
      },
      {
        id: 'actions',
        header: ASSET_CATALOG_LABELS.LIST.COLUMNS.ACTIONS,
        enableSorting: false,
        enableHiding: false,
        size: 60,
        cell: ({ row }) => <AssetRegistrationActionsCell row={row} onDetail={handleDetail} />,
      },
    ],
    [handleDetail]
  );

  const filters = useMemo(
    () => (
      <div className="flex flex-wrap gap-3">
        <AsyncSelect
          className="w-52"
          options={statusFilterOptions}
          value={statusValue}
          onChange={handleStatusChange}
          placeholder={ASSET_CATALOG_LABELS.LIST.FILTERS.STATUS}
          isSearchable={false}
          isClearable={false}
        />
        <AssetCatalogCategoryFilter value={params.categoryId} onChange={handleCategoryChange} />
        <AssetCatalogWarehouseFilter
          value={params.warehouseId}
          onChange={handleWarehouseChange}
          companyId={companyId}
        />
      </div>
    ),
    [
      companyId,
      handleCategoryChange,
      handleStatusChange,
      handleWarehouseChange,
      statusFilterOptions,
      statusValue,
      params.categoryId,
      params.warehouseId,
    ]
  );

  const headerActions = useMemo(
    () => (
      <div className="flex items-center gap-2">
        <AsyncSelect
          className="w-60"
          options={companyOptions}
          value={companyId ?? null}
          onChange={handleCompanyChange}
          placeholder="Company"
          isSearchable={false}
          isClearable={false}
        />
        <Button leftIcon={<PlusIcon />} onClick={handleRegisterClick} disabled={!companyId}>
          {ASSET_CATALOG_LABELS.LIST.BUTTONS.REGISTER}
        </Button>
      </div>
    ),
    [companyId, companyOptions, handleCompanyChange, handleRegisterClick]
  );

  return (
    <>
      <ListPageTemplate<AssetRegistrationListItem>
        title={ASSET_CATALOG_LABELS.LIST.TITLE}
        headerActions={headerActions}
        data={assetRegistrations}
        columns={columns}
        isLoading={isLoading}
        isError={isError}
        emptyMessage={
          companyId
            ? ASSET_CATALOG_LABELS.LIST.EMPTY
            : 'Pilih company terlebih dahulu untuk melihat asset catalog.'
        }
        search={queryParams.search}
        searchPlaceholder={ASSET_CATALOG_LABELS.LIST.SEARCH}
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

      <AssetRegistrationDetailDrawer
        open={detailTarget !== null}
        onClose={handleDetailClose}
        id={detailTarget}
        companyId={companyId ?? null}
      />

      <AssetRegistrationRegisterDrawer
        open={registerDrawerOpen}
        onClose={handleRegisterDrawerClose}
        companyId={companyId ?? null}
        onSuccess={handleRegisterDrawerClose}
      />
    </>
  );
}
