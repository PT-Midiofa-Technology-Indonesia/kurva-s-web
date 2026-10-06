'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { FileText } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useMemo } from 'react';
import { useQueryParams } from '@/hooks/use-query-params';
import { AsyncSelect, Button } from '@/shared/components/atoms';
import { ListPageTemplate } from '@/shared/components/templates/ListPageTemplate';
import { Badge } from '@/shared/components/ui';
import { useCompanyFilter } from '@/shared/hooks/use-company-filter';
import type { BaseQueryParams } from '@/types/query-params';
import { useProjects } from '../hooks/use-projects';
import { createProjectListItems } from '../services/project-list.service';
import type { Project } from '../types';

interface FinancialReportUrlParams extends BaseQueryParams {
  companyId?: string;
}

export function FinancialReportListPage() {
  const router = useRouter();
  const { queryParams, updateQueryParam, setQueryParams } =
    useQueryParams<FinancialReportUrlParams>();

  const { companyId, companyOptions, handleCompanyChange } = useCompanyFilter();

  const params = useMemo(
    () => ({
      page: queryParams.page ?? 1,
      perPage: queryParams.perPage ?? 10,
      search: queryParams.search,
      companyId,
    }),
    [queryParams.page, queryParams.perPage, queryParams.search, companyId]
  );

  const { data: projectsData, isLoading } = useProjects(params);
  const projects = useMemo(
    () => createProjectListItems(projectsData?.data ?? [], params.search),
    [projectsData?.data, params.search]
  );

  const totalItems = projectsData?.meta?.total ?? 0;
  const totalPages = projectsData?.meta?.lastPage ?? 1;

  const handleViewReport = useCallback(
    (project: Project) => {
      router.push(`/project-control/financial-project-report/${project.id}`);
    },
    [router]
  );

  const columns = useMemo<ColumnDef<Project>[]>(
    () => [
      { accessorKey: 'projectName', header: 'Project' },
      { accessorKey: 'projectOwner', header: 'Project Owner' },
      { accessorKey: 'clientName', header: 'Client' },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => (
          <Badge variant={row.original.status === 'Aktif' ? 'success' : 'destructive'}>
            {row.original.status}
          </Badge>
        ),
      },
      {
        id: 'action',
        header: 'Action',
        enableSorting: false,
        size: 160,
        cell: ({ row }) => (
          <Button
            type="button"
            variant="ghost"
            className="text-teal-600 hover:bg-teal-50 hover:text-teal-700"
            onClick={() => handleViewReport(row.original)}
          >
            <FileText className="h-4 w-4" />
            Lihat Laporan
          </Button>
        ),
      },
    ],
    [handleViewReport]
  );

  const handleSearch = useCallback(
    (value: string | undefined) => updateQueryParam('search', value ?? ''),
    [updateQueryParam]
  );

  const handlePaginationChange = useCallback(
    (page: number, perPage: number) => setQueryParams({ page, perPage }),
    [setQueryParams]
  );

  return (
    <ListPageTemplate<Project>
      title="Financial Project Report"
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
      emptyMessage="Belum ada data"
    />
  );
}
