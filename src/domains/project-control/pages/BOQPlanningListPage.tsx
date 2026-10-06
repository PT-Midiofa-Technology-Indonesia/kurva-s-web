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
import { BOQProjectDetailDrawer, BOQTemplateSelectModal } from '../components';
import { BOQ_LIST_PAGE_LABELS, BOQ_PLANNING_STATUS_OPTIONS } from '../constants';
import { useBOQProjectListPage } from '../hooks/use-boq-project-list-page';

const labels = BOQ_LIST_PAGE_LABELS.PLANNING;

interface BOQPlanningUrlParams extends BaseQueryParams {
  companyId?: string;
  statusBoqPlanning?: string;
}

export function BOQPlanningListPage() {
  const router = useRouter();
  const { queryParams, updateQueryParam, setQueryParams } = useQueryParams<BOQPlanningUrlParams>();

  const [selectedProject, setSelectedProject] = useState<BOQProjectListItem | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { companyId, companyOptions, handleCompanyChange } = useCompanyFilter();

  const params = useMemo(
    () => ({
      page: queryParams.page ?? 1,
      perPage: queryParams.perPage ?? 10,
      search: queryParams.search,
      statusBoqPlanning: queryParams.statusBoqPlanning,
    }),
    [queryParams]
  );

  const pageOptions = useMemo(
    () => ({
      stage: 'planning' as const,
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
      if (project.statusBoqPlanning) {
        router.push(`/project-control/boq-management/${project.id}/detail?tab=planning`);
        return;
      }
      setSelectedProject(project);
      setIsDrawerOpen(true);
    },
    [router]
  );

  const handleDrawerClose = useCallback(() => {
    setIsDrawerOpen(false);
  }, []);

  const handleSetBoQ = useCallback(() => {
    setIsDrawerOpen(false);
    setIsModalOpen(true);
  }, []);

  const handleModalClose = useCallback(() => {
    setIsModalOpen(false);
    setSelectedProject(null);
  }, []);

  const handleBoqSuccess = useCallback(() => {
    setIsModalOpen(false);
    const projectId = selectedProject?.id;
    setSelectedProject(null);
    if (projectId) {
      router.push(`/project-control/boq-management/${projectId}/detail?tab=planning`);
    }
  }, [selectedProject, router]);

  const columns = useMemo<ColumnDef<BOQProjectListItem>[]>(
    () => [
      {
        accessorKey: 'projectName',
        header: labels.COLUMNS.PROJECT,
      },
      {
        accessorKey: 'projectOwner',
        header: labels.COLUMNS.PROJECT_OWNER,
      },
      {
        accessorKey: 'settingStatus',
        header: labels.COLUMNS.SETTING_BOQ,
        cell: ({ row }) => {
          const isComplete = row.original.statusBoqComplete;
          return (
            <Badge variant={isComplete ? 'success' : 'destructive'}>
              {isComplete ? labels.COLUMNS.COMPLETE : labels.COLUMNS.INCOMPLETE}
            </Badge>
          );
        },
      },
      {
        id: 'action',
        header: labels.COLUMNS.ACTION,
        enableSorting: false,
        size: 32,
        cell: ({ row }) => (
          <button
            type="button"
            className="flex items-center gap-1 text-teal-600 cursor-pointer"
            onClick={() => handleActionClick(row.original)}
          >
            <Settings size={16} />
            <span className="text-sm">{labels.COLUMNS.ACTION_LABEL}</span>
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
        options={BOQ_PLANNING_STATUS_OPTIONS}
        placeholder={labels.STATUS_PLACEHOLDER}
        value={queryParams.statusBoqPlanning ?? null}
        isSearchable={false}
        onChange={handleStatusFilterChange}
        isClearable
      />
    ),
    [handleStatusFilterChange, queryParams.statusBoqPlanning]
  );

  const handleSearch = useCallback(
    (value: string | undefined) => handleSearchChange(value ?? ''),
    [handleSearchChange]
  );

  return (
    <>
      <ListPageTemplate<BOQProjectListItem>
        title={labels.TITLE}
        headerActions={
          <AsyncSelect
            className="w-52"
            options={companyOptions}
            value={companyId ?? null}
            onChange={handleCompanyChange}
            placeholder={labels.COMPANY_PLACEHOLDER}
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
        emptyMessage={labels.EMPTY}
      />

      <BOQProjectDetailDrawer
        open={isDrawerOpen}
        onClose={handleDrawerClose}
        project={selectedProject}
        onSetBoQ={handleSetBoQ}
      />

      {selectedProject && (
        <BOQTemplateSelectModal
          open={isModalOpen}
          onClose={handleModalClose}
          projectId={selectedProject.id}
          onSuccess={handleBoqSuccess}
        />
      )}
    </>
  );
}
