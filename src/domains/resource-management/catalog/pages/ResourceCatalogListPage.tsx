'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { EllipsisVertical, Eye, Pencil, PlusIcon, Trash2 } from 'lucide-react';
import { useMemo } from 'react';
import { useQueryParams } from '@/hooks/use-query-params';
import { AsyncSelect, Button } from '@/shared/components/atoms';
import { ConfirmDialog } from '@/shared/components/molecules/AlertDialog';
import { ListPageTemplate } from '@/shared/components/templates/ListPageTemplate';
import { Badge } from '@/shared/components/ui';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import { useCompanyFilter } from '@/shared/hooks/use-company-filter';
import { formatDate } from '@/shared/utils/format';
import type { BaseQueryParams } from '@/types/query-params';
import { ResourceUnitDetailDrawer } from '../components/ResourceUnitDetailDrawer';
import { ResourceUnitFormDrawer } from '../components/ResourceUnitFormDrawer';
import { RESOURCE_UNIT_LABELS } from '../constants';
import { useResourceCatalogPage } from '../hooks/use-resource-catalog-page';
import type { ResourceUnit } from '../types';

interface ResourceCatalogUrlParams extends BaseQueryParams {
  companyId?: string;
  warehouseId?: string;
}

function ResourceUnitStatusCell({ status }: { status: string }) {
  const variant =
    status === 'available'
      ? 'success'
      : status === 'allocated'
        ? 'info'
        : status === 'maintenance'
          ? 'warning'
          : 'secondary';

  return <Badge variant={variant}>{status}</Badge>;
}

function ResourceUnitActionsCell({
  row,
  onEdit,
  onDetail,
  onDeleteClick,
}: {
  row: { original: ResourceUnit };
  onEdit: (r: ResourceUnit) => void;
  onDetail: (r: ResourceUnit) => void;
  onDeleteClick: (r: ResourceUnit) => void;
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
          {RESOURCE_UNIT_LABELS.LIST.ACTIONS.EDIT}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onDetail(row.original)}>
          <Eye className="mr-2 h-4 w-4" />
          {RESOURCE_UNIT_LABELS.LIST.ACTIONS.DETAIL}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onDeleteClick(row.original)}
          className="text-destructive focus:text-destructive"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          {RESOURCE_UNIT_LABELS.LIST.ACTIONS.DELETE}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function ResourceCatalogListPage() {
  const { queryParams, updateQueryParam, setQueryParams } =
    useQueryParams<ResourceCatalogUrlParams>();

  const { companyId, companyOptions, handleCompanyChange } = useCompanyFilter();

  const params = useMemo(
    () => ({
      page: queryParams.page ?? 1,
      perPage: queryParams.perPage ?? 10,
      sortBy: queryParams.sortBy ?? 'code',
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
      companyId,
      onUpdateQueryParam: updateQueryParam,
      onSetQueryParams: setQueryParams,
    }),
    [params, companyId, updateQueryParam, setQueryParams]
  );

  const {
    resourceUnits,
    totalItems,
    totalPages,
    isLoading,
    isError,
    handleAdd,
    handleEdit,
    drawerOpen,
    editId,
    handleDrawerClose,
    handleDrawerSuccess,
    deleteTarget,
    setDeleteTarget,
    handleDeleteClick,
    handleDeleteConfirm,
    detailTarget,
    handleDetail,
    handleDetailClose,
    handleDetailEdit,
  } = useResourceCatalogPage(pageOptions);

  const columns = useMemo<ColumnDef<ResourceUnit>[]>(
    () => [
      { accessorKey: 'code', header: RESOURCE_UNIT_LABELS.LIST.COLUMNS.CODE, size: 120 },
      {
        id: 'itemName',
        header: RESOURCE_UNIT_LABELS.LIST.COLUMNS.ITEM_NAME,
        size: 200,
        cell: ({ row }) => row.original.itemCatalog?.name ?? '-',
      },
      {
        id: 'warehouse',
        header: RESOURCE_UNIT_LABELS.LIST.COLUMNS.WAREHOUSE,
        size: 160,
        cell: ({ row }) => row.original.warehouse?.name ?? '-',
      },
      {
        accessorKey: 'acquisitionDate',
        header: RESOURCE_UNIT_LABELS.LIST.COLUMNS.ACQUISITION_DATE,
        size: 140,
        cell: ({ row }) =>
          row.original.acquisitionDate ? formatDate(row.original.acquisitionDate) : '-',
      },
      {
        accessorKey: 'acquisitionCost',
        header: RESOURCE_UNIT_LABELS.LIST.COLUMNS.ACQUISITION_COST,
        size: 140,
        cell: ({ row }) => {
          const cost = parseFloat(row.original.acquisitionCost);
          return Number.isNaN(cost) ? '-' : `Rp ${cost.toLocaleString('id-ID')}`;
        },
      },
      {
        accessorKey: 'status',
        header: RESOURCE_UNIT_LABELS.LIST.COLUMNS.STATUS,
        size: 120,
        cell: ({ row }) => <ResourceUnitStatusCell status={row.original.status} />,
      },
      {
        id: 'actions',
        header: RESOURCE_UNIT_LABELS.LIST.COLUMNS.ACTIONS,
        enableSorting: false,
        enableHiding: false,
        size: 60,
        cell: ({ row }) => (
          <ResourceUnitActionsCell
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

  return (
    <>
      <ListPageTemplate<ResourceUnit>
        title={RESOURCE_UNIT_LABELS.LIST.TITLE}
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
              {RESOURCE_UNIT_LABELS.LIST.ADD_BUTTON}
            </Button>
          </div>
        }
        data={resourceUnits}
        columns={columns}
        isLoading={isLoading}
        isError={isError}
        emptyMessage={RESOURCE_UNIT_LABELS.LIST.EMPTY}
        search={queryParams.search}
        onSearchChange={(v) => updateQueryParam('search', v)}
        sortBy={params.sortBy}
        sortOrder={params.sortOrder}
        onSort={(sortBy, sortOrder) => {
          setQueryParams({ sortBy, sortOrder });
        }}
        page={params.page}
        perPage={params.perPage}
        totalItems={totalItems}
        totalPages={totalPages}
        onPaginationChange={(page, perPage) => setQueryParams({ page, perPage })}
      />

      <ResourceUnitFormDrawer
        open={drawerOpen}
        onClose={handleDrawerClose}
        onSuccess={handleDrawerSuccess}
        editId={editId}
        companyId={companyId ?? null}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        variant="danger"
        title={RESOURCE_UNIT_LABELS.DELETE_DIALOG.TITLE}
        description={RESOURCE_UNIT_LABELS.DELETE_DIALOG.DESCRIPTION}
        cancelText={RESOURCE_UNIT_LABELS.DELETE_DIALOG.CANCEL}
        confirmText={RESOURCE_UNIT_LABELS.DELETE_DIALOG.CONFIRM}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
      />

      <ResourceUnitDetailDrawer
        open={detailTarget !== null}
        onClose={handleDetailClose}
        onEdit={handleDetailEdit}
        id={detailTarget}
        companyId={companyId}
      />
    </>
  );
}
