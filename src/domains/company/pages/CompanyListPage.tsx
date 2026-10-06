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
import { COMPANY_LABELS, STATUS_OPTIONS } from '../constants';
import { useCompanyPage } from '../hooks/use-company-page';
import type { CompanyListItem } from '../types';

interface CompanyUrlParams extends BaseQueryParams {
  isActive?: string;
}

function ProjectCapabilitiesCell({ company }: { company: CompanyListItem }) {
  const capabilities = company.projectCapabilities ?? [];
  const maxVisible = 2;
  const visible = capabilities.slice(0, maxVisible);
  const remaining = capabilities.length - maxVisible;

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {visible.map((cap) => (
        <Badge key={cap.id} variant="outline" className="text-[11px] font-normal px-1.5 py-0 h-5">
          {cap.name}
        </Badge>
      ))}
      {remaining > 0 && (
        <Badge variant="outline" className="text-[11px] font-normal px-1.5 py-0 h-5">
          +{remaining} Lainnya
        </Badge>
      )}
      {capabilities.length === 0 && <span className="text-xs text-slate-400">-</span>}
    </div>
  );
}

function CompanyActionsCell({
  row,
  onDetail,
  onEdit,
  onDeleteClick,
}: {
  row: Row<CompanyListItem>;
  onDetail?: (r: CompanyListItem) => void;
  onEdit?: (r: CompanyListItem) => void;
  onDeleteClick: (r: CompanyListItem) => void;
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
          {COMPANY_LABELS.LIST.ACTIONS.EDIT}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onDetail?.(row.original)}>
          <Eye className="mr-2 h-4 w-4" />
          {COMPANY_LABELS.LIST.ACTIONS.DETAIL}
        </DropdownMenuItem>
        <Separator className="flex-1 h-[0.05rem]" />
        <DropdownMenuItem
          onClick={() => onDeleteClick(row.original)}
          className="text-destructive focus:text-destructive"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          {COMPANY_LABELS.LIST.ACTIONS.DELETE}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function CompanyListPage() {
  const { queryParams, updateQueryParam, setQueryParams } = useQueryParams<CompanyUrlParams>();

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
    companies,
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
  } = useCompanyPage(pageOptions);

  const columns = useMemo<ColumnDef<CompanyListItem>[]>(
    () => [
      {
        accessorKey: 'code',
        header: COMPANY_LABELS.LIST.COLUMNS.CODE,
        size: 100,
      },
      {
        accessorKey: 'name',
        header: COMPANY_LABELS.LIST.COLUMNS.NAME,
        size: 250,
      },
      {
        id: 'projectCapabilities',
        header: COMPANY_LABELS.LIST.COLUMNS.PROJECT_CAPABILITIES,
        cell: ({ row }) => <ProjectCapabilitiesCell company={row.original} />,
        size: 280,
        enableSorting: false,
      },
      {
        accessorKey: 'status',
        header: COMPANY_LABELS.LIST.COLUMNS.STATUS,
        cell: ({ row }) =>
          row.original.isActive ? (
            <Badge variant="success">{COMPANY_LABELS.LIST.STATUS.ACTIVE}</Badge>
          ) : (
            <Badge variant="destructive">{COMPANY_LABELS.LIST.STATUS.INACTIVE}</Badge>
          ),
        size: 120,
      },
      {
        id: 'actions',
        header: COMPANY_LABELS.LIST.COLUMNS.ACTIONS,
        enableSorting: false,
        enableHiding: false,
        size: 60,
        cell: ({ row }) => (
          <CompanyActionsCell
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
      <AsyncSelect
        className="w-48 focus:ring-1 ring-primary"
        options={STATUS_OPTIONS}
        value={queryParams.isActive ?? null}
        placeholder={COMPANY_LABELS.LIST.FILTERS.STATUS}
        isSearchable={false}
        onChange={handleIsActiveChange}
        isClearable
      />
    ),
    [handleIsActiveChange, queryParams.isActive]
  );

  return (
    <>
      <ListPageTemplate<CompanyListItem>
        title={COMPANY_LABELS.LIST.TITLE}
        headerActions={
          <Button onClick={handleAdd} leftIcon={<PlusIcon />}>
            {COMPANY_LABELS.LIST.ADD_BUTTON}
          </Button>
        }
        data={companies}
        columns={columns}
        isLoading={isLoading}
        isError={isError}
        emptyMessage={COMPANY_LABELS.LIST.EMPTY}
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
        title={COMPANY_LABELS.DIALOG.DELETE_TITLE}
        description={COMPANY_LABELS.DIALOG.DELETE_DESCRIPTION}
        cancelText="Cancel"
        confirmText="Delete"
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
      />
    </>
  );
}
