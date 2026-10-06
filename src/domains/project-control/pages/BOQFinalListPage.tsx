'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { Eye, MoreVertical, Settings } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useMemo, useState } from 'react';
import { useQueryParams } from '@/hooks/use-query-params';
import { AsyncSelect } from '@/shared/components/atoms';
import type { BOQProjectListItem } from '@/shared/components/templates/BOQ/types/boq-project-list.types';
import { ListPageTemplate } from '@/shared/components/templates/ListPageTemplate';
import { Badge } from '@/shared/components/ui';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import { useCompanyFilter } from '@/shared/hooks/use-company-filter';
import type { BaseQueryParams } from '@/types/query-params';
import { BOQLimitBudgetModal, BOQProjectDetailDrawer } from '../components';
import { BOQ_FINAL_STATUS_OPTIONS, BOQ_LIST_PAGE_LABELS } from '../constants';
import { useBOQProjectListPage } from '../hooks/use-boq-project-list-page';

const labels = BOQ_LIST_PAGE_LABELS.FINAL;

interface BOQFinalUrlParams extends BaseQueryParams {
  companyId?: string;
  statusBoqFinal?: string;
}

export function BOQFinalListPage() {
  const router = useRouter();
  const { queryParams, updateQueryParam, setQueryParams } = useQueryParams<BOQFinalUrlParams>();

  const [selectedProject, setSelectedProject] = useState<BOQProjectListItem | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { companyId, companyOptions, handleCompanyChange } = useCompanyFilter();

  const params = useMemo(
    () => ({
      page: queryParams.page ?? 1,
      perPage: queryParams.perPage ?? 10,
      search: queryParams.search,
      statusBoqFinal: queryParams.statusBoqFinal,
    }),
    [queryParams]
  );

  const pageOptions = useMemo(
    () => ({
      stage: 'final' as const,
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

  const handleViewBoQFinal = useCallback(
    (project: BOQProjectListItem) => {
      router.push(`/project-control/boq-management/${project.id}/detail?tab=final`);
    },
    [router]
  );

  const handleLimitBudgetClick = useCallback((project: BOQProjectListItem) => {
    setSelectedProject(project);
    setIsDrawerOpen(true);
  }, []);

  const handleDrawerClose = useCallback(() => {
    setIsDrawerOpen(false);
  }, []);

  const handleSetLimitBudget = useCallback(() => {
    setIsDrawerOpen(false);
    setIsModalOpen(true);
  }, []);

  const handleModalClose = useCallback(() => {
    setIsModalOpen(false);
    setSelectedProject(null);
  }, []);

  const handleLimitBudgetSuccess = useCallback(() => {
    setIsModalOpen(false);
    setSelectedProject(null);
  }, []);

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
        header: labels.COLUMNS.LIMIT_BUDGET,
        cell: ({ row }) => {
          const isComplete = row.original.isLimitBudgetComplete ?? false;
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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button type="button" className="p-1 rounded hover:bg-muted">
                <MoreVertical size={16} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleViewBoQFinal(row.original)}>
                <Eye size={14} />
                <span>{labels.COLUMNS.VIEW_BOQ_FINAL}</span>
              </DropdownMenuItem>
              {!row.original.isLimitBudgetComplete && (
                <DropdownMenuItem onClick={() => handleLimitBudgetClick(row.original)}>
                  <Settings size={14} />
                  <span>{labels.COLUMNS.LIMIT_BUDGET_ACTION}</span>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    [handleViewBoQFinal, handleLimitBudgetClick]
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
        options={BOQ_FINAL_STATUS_OPTIONS}
        placeholder={labels.STATUS_PLACEHOLDER}
        value={queryParams.statusBoqFinal ?? null}
        isSearchable={false}
        onChange={handleStatusFilterChange}
        isClearable
      />
    ),
    [handleStatusFilterChange, queryParams.statusBoqFinal]
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
        onSetBoQ={handleSetLimitBudget}
        title="Detail Limit Budget"
        actionLabel="Set Limit Budget"
        settingLabel="Setting Limit Budget"
      />

      {selectedProject && (
        <BOQLimitBudgetModal
          open={isModalOpen}
          onClose={handleModalClose}
          projectId={selectedProject.id}
          estimatedValue={selectedProject.estimatedValue}
          totalValue={selectedProject.totalValue}
          onSuccess={handleLimitBudgetSuccess}
        />
      )}
    </>
  );
}
