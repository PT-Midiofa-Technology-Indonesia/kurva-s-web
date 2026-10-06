'use client';

import type { ColumnDef, Row } from '@tanstack/react-table';
import { EllipsisVertical, Eye, Pencil, PlusIcon, Trash2 } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';

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
import { useDebounce } from '@/shared/hooks/use-debounce';
import type { BaseQueryParams } from '@/types/query-params';
import { SkillCatalogDetailDrawer } from '../components/SkillCatalogDetailDrawer';
import { SKILL_CATALOG_LABELS, STATUS_OPTIONS } from '../constants';
import { useSkillCatalogListPage } from '../hooks/use-skill-catalog-list-page';
import { useSkillCategoriesInfinite } from '../hooks/use-skill-categories-infinite';
import { useSkillLevelsInfinite } from '../hooks/use-skill-levels-infinite';
import type { SkillCatalog } from '../types';

export interface SkillCatalogListContentUrlParams extends BaseQueryParams {
  isActive?: string;
  skillLevelId?: string;
  skillCategoryId?: string;
}

function SkillCatalogActionsCell({
  row,
  onDetail,
  onEdit,
  onDeleteClick,
}: {
  row: Row<SkillCatalog>;
  onDetail?: (r: SkillCatalog) => void;
  onEdit?: (r: SkillCatalog) => void;
  onDeleteClick: (r: SkillCatalog) => void;
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
          {SKILL_CATALOG_LABELS.LIST.ACTIONS.EDIT}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onDetail?.(row.original)}>
          <Eye className="mr-2 h-4 w-4" />
          {SKILL_CATALOG_LABELS.LIST.ACTIONS.DETAIL}
        </DropdownMenuItem>
        <Separator className="flex-1 h-[0.05rem]" />
        <DropdownMenuItem
          onClick={() => onDeleteClick(row.original)}
          className="text-destructive focus:text-destructive"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          {SKILL_CATALOG_LABELS.LIST.ACTIONS.DELETE}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function SkillCatalogListContent() {
  const { queryParams, updateQueryParam, setQueryParams } =
    useQueryParams<SkillCatalogListContentUrlParams>();

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
      skillLevelId: queryParams.skillLevelId || undefined,
      skillCategoryId: queryParams.skillCategoryId || undefined,
    }),
    [queryParams]
  );

  const pageOptions = useMemo(
    () => ({
      params,
      tab: 'skill' as const,
      onUpdateQueryParam: updateQueryParam,
      onSetQueryParams: setQueryParams,
    }),
    [params, updateQueryParam, setQueryParams]
  );

  const {
    skillCatalogs,
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
    handleSkillLevelChange,
    handleSkillCategoryChange,
    handleIsActiveChange,
    handleSort,
    handlePaginationChange,
    detailTarget,
    handleDetail,
    handleDetailClose,
  } = useSkillCatalogListPage(pageOptions);

  const [skillLevelSearch, setSkillLevelSearch] = useState('');
  const [skillCategorySearch, setSkillCategorySearch] = useState('');
  const debouncedSkillLevelSearch = useDebounce(skillLevelSearch, 300);
  const debouncedSkillCategorySearch = useDebounce(skillCategorySearch, 300);

  const {
    options: skillLevelOptions,
    hasMore: hasMoreSkillLevels,
    isFetchingNextPage: isFetchingMoreSkillLevels,
    loadMore: loadMoreSkillLevels,
  } = useSkillLevelsInfinite({ search: debouncedSkillLevelSearch });

  const {
    options: skillCategoryOptions,
    hasMore: hasMoreSkillCategories,
    isFetchingNextPage: isFetchingMoreSkillCategories,
    loadMore: loadMoreSkillCategories,
  } = useSkillCategoriesInfinite({ search: debouncedSkillCategorySearch });

  const handleSkillLevelSearchChange = useCallback((v: string) => setSkillLevelSearch(v), []);
  const handleSkillLevelScrollToBottom = useCallback(() => {
    if (hasMoreSkillLevels && !isFetchingMoreSkillLevels) loadMoreSkillLevels();
  }, [hasMoreSkillLevels, isFetchingMoreSkillLevels, loadMoreSkillLevels]);

  const handleSkillCategorySearchChange = useCallback((v: string) => setSkillCategorySearch(v), []);
  const handleSkillCategoryScrollToBottom = useCallback(() => {
    if (hasMoreSkillCategories && !isFetchingMoreSkillCategories) loadMoreSkillCategories();
  }, [hasMoreSkillCategories, isFetchingMoreSkillCategories, loadMoreSkillCategories]);

  const columns = useMemo<ColumnDef<SkillCatalog>[]>(
    () => [
      {
        accessorKey: 'code',
        header: SKILL_CATALOG_LABELS.LIST.COLUMNS.CODE,
        size: 100,
      },
      {
        accessorKey: 'name',
        header: SKILL_CATALOG_LABELS.LIST.COLUMNS.NAME,
        size: 200,
      },
      {
        accessorKey: 'skillCategoryName',
        header: SKILL_CATALOG_LABELS.LIST.COLUMNS.SKILL_CATEGORY,
        size: 200,
        cell: ({ row }) => (
          <Badge variant="secondary" className="bg-slate-100 text-slate-950 rounded-md">
            {row.original.skillCategory?.name ?? '-'}
          </Badge>
        ),
      },
      {
        accessorKey: 'skillLevelName',
        header: SKILL_CATALOG_LABELS.LIST.COLUMNS.SKILL_LEVEL,
        size: 150,
        cell: ({ row }) => (
          <Badge variant="secondary" className="bg-slate-100 text-slate-950 rounded-md">
            {row.original.skillLevel?.name ?? '-'}
          </Badge>
        ),
      },
      {
        accessorKey: 'status',
        header: SKILL_CATALOG_LABELS.LIST.COLUMNS.STATUS,
        cell: ({ row }) =>
          row.original.isActive ? (
            <Badge variant="success">{SKILL_CATALOG_LABELS.LIST.STATUS.ACTIVE}</Badge>
          ) : (
            <Badge variant="destructive">{SKILL_CATALOG_LABELS.LIST.STATUS.INACTIVE}</Badge>
          ),
      },
      {
        id: 'actions',
        header: SKILL_CATALOG_LABELS.LIST.COLUMNS.ACTIONS,
        enableSorting: false,
        enableHiding: false,
        size: 60,
        cell: ({ row }) => (
          <SkillCatalogActionsCell
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
      <div className="flex gap-3">
        <AsyncSelect
          className="w-48 focus:ring-1 ring-primary"
          options={skillLevelOptions}
          placeholder={SKILL_CATALOG_LABELS.LIST.FILTERS.SKILL_LEVEL}
          isSearchable
          onChange={handleSkillLevelChange}
          isClearable
          onScrollToBottom={handleSkillLevelScrollToBottom}
          onSearchChange={handleSkillLevelSearchChange}
        />
        <AsyncSelect
          className="w-48 focus:ring-1 ring-primary"
          options={skillCategoryOptions}
          placeholder={SKILL_CATALOG_LABELS.LIST.FILTERS.SKILL_CATEGORY}
          isSearchable
          onChange={handleSkillCategoryChange}
          isClearable
          onScrollToBottom={handleSkillCategoryScrollToBottom}
          onSearchChange={handleSkillCategorySearchChange}
        />
        <AsyncSelect
          className="w-48 focus:ring-1 ring-primary"
          options={STATUS_OPTIONS}
          placeholder={SKILL_CATALOG_LABELS.LIST.FILTERS.STATUS}
          isSearchable={false}
          onChange={handleIsActiveChange}
          isClearable
        />
      </div>
    ),
    [
      handleIsActiveChange,
      handleSkillLevelChange,
      handleSkillCategoryChange,
      skillLevelOptions,
      skillCategoryOptions,
      handleSkillLevelScrollToBottom,
      handleSkillLevelSearchChange,
      handleSkillCategoryScrollToBottom,
      handleSkillCategorySearchChange,
    ]
  );

  return (
    <>
      <ListPageTemplate<SkillCatalog>
        title={SKILL_CATALOG_LABELS.LIST.TITLE}
        headerActions={
          <Button onClick={handleAdd} leftIcon={<PlusIcon />}>
            Tambah Skill Catalog Baru
          </Button>
        }
        data={skillCatalogs}
        columns={columns}
        isLoading={isLoading}
        isError={isError}
        emptyMessage={SKILL_CATALOG_LABELS.LIST.EMPTY}
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
          title={SKILL_CATALOG_LABELS.LIST.DIALOG.DELETE_TITLE}
          description={SKILL_CATALOG_LABELS.LIST.DIALOG.DELETE_DESCRIPTION}
          cancelText={SKILL_CATALOG_LABELS.LIST.DIALOG.CANCEL}
          confirmText={SKILL_CATALOG_LABELS.LIST.DIALOG.CONFIRM}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={handleDeleteConfirm}
          isLoading={isDeleting}
        />
      )}

      {detailTarget && (
        <SkillCatalogDetailDrawer
          open={!!detailTarget}
          onClose={handleDetailClose}
          onEdit={() => {
            if (detailTarget) {
              handleDetailClose();
              handleEdit({ id: detailTarget });
            }
          }}
          id={detailTarget}
        />
      )}
    </>
  );
}
