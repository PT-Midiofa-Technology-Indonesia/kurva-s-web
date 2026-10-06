'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { useMemo } from 'react';
import { useQueryParams } from '@/hooks/use-query-params';
import { AsyncSelect } from '@/shared/components/atoms';
import { ListPageTemplate } from '@/shared/components/templates/ListPageTemplate';
import { Badge } from '@/shared/components/ui';
import type { BaseQueryParams } from '@/types/query-params';
import { SKILL_LEVEL_LABELS, STATUS_OPTIONS } from '../constants';
import { useSkillLevelPage } from '../hooks/use-skill-level-page';
import type { SkillLevel } from '../types';

interface SkillLevelUrlParams extends BaseQueryParams {
  isActive?: string;
  tab?: string;
}

export function SkillLevelListContent() {
  const { queryParams, updateQueryParam, setQueryParams } = useQueryParams<SkillLevelUrlParams>();

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
    skillLevels,
    totalItems,
    totalPages,
    isLoading,
    isError,
    handleIsActiveChange,
    handleSearchChange,
    handleSort,
    handlePaginationChange,
  } = useSkillLevelPage(pageOptions);

  const columns = useMemo<ColumnDef<SkillLevel>[]>(
    () => [
      {
        accessorKey: 'code',
        header: SKILL_LEVEL_LABELS.LIST.COLUMNS.CODE,
        size: 100,
      },
      {
        accessorKey: 'name',
        header: SKILL_LEVEL_LABELS.LIST.COLUMNS.NAME,
        size: 200,
      },
      {
        accessorKey: 'status',
        header: SKILL_LEVEL_LABELS.LIST.COLUMNS.STATUS,
        cell: ({ row }) =>
          row.original.isActive ? (
            <Badge variant="success">{SKILL_LEVEL_LABELS.LIST.STATUS.ACTIVE}</Badge>
          ) : (
            <Badge variant="destructive">{SKILL_LEVEL_LABELS.LIST.STATUS.INACTIVE}</Badge>
          ),
      },
    ],
    []
  );

  const filters = useMemo(
    () => (
      <AsyncSelect
        className="w-48 focus:ring-1 ring-primary"
        options={STATUS_OPTIONS}
        placeholder={SKILL_LEVEL_LABELS.LIST.FILTERS.STATUS}
        isSearchable={false}
        onChange={handleIsActiveChange}
        isClearable
      />
    ),
    [handleIsActiveChange]
  );

  return (
    <ListPageTemplate<SkillLevel>
      title={SKILL_LEVEL_LABELS.LIST.TITLE}
      data={skillLevels}
      columns={columns}
      isLoading={isLoading}
      isError={isError}
      emptyMessage={SKILL_LEVEL_LABELS.LIST.EMPTY}
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
  );
}
