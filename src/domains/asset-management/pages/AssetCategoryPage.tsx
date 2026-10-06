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
import { useDepreciationMethods } from '@/shared/hooks/use-enums';
import { formatNumber } from '@/shared/utils/format';
import type { BaseQueryParams } from '@/types/query-params';
import { AssetCategoryDetailDrawer } from '../components/AssetCategoryDetailDrawer';
import { ASSET_CATEGORY_LABELS, BOOLEAN_STATUS_META } from '../constants';
import { useAssetCategoryPage } from '../hooks/use-asset-category-page';
import type { AssetCategoryListItem } from '../types';

interface AssetCategoryPageUrlParams extends BaseQueryParams {
  isActive?: string;
  depreciationMethod?: string;
}

const SORTABLE_FIELDS = [
  'code',
  'name',
  'usefulLifeMonths',
  'depreciationMethod',
  'salvageValuePercent',
  'maintenanceIntervalMonths',
  'activeRegistrationsCount',
] as const;

function isAssetCategorySortBy(value?: string): value is (typeof SORTABLE_FIELDS)[number] {
  return !!value && (SORTABLE_FIELDS as readonly string[]).includes(value);
}

function AssetCategoryActionsCell({
  row,
  onDetail,
  onEdit,
  onDeleteClick,
}: {
  row: Row<AssetCategoryListItem>;
  onDetail: (item: AssetCategoryListItem) => void;
  onEdit: (item: AssetCategoryListItem) => void;
  onDeleteClick: (item: AssetCategoryListItem) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-6 w-6 p-0">
          <EllipsisVertical className="h-4 w-4 text-slate-950" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onEdit(row.original)}>
          <Pencil className="mr-2 h-4 w-4" />
          {ASSET_CATEGORY_LABELS.LIST.ACTIONS.EDIT}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onDetail(row.original)}>
          <Eye className="mr-2 h-4 w-4" />
          {ASSET_CATEGORY_LABELS.LIST.ACTIONS.DETAIL}
        </DropdownMenuItem>
        <Separator className="flex-1 h-[0.05rem]" />
        <DropdownMenuItem
          onClick={() => onDeleteClick(row.original)}
          className="text-destructive focus:text-destructive"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          {ASSET_CATEGORY_LABELS.LIST.ACTIONS.DELETE}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function AssetCategoryPage() {
  const { queryParams, setQueryParams, updateQueryParam } =
    useQueryParams<AssetCategoryPageUrlParams>();
  const { data: depreciationMethods } = useDepreciationMethods();

  const params = useMemo(
    () => ({
      page: queryParams.page ?? 1,
      perPage: queryParams.perPage ?? 10,
      sortBy: isAssetCategorySortBy(queryParams.sortBy) ? queryParams.sortBy : 'code',
      sortOrder: (queryParams.sortOrder || 'asc') as 'asc' | 'desc',
      search: queryParams.search,
      isActive:
        queryParams.isActive === 'true'
          ? true
          : queryParams.isActive === 'false'
            ? false
            : undefined,
      depreciationMethod:
        typeof queryParams.depreciationMethod === 'string'
          ? queryParams.depreciationMethod
          : undefined,
    }),
    [queryParams]
  );

  const pageOptions = useMemo(
    () => ({
      params,
      onUpdateQueryParam: updateQueryParam,
      onSetQueryParams: setQueryParams,
    }),
    [params, setQueryParams, updateQueryParam]
  );

  const {
    assetCategories,
    totalItems,
    totalPages,
    isLoading,
    isError,
    deleteTarget,
    setDeleteTarget,
    isDeleting,
    handleDeleteClick,
    handleDeleteConfirm,
    handleAdd,
    handleEdit,
    detailTarget,
    handleDetail,
    handleDetailClose,
    handleDetailEdit,
    handleSearchChange,
    handleIsActiveChange,
    handleDepreciationMethodChange,
    handleSort,
    handlePaginationChange,
  } = useAssetCategoryPage(pageOptions);

  const depreciationMethodOptions = useMemo(() => {
    const presentMethods = new Set(assetCategories.map((item) => item.depreciationMethod));
    const knownMethods = new Map(
      (depreciationMethods ?? []).map((method) => [method.value, method.label] as const)
    );

    const options = Array.from(presentMethods)
      .map((method) => ({
        value: method,
        label: knownMethods.get(method) ?? method,
      }))
      .sort((a, b) => a.label.localeCompare(b.label));

    if (params.depreciationMethod && !presentMethods.has(params.depreciationMethod)) {
      options.push({
        value: params.depreciationMethod,
        label: knownMethods.get(params.depreciationMethod) ?? params.depreciationMethod,
      });
    }

    return options.sort((a, b) => a.label.localeCompare(b.label));
  }, [assetCategories, depreciationMethods, params.depreciationMethod]);

  const statusFilterOptions = useMemo(() => {
    const seen = new Map<string, { value: string; label: string }>();

    assetCategories.forEach((item) => {
      const key = item.isActive ? 'true' : 'false';
      if (seen.has(key)) return;
      seen.set(key, {
        value: key,
        label: BOOLEAN_STATUS_META[key as 'true' | 'false'].label,
      });
    });

    if (params.isActive !== undefined && !seen.has(params.isActive ? 'true' : 'false')) {
      const key = params.isActive ? 'true' : 'false';
      seen.set(key, {
        value: key,
        label: BOOLEAN_STATUS_META[key as 'true' | 'false'].label,
      });
    }

    return Array.from(seen.values()).sort((a, b) => a.label.localeCompare(b.label));
  }, [assetCategories, params.isActive]);

  const columns = useMemo<ColumnDef<AssetCategoryListItem>[]>(
    () => [
      {
        accessorKey: 'code',
        header: ASSET_CATEGORY_LABELS.LIST.COLUMNS.CODE,
        size: 150,
      },
      {
        accessorKey: 'name',
        header: ASSET_CATEGORY_LABELS.LIST.COLUMNS.NAME,
        size: 220,
        cell: ({ row }) => <span className="font-medium text-slate-950">{row.original.name}</span>,
      },
      {
        accessorKey: 'usefulLifeMonths',
        header: ASSET_CATEGORY_LABELS.LIST.COLUMNS.USEFUL_LIFE_MONTHS,
        size: 160,
        cell: ({ row }) => `${formatNumber(row.original.usefulLifeMonths)} bulan`,
      },
      {
        accessorKey: 'depreciationMethod',
        header: ASSET_CATEGORY_LABELS.LIST.COLUMNS.DEPRECIATION_METHOD,
        size: 180,
        cell: ({ row }) =>
          depreciationMethods?.find((method) => method.value === row.original.depreciationMethod)
            ?.label ?? row.original.depreciationMethod,
      },
      {
        accessorKey: 'salvageValuePercent',
        header: ASSET_CATEGORY_LABELS.LIST.COLUMNS.SALVAGE_VALUE_PERCENT,
        size: 140,
        cell: ({ row }) => `${row.original.salvageValuePercent}%`,
      },
      {
        accessorKey: 'maintenanceIntervalMonths',
        header: ASSET_CATEGORY_LABELS.LIST.COLUMNS.MAINTENANCE_INTERVAL_MONTHS,
        size: 180,
        cell: ({ row }) =>
          row.original.maintenanceIntervalMonths
            ? `${row.original.maintenanceIntervalMonths} bulan`
            : '-',
      },
      {
        accessorKey: 'requiresSerial',
        header: ASSET_CATEGORY_LABELS.LIST.COLUMNS.REQUIRES_SERIAL,
        size: 140,
        enableSorting: false,
        cell: ({ row }) => (
          <Badge variant={row.original.requiresSerial ? 'success' : 'destructive'}>
            {row.original.requiresSerial ? 'Ya' : 'Tidak'}
          </Badge>
        ),
      },
      {
        accessorKey: 'activeRegistrationsCount',
        header: ASSET_CATEGORY_LABELS.LIST.COLUMNS.ACTIVE_REGISTRATIONS_COUNT,
        size: 160,
        cell: ({ row }) => formatNumber(row.original.activeRegistrationsCount),
      },
      {
        accessorKey: 'isActive',
        header: ASSET_CATEGORY_LABELS.LIST.COLUMNS.STATUS,
        size: 110,
        enableSorting: false,
        cell: ({ row }) => {
          const meta = BOOLEAN_STATUS_META[row.original.isActive ? 'true' : 'false'];
          return <Badge variant={meta.variant}>{meta.label}</Badge>;
        },
      },
      {
        id: 'actions',
        header: ASSET_CATEGORY_LABELS.LIST.COLUMNS.ACTIONS,
        enableSorting: false,
        enableHiding: false,
        size: 60,
        cell: ({ row }) => (
          <AssetCategoryActionsCell
            row={row}
            onDetail={handleDetail}
            onEdit={handleEdit}
            onDeleteClick={handleDeleteClick}
          />
        ),
      },
    ],
    [depreciationMethods, handleDetail, handleEdit, handleDeleteClick]
  );

  const filters = useMemo(
    () => (
      <div className="flex flex-wrap gap-3">
        <AsyncSelect
          className="w-52"
          options={statusFilterOptions}
          value={params.isActive === undefined ? null : params.isActive ? 'true' : 'false'}
          onChange={handleIsActiveChange}
          placeholder={ASSET_CATEGORY_LABELS.LIST.FILTERS.STATUS}
          isSearchable={false}
          isClearable
        />
        <AsyncSelect
          className="w-52"
          options={depreciationMethodOptions}
          value={params.depreciationMethod ?? null}
          onChange={handleDepreciationMethodChange}
          placeholder={ASSET_CATEGORY_LABELS.LIST.FILTERS.DEPRECIATION_METHOD}
          isSearchable={false}
          isClearable
        />
      </div>
    ),
    [
      depreciationMethodOptions,
      handleDepreciationMethodChange,
      handleIsActiveChange,
      params.depreciationMethod,
      params.isActive,
      statusFilterOptions,
    ]
  );

  const headerActions = useMemo(
    () => (
      <Button leftIcon={<PlusIcon />} onClick={handleAdd}>
        {ASSET_CATEGORY_LABELS.LIST.ADD_BUTTON}
      </Button>
    ),
    [handleAdd]
  );

  return (
    <>
      <ListPageTemplate<AssetCategoryListItem>
        title={ASSET_CATEGORY_LABELS.LIST.TITLE}
        headerActions={headerActions}
        data={assetCategories}
        columns={columns}
        isLoading={isLoading}
        isError={isError}
        emptyMessage={ASSET_CATEGORY_LABELS.LIST.EMPTY}
        search={queryParams.search}
        searchPlaceholder={ASSET_CATEGORY_LABELS.LIST.SEARCH}
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

      <AssetCategoryDetailDrawer
        open={detailTarget !== null}
        onClose={handleDetailClose}
        onEdit={handleDetailEdit}
        id={detailTarget}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        variant="danger"
        title={ASSET_CATEGORY_LABELS.DIALOG.DELETE_TITLE}
        description={ASSET_CATEGORY_LABELS.DIALOG.DELETE_DESCRIPTION}
        cancelText={ASSET_CATEGORY_LABELS.DIALOG.CANCEL}
        confirmText={ASSET_CATEGORY_LABELS.DIALOG.CONFIRM_DELETE}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        isLoading={isDeleting}
      />
    </>
  );
}
