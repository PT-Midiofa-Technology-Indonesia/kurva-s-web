'use client';

import { useQueryClient } from '@tanstack/react-query';
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
import { SkillCategoryDetailDrawer } from '../components/SkillCategoryDetailDrawer';
import { SKILL_CATEGORY_LABELS, STATUS_OPTIONS } from '../constants';
import { SKILL_CATEGORY_QUERY_KEYS } from '../hooks/use-skill-categories';
import { useSkillCategoryListPage } from '../hooks/use-skill-category-list-page';
import type { SkillCategory } from '../types';

export interface SkillCategoryListContentUrlParams extends BaseQueryParams {
  isActive?: string;
}

function SkillCategoryActionsCell({
  row,
  onDetail,
  onEdit,
  onDeleteClick,
}: {
  row: Row<SkillCategory>;
  onDetail?: (r: SkillCategory) => void;
  onEdit?: (r: SkillCategory) => void;
  onDeleteClick: (r: SkillCategory) => void;
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
          {SKILL_CATEGORY_LABELS.LIST.ACTIONS.EDIT}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onDetail?.(row.original)}>
          <Eye className="mr-2 h-4 w-4" />
          {SKILL_CATEGORY_LABELS.LIST.ACTIONS.DETAIL}
        </DropdownMenuItem>
        <Separator className="flex-1 h-[0.05rem]" />
        <DropdownMenuItem
          onClick={() => onDeleteClick(row.original)}
          className="text-destructive focus:text-destructive"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          {SKILL_CATEGORY_LABELS.LIST.ACTIONS.DELETE}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function SkillCategoryListContent() {
  const queryClient = useQueryClient();
  const { queryParams, updateQueryParam, setQueryParams } =
    useQueryParams<SkillCategoryListContentUrlParams>();

  const params = useMemo(
    () => ({
      page: queryParams.page ?? 1,
      perPage: queryParams.perPage ?? 10,
      sortBy: queryParams.sortBy ?? 'name',
      sortOrder: (queryParams.sortOrder || 'asc') as 'asc' | 'desc',
      search: queryParams.search,
      isActive:
        queryParams.isActive === 'true'
          ? true
          : queryParams.isActive === 'false'
            ? false
            : undefined,
    }),
    [queryParams]
  );

  const pageOptions = useMemo(
    () => ({
      params,
      tab: 'skill-category' as const,
      onUpdateQueryParam: updateQueryParam,
      onSetQueryParams: setQueryParams,
    }),
    [params, updateQueryParam, setQueryParams]
  );

  const {
    skillCategories,
    totalItems,
    totalPages,
    isLoading,
    isError,
    isDeleting,
    handleAdd,
    handleEdit,
    handleDeleteClick,
    handleDeleteConfirm,
    deleteTarget,
    setDeleteTarget,
    handleSearchChange,
    handleIsActiveChange,
    handleSort,
    handlePaginationChange,
    detailTarget,
    handleDetail,
    handleDetailClose,
  } = useSkillCategoryListPage(pageOptions);

  const columns = useMemo<ColumnDef<SkillCategory>[]>(
    () => [
      {
        accessorKey: 'code',
        header: SKILL_CATEGORY_LABELS.LIST.COLUMNS.CODE,
        size: 100,
      },
      {
        accessorKey: 'name',
        header: SKILL_CATEGORY_LABELS.LIST.COLUMNS.NAME,
        size: 300,
      },
      {
        accessorKey: 'description',
        header: SKILL_CATEGORY_LABELS.LIST.COLUMNS.DESCRIPTION,
        size: 300,
      },
      {
        accessorKey: 'status',
        header: SKILL_CATEGORY_LABELS.LIST.COLUMNS.STATUS,
        cell: ({ row }) =>
          row.original.isActive ? (
            <Badge variant="success">{SKILL_CATEGORY_LABELS.LIST.STATUS.ACTIVE}</Badge>
          ) : (
            <Badge variant="destructive">{SKILL_CATEGORY_LABELS.LIST.STATUS.INACTIVE}</Badge>
          ),
      },
      {
        id: 'actions',
        header: SKILL_CATEGORY_LABELS.LIST.COLUMNS.ACTIONS,
        enableSorting: false,
        enableHiding: false,
        size: 60,
        cell: ({ row }) => (
          <SkillCategoryActionsCell
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
        placeholder={SKILL_CATEGORY_LABELS.LIST.FILTERS.STATUS}
        isSearchable={false}
        onChange={handleIsActiveChange}
        isClearable
      />
    ),
    [handleIsActiveChange]
  );

  return (
    <>
      <ListPageTemplate<SkillCategory>
        title={SKILL_CATEGORY_LABELS.LIST.TITLE}
        headerActions={
          <Button onClick={handleAdd} leftIcon={<PlusIcon />}>
            Tambah Skill Category Baru
          </Button>
        }
        data={skillCategories}
        columns={columns}
        isLoading={isLoading}
        isError={isError}
        emptyMessage={SKILL_CATEGORY_LABELS.LIST.EMPTY}
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

      {deleteTarget && (
        <ConfirmDialog
          open={!!deleteTarget}
          onOpenChange={(open) => {
            if (!open) setDeleteTarget(null);
          }}
          variant="default"
          title={SKILL_CATEGORY_LABELS.LIST.ACTIONS.DELETE}
          description={`Apakah Anda yakin ingin menghapus "${deleteTarget.name}"?`}
          cancelText="Batal"
          confirmText="Hapus"
          onCancel={() => setDeleteTarget(null)}
          onConfirm={handleDeleteConfirm}
          isLoading={isDeleting}
        />
      )}

      {detailTarget && (
        <SkillCategoryDetailDrawer
          open={!!detailTarget}
          onClose={handleDetailClose}
          onEdit={() => {
            if (detailTarget) {
              handleDetailClose();
              handleEdit({ id: detailTarget });
            }
          }}
          id={detailTarget}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: SKILL_CATEGORY_QUERY_KEYS.all });
            queryClient.invalidateQueries({ queryKey: SKILL_CATEGORY_QUERY_KEYS.infinite() });
          }}
        />
      )}
    </>
  );
}
