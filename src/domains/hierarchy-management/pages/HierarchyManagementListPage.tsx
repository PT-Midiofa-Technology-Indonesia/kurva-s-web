'use client';

import type { ColumnDef, Row, SortingState } from '@tanstack/react-table';
import { EllipsisVertical, Eye, Pencil, PlusIcon, Trash2 } from 'lucide-react';
import { useCallback, useMemo } from 'react';
import { useQueryParams } from '@/hooks/use-query-params';
import { AsyncSelect, Button, SegmentedControl } from '@/shared/components/atoms';
import { ConfirmDialog } from '@/shared/components/molecules/AlertDialog';
import { DataTableLayout } from '@/shared/components/templates/DataTableLayout';
import { PageTableTemplate } from '@/shared/components/templates/PageTableTemplate';
import { Badge, Separator } from '@/shared/components/ui';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import { useCompanyFilter } from '@/shared/hooks/use-company-filter';
import type { BaseQueryParams } from '@/types/query-params';
import { HierarchyManagementDetailDrawer } from '../components/HierarchyManagementDetailDrawer';
import { HierarchyManagementDiagramView } from '../components/HierarchyManagementDiagramView';
import { HierarchyManagementTreeView } from '../components/HierarchyManagementTreeView';
import { HIERARCHY_MANAGEMENT_LABELS, STATUS_OPTIONS } from '../constants';
import { useHierarchyManagementPage } from '../hooks/use-hierarchy-management-page';
import type { HierarchyManagementListItem } from '../types';

type ViewType = 'table' | 'tree' | 'diagram';

interface HierarchyManagementUrlParams extends BaseQueryParams {
  isActive?: string;
  view?: string;
  companyId?: string;
}

function HierarchyManagementActionsCell({
  row,
  onDetail,
  onEdit,
  onDeleteClick,
}: {
  row: Row<HierarchyManagementListItem>;
  onDetail?: (r: HierarchyManagementListItem) => void;
  onEdit?: (r: HierarchyManagementListItem) => void;
  onDeleteClick: (r: HierarchyManagementListItem) => void;
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
          {HIERARCHY_MANAGEMENT_LABELS.LIST.ACTIONS.EDIT}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onDetail?.(row.original)}>
          <Eye className="mr-2 h-4 w-4" />
          {HIERARCHY_MANAGEMENT_LABELS.LIST.ACTIONS.DETAIL}
        </DropdownMenuItem>
        <Separator className="flex-1 h-[0.05rem]" />
        <DropdownMenuItem
          onClick={() => onDeleteClick(row.original)}
          className="text-destructive focus:text-destructive"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          {HIERARCHY_MANAGEMENT_LABELS.LIST.ACTIONS.DELETE}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function HierarchyManagementListPage() {
  const { queryParams, updateQueryParam, setQueryParams } =
    useQueryParams<HierarchyManagementUrlParams>();

  const view = (queryParams.view as ViewType) ?? 'table';
  const { companyId, companyOptions, handleCompanyChange } = useCompanyFilter();

  // ── Table params ──────────────────────────────────────────────────────────

  const params = useMemo(() => {
    const isActive =
      queryParams.isActive === 'true' ? true : queryParams.isActive === 'false' ? false : undefined;

    return {
      page: queryParams.page ?? 1,
      perPage: queryParams.perPage ?? 10,
      sortBy: queryParams.sortBy,
      sortOrder: (queryParams.sortOrder || 'asc') as 'asc' | 'desc',
      search: queryParams.search,
      isActive,
      companyId,
    };
  }, [queryParams, companyId]);

  const pageOptions = useMemo(
    () => ({
      params,
      onUpdateQueryParam: updateQueryParam,
      onSetQueryParams: setQueryParams,
    }),
    [params, updateQueryParam, setQueryParams]
  );

  const {
    hierarchyManagements,
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
  } = useHierarchyManagementPage(pageOptions);

  const handleViewChange = useCallback(
    (val: string) => {
      updateQueryParam('view', val === 'table' ? undefined : val);
    },
    [updateQueryParam]
  );

  // ── Columns ───────────────────────────────────────────────────────────────

  const columns = useMemo<ColumnDef<HierarchyManagementListItem>[]>(
    () => [
      {
        id: 'positionCode',
        header: HIERARCHY_MANAGEMENT_LABELS.LIST.COLUMNS.CODE,
        size: 100,
        cell: ({ row }) => row.original.position?.code,
      },
      {
        id: 'positionName',
        header: HIERARCHY_MANAGEMENT_LABELS.LIST.COLUMNS.NAME,
        size: 200,
        cell: ({ row }) => row.original.position?.name,
      },
      {
        id: 'department',
        header: HIERARCHY_MANAGEMENT_LABELS.LIST.COLUMNS.DEPARTMENT,
        size: 180,
        cell: ({ row }) => row.original.department?.name ?? '-',
      },
      {
        accessorKey: 'status',
        header: HIERARCHY_MANAGEMENT_LABELS.LIST.COLUMNS.STATUS,
        cell: ({ row }) =>
          row.original.isActive ? (
            <Badge variant="success">{HIERARCHY_MANAGEMENT_LABELS.LIST.STATUS.ACTIVE}</Badge>
          ) : (
            <Badge variant="destructive">{HIERARCHY_MANAGEMENT_LABELS.LIST.STATUS.INACTIVE}</Badge>
          ),
      },
      {
        id: 'actions',
        header: HIERARCHY_MANAGEMENT_LABELS.LIST.COLUMNS.ACTIONS,
        enableSorting: false,
        enableHiding: false,
        size: 60,
        cell: ({ row }) => (
          <HierarchyManagementActionsCell
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
    <>
      <PageTableTemplate
        title={HIERARCHY_MANAGEMENT_LABELS.LIST.TITLE}
        headerActions={
          <div className="flex items-center gap-2">
            <AsyncSelect
              className="w-52"
              options={companyOptions}
              value={companyId ?? null}
              onChange={handleCompanyChange}
              placeholder={HIERARCHY_MANAGEMENT_LABELS.LIST.FILTERS.COMPANY}
              isSearchable={false}
              isClearable={false}
            />
            <Button onClick={handleAdd} leftIcon={<PlusIcon />}>
              {HIERARCHY_MANAGEMENT_LABELS.LIST.ADD_BUTTON}
            </Button>
          </div>
        }
        search={queryParams.search}
        onSearchChange={handleSearchChange}
        toolbarRight={
          <div className="flex items-center gap-2">
            <SegmentedControl
              value={view}
              onChange={handleViewChange}
              options={[
                { value: 'table', label: 'Table' },
                { value: 'tree', label: 'Tree' },
                { value: 'diagram', label: 'Diagram' },
              ]}
            />
            <AsyncSelect
              className="w-48 focus:ring-1 ring-primary"
              options={STATUS_OPTIONS}
              placeholder={HIERARCHY_MANAGEMENT_LABELS.LIST.FILTERS.STATUS}
              isSearchable={false}
              value={queryParams.isActive ?? null}
              onChange={handleIsActiveChange}
              isClearable
            />
          </div>
        }
      >
        {view === 'table' &&
          (isError ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-red-600">Something went wrong. Please try again.</p>
            </div>
          ) : (
            <DataTableLayout
              columns={columns}
              data={hierarchyManagements}
              initialSorting={initialSorting}
              onSortingChange={handleSortingChange}
              initialPage={params.page}
              initialPageSize={params.perPage}
              onPaginationChange={handlePaginationChange}
              totalItems={totalItems}
              totalPages={totalPages}
              emptyMessage={HIERARCHY_MANAGEMENT_LABELS.LIST.EMPTY}
              enableRowSelection={false}
              enableColumnResize={false}
              enableColumnDnd={false}
              enablePagination
              enableZebraStripes={false}
              className="shadow-none rounded-none"
              isLoading={isLoading}
            />
          ))}

        {view === 'tree' && (
          <HierarchyManagementTreeView
            companyId={companyId}
            search={params.search}
            isActive={params.isActive}
            page={params.page}
            perPage={params.perPage}
            onPaginationChange={handlePaginationChange}
            onEdit={handleEdit}
            onDetail={handleDetail}
            onDeleteClick={handleDeleteClick}
          />
        )}

        {view === 'diagram' && (
          <HierarchyManagementDiagramView
            companyId={companyId}
            search={params.search}
            isActive={params.isActive}
          />
        )}
      </PageTableTemplate>

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        variant="danger"
        title={HIERARCHY_MANAGEMENT_LABELS.DIALOG.DELETE_TITLE}
        description={HIERARCHY_MANAGEMENT_LABELS.DIALOG.DELETE_DESCRIPTION}
        cancelText="Cancel"
        confirmText="Delete"
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
      />

      <HierarchyManagementDetailDrawer
        open={detailTarget !== null}
        onClose={handleDetailClose}
        onEdit={handleDetailEdit}
        id={detailTarget}
        onSuccess={handleDetailSuccess}
      />
    </>
  );
}
