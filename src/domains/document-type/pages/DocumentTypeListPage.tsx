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
import { DocumentTypeDetailDrawer } from '../components/DocumentTypeDetailDrawer';
import { DOCUMENT_TYPE_LABELS, STATUS_OPTIONS } from '../constants';
import { useDocumentTypePage } from '../hooks/use-document-type-page';
import { parseFileTypesString } from '../services/file-types';
import type { DocumentType } from '../types';

export interface DocumentTypeUrlParams extends BaseQueryParams {
  isActive?: string;
  includeProtected?: string;
}

function DocumentTypeActionsCell({
  row,
  onDetail,
  onEdit,
  onDeleteClick,
}: {
  row: Row<DocumentType>;
  onDetail?: (r: DocumentType) => void;
  onEdit?: (r: DocumentType) => void;
  onDeleteClick: (r: DocumentType) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-6 w-6 p-0">
          <EllipsisVertical className="h-4 w-4 text-slate-950" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onDetail?.(row.original)}>
          <Eye className="mr-2 h-4 w-4" />
          {DOCUMENT_TYPE_LABELS.LIST.ACTIONS.DETAIL}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onEdit?.(row.original)}>
          <Pencil className="mr-2 h-4 w-4" />
          {DOCUMENT_TYPE_LABELS.LIST.ACTIONS.EDIT}
        </DropdownMenuItem>
        {!row.original.isProtected && (
          <>
            <Separator className="flex-1 h-[0.05rem]" />
            <DropdownMenuItem
              onClick={() => onDeleteClick(row.original)}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              {DOCUMENT_TYPE_LABELS.LIST.ACTIONS.DELETE}
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function FileTypesCell({ value }: { value: string | null }) {
  const types = parseFileTypesString(value);
  if (types.length === 0) return <span className="text-slate-400">-</span>;
  return (
    <div className="flex flex-wrap gap-1.5">
      {types.map((t) => (
        <Badge key={t} variant="secondary" className="rounded-md">
          {t}
        </Badge>
      ))}
    </div>
  );
}

export function DocumentTypeListPage() {
  const { queryParams, updateQueryParam, setQueryParams } = useQueryParams<DocumentTypeUrlParams>();

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
      includeProtected: true,
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
    documentTypes,
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
  } = useDocumentTypePage(pageOptions);

  const columns = useMemo<ColumnDef<DocumentType>[]>(
    () => [
      {
        accessorKey: 'code',
        header: DOCUMENT_TYPE_LABELS.LIST.COLUMNS.CODE,
        size: 100,
      },
      {
        accessorKey: 'name',
        header: DOCUMENT_TYPE_LABELS.LIST.COLUMNS.NAME,
        size: 250,
      },
      {
        id: 'allowedFileTypes',
        header: DOCUMENT_TYPE_LABELS.LIST.COLUMNS.FILE_TYPES,
        enableSorting: false,
        cell: ({ row }) => <FileTypesCell value={row.original.allowedFileTypes} />,
      },
      {
        id: 'allowedFileSize',
        header: DOCUMENT_TYPE_LABELS.LIST.COLUMNS.FILE_SIZE,
        enableSorting: false,
        cell: ({ row }) => {
          const fz = row.original.allowedFileSize;
          if (fz == null) return '-';
          return `${fz} KB`;
        },
      },
      {
        accessorKey: 'isActive',
        header: DOCUMENT_TYPE_LABELS.LIST.COLUMNS.STATUS,
        cell: ({ row }) =>
          row.original.isActive ? (
            <Badge variant="success">{DOCUMENT_TYPE_LABELS.LIST.STATUS.ACTIVE}</Badge>
          ) : (
            <Badge variant="destructive">{DOCUMENT_TYPE_LABELS.LIST.STATUS.INACTIVE}</Badge>
          ),
      },
      {
        id: 'actions',
        header: DOCUMENT_TYPE_LABELS.LIST.COLUMNS.ACTIONS,
        enableSorting: false,
        enableHiding: false,
        size: 60,
        cell: ({ row }) => (
          <DocumentTypeActionsCell
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
        placeholder={DOCUMENT_TYPE_LABELS.LIST.FILTERS.STATUS}
        isSearchable={false}
        onChange={handleIsActiveChange}
        isClearable
      />
    ),
    [handleIsActiveChange, queryParams.isActive]
  );

  return (
    <>
      <ListPageTemplate<DocumentType>
        title={DOCUMENT_TYPE_LABELS.LIST.TITLE}
        headerActions={
          <Button onClick={handleAdd} leftIcon={<PlusIcon />}>
            {DOCUMENT_TYPE_LABELS.LIST.ADD_BUTTON}
          </Button>
        }
        data={documentTypes}
        columns={columns}
        isLoading={isLoading}
        isError={isError}
        emptyMessage={DOCUMENT_TYPE_LABELS.LIST.EMPTY}
        searchPlaceholder={DOCUMENT_TYPE_LABELS.LIST.SEARCH_PLACEHOLDER}
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
        title={DOCUMENT_TYPE_LABELS.DIALOG.DELETE_TITLE}
        description={DOCUMENT_TYPE_LABELS.DIALOG.DELETE_DESCRIPTION}
        cancelText={DOCUMENT_TYPE_LABELS.LIST.ACTIONS.DELETE ? 'Batal' : 'Cancel'}
        confirmText={DOCUMENT_TYPE_LABELS.LIST.ACTIONS.DELETE ? 'Hapus' : 'Delete'}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
      />

      <DocumentTypeDetailDrawer
        open={detailTarget !== null}
        onClose={handleDetailClose}
        onEdit={handleDetailEdit}
        id={detailTarget}
        onSuccess={handleDetailSuccess}
      />
    </>
  );
}
