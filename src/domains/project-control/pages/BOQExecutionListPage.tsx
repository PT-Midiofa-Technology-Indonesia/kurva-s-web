'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { Settings } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useMemo, useState } from 'react';
import { useQueryParams } from '@/hooks/use-query-params';
import { AsyncSelect } from '@/shared/components/atoms';
import type { BOQProjectListItem } from '@/shared/components/templates/BOQ/types/boq-project-list.types';
import { ListPageTemplate } from '@/shared/components/templates/ListPageTemplate';
import { Badge } from '@/shared/components/ui';
import { useCompanyFilter } from '@/shared/hooks/use-company-filter';
import type { BaseQueryParams } from '@/types/query-params';
import { BOQProjectDetailDrawer } from '../components';
import { BOQ_EXECUTION_STATUS_OPTIONS } from '../constants';
import { useBOQProjectListPage } from '../hooks/use-boq-project-list-page';

interface BOQExecutionUrlParams extends BaseQueryParams {
  companyId?: string;
  statusBoqExecution?: string;
}

export function BOQExecutionListPage() {
  const router = useRouter();
  const { queryParams, updateQueryParam, setQueryParams } = useQueryParams<BOQExecutionUrlParams>();

  const [selectedProject, setSelectedProject] = useState<BOQProjectListItem | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const { companyId, companyOptions, handleCompanyChange } = useCompanyFilter();

  const params = useMemo(
    () => ({
      page: queryParams.page ?? 1,
      perPage: queryParams.perPage ?? 10,
      search: queryParams.search,
      statusBoqExecution: queryParams.statusBoqExecution,
    }),
    [queryParams]
  );

  const pageOptions = useMemo(
    () => ({
      stage: 'execution' as const,
      companyId,
      params,
      onUpdateQueryParam: updateQueryParam,
      onSetQueryParams: setQueryParams,
    }),
    [companyId, params, updateQueryParam, setQueryParams]
  );

  const {
    projects,
    isLoading,
    totalItems,
    totalPages,
    handleSearchChange,
    handleFilterChange,
    handlePaginationChange,
  } = useBOQProjectListPage(pageOptions);

  const handleActionClick = useCallback(
    (project: BOQProjectListItem) => {
      if (project.statusBoqExecution) {
        router.push(`/project-control/boq-management/${project.id}/detail?tab=execution`);
        return;
      }
      setSelectedProject(project);
      setIsDrawerOpen(true);
    },
    [router]
  );

  const handleDrawerClose = useCallback(() => {
    setIsDrawerOpen(false);
    setSelectedProject(null);
  }, []);

  const handleSetCCO = useCallback(() => {
    if (!selectedProject) return;
    const projectId = selectedProject.id;
    setIsDrawerOpen(false);
    setSelectedProject(null);
    router.push(`/project-control/boq-management/${projectId}/detail?tab=execution`);
  }, [selectedProject, router]);

  const columns = useMemo<ColumnDef<BOQProjectListItem>[]>(
    () => [
      {
        accessorKey: 'projectName',
        header: 'Project',
      },
      {
        accessorKey: 'projectOwner',
        header: 'Project Owner',
      },
      {
        accessorKey: 'settingStatus',
        header: 'Execution',
        cell: ({ row }) => {
          const isComplete = row.original.settingStatus === 'complete';
          return (
            <Badge variant={isComplete ? 'success' : 'destructive'}>
              {isComplete ? 'Complete' : 'Incomplete'}
            </Badge>
          );
        },
      },
      {
        id: 'action',
        header: 'Action',
        enableSorting: false,
        size: 32,
        cell: ({ row }) => (
          <button
            type="button"
            className="flex items-center gap-1 text-teal-600 cursor-pointer"
            onClick={() => handleActionClick(row.original)}
          >
            <Settings size={16} />
            <span className="text-sm">CCO</span>
          </button>
        ),
      },
    ],
    [handleActionClick]
  );

  const handleStatusFilterChange = useCallback(
    (value: string | string[] | null | undefined) => {
      const stringValue = Array.isArray(value) ? value[0] : value;
      handleFilterChange((stringValue ?? 'all') as string);
    },
    [handleFilterChange]
  );

  const filters = useMemo(
    () => (
      <AsyncSelect
        className="w-48"
        options={BOQ_EXECUTION_STATUS_OPTIONS}
        placeholder="Semua Status"
        value={queryParams.statusBoqExecution ?? null}
        isSearchable={false}
        onChange={handleStatusFilterChange}
        isClearable
      />
    ),
    [handleStatusFilterChange, queryParams.statusBoqExecution]
  );

  const handleSearch = useCallback(
    (value: string | undefined) => handleSearchChange(value ?? ''),
    [handleSearchChange]
  );

  return (
    <>
      <ListPageTemplate<BOQProjectListItem>
        title="BoQ Execution"
        headerActions={
          <AsyncSelect
            className="w-52"
            options={companyOptions}
            value={companyId ?? null}
            onChange={handleCompanyChange}
            placeholder="Pilih Company"
            isSearchable={false}
            isClearable={false}
          />
        }
        data={projects}
        columns={columns}
        isLoading={isLoading}
        search={queryParams.search}
        onSearchChange={handleSearch}
        page={queryParams.page ?? 1}
        perPage={queryParams.perPage ?? 10}
        totalItems={totalItems}
        totalPages={totalPages}
        onPaginationChange={handlePaginationChange}
        toolbarRight={filters}
        emptyMessage="Belau ada data"
      />

      <BOQProjectDetailDrawer
        open={isDrawerOpen}
        onClose={handleDrawerClose}
        project={selectedProject}
        onSetBoQ={handleSetCCO}
        title="Detail BoQ Execution"
        actionLabel="Set CCO"
        settingLabel="Setting CCO"
      />
    </>
  );
}
