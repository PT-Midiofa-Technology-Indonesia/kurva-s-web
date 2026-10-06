'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useMemo, useState } from 'react';
import { useProjectCapabilitiesInfinite } from '@/domains/project-capability';
import { useDebounce } from '@/hooks/use-debounce';
import { Tabs } from '@/shared/components/molecules/Tabs';
import type { TabItem } from '@/shared/components/molecules/Tabs/types';
import { useQueryParams } from '@/shared/hooks/use-query-params';
import type { BaseQueryParams } from '@/shared/types/query-params';
import { ProjectHierarchyTemplateListWithSuggestions } from '../components/ProjectHierarchyTemplateListWithSuggestions';
import {
  PROJECT_CONTROL_TAB_LABELS,
  PROJECT_CONTROL_TABS,
  type ProjectControlTab,
} from '../constants';
import { useProjectHierarchyTemplates, useSyncProjectHierarchyTemplates } from '../hooks';
import { ProjectListPage } from '../pages/ProjectListPage';
import type { ProjectHierarchyTemplateFormInput } from '../types';

interface HierarchyTemplateRow {
  id: string;
  name: string;
  projectCapability: string;
  projectCapabilityId: string;
  status: 'active' | 'inactive';
}

interface ProjectControlUrlParams extends BaseQueryParams {
  tab?: string;
}

function HierarchyTemplateListPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [rows, setRows] = useState<HierarchyTemplateRow[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const debouncedSearch = useDebounce(search, 300);

  const handleView = useCallback(
    (row: HierarchyTemplateRow) => {
      router.push(`/project-control/project/${row.id}/detail`);
    },
    [router]
  );

  const isActive = statusFilter === 'true' ? true : statusFilter === 'false' ? false : undefined;

  const { data, isLoading } = useProjectHierarchyTemplates({
    page,
    perPage,
    search: debouncedSearch || undefined,
    isActive,
  });
  const {
    options: projectCapabilityOptions,
    hasMore: projectCapabilityHasMore,
    loadMore: loadMoreProjectCapability,
  } = useProjectCapabilitiesInfinite({ isActive: true, perPage: 20 });
  const { mutateAsync: syncTemplates, isPending: isSaving } = useSyncProjectHierarchyTemplates();

  const projectCapabilityLabelToId = useMemo(() => {
    const map = new Map<string, string>();
    for (const opt of projectCapabilityOptions) {
      map.set(opt.label, opt.value);
    }
    return map;
  }, [projectCapabilityOptions]);

  const templateRows = useMemo<HierarchyTemplateRow[]>(
    () =>
      (data?.data ?? [])
        .filter((template) => template.projectCapability !== null)
        .map((template) => ({
          id: template.id,
          name: template.name,
          projectCapability: template.projectCapability!.name,
          projectCapabilityId: template.projectCapability!.id,
          status: template.isActive ? 'active' : 'inactive',
        })),
    [data?.data]
  );

  const displayRows = rows.length > 0 ? rows : templateRows;

  const handleRowsChange = (newRows: HierarchyTemplateRow[]) => {
    const updatedRows = newRows.map((row) => {
      if (row.projectCapability) {
        const capId = projectCapabilityLabelToId.get(row.projectCapability);
        return capId ? { ...row, projectCapabilityId: capId } : row;
      }
      return row;
    });
    setRows(updatedRows);
  };

  const handleSave = async (currentRows: HierarchyTemplateRow[]) => {
    const existingIds = new Set(templateRows.map((r) => r.id));
    const items = currentRows.map((row) => ({
      id: existingIds.has(row.id) ? row.id : null,
      projectCapabilityId: row.projectCapabilityId,
      name: row.name,
      description: null,
      isActive: row.status === 'active',
    })) as ProjectHierarchyTemplateFormInput[];
    const deletedIds = templateRows
      .filter((existing) => !currentRows.some((row) => row.id === existing.id))
      .map((row) => row.id);

    await syncTemplates({ items, deletedIds });
    setRows([]);
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
    setPage(1);
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-slate-950">Hierarki Project Template</h1>
      </div>
      <ProjectHierarchyTemplateListWithSuggestions
        value={displayRows}
        onChange={handleRowsChange}
        onSave={handleSave}
        isSaving={isSaving}
        isLoading={isLoading}
        initialPage={page}
        initialPageSize={perPage}
        totalItems={data?.meta.total}
        totalPages={data?.meta.lastPage}
        onPaginationChange={(newPage, newPerPage) => {
          setPage(newPage);
          setPerPage(newPerPage);
        }}
        projectCapabilityOptions={projectCapabilityOptions}
        projectCapabilityHasMore={projectCapabilityHasMore}
        onLoadMoreProjectCapability={loadMoreProjectCapability}
        onSearchChange={handleSearchChange}
        onStatusChange={handleStatusChange}
        onView={handleView}
      />
    </div>
  );
}

export function ProjectControlPage() {
  const { queryParams, updateQueryParam } = useQueryParams<ProjectControlUrlParams>();
  const activeTab =
    (queryParams.tab as ProjectControlTab) || PROJECT_CONTROL_TABS.HIERARCHY_TEMPLATE;

  const handleTabChange = (tabKey: string) => {
    updateQueryParam('tab', tabKey as ProjectControlTab);
  };

  const tabItems: TabItem[] = [
    {
      key: PROJECT_CONTROL_TABS.HIERARCHY_TEMPLATE,
      label: PROJECT_CONTROL_TAB_LABELS[PROJECT_CONTROL_TABS.HIERARCHY_TEMPLATE],
      content: <HierarchyTemplateListPage />,
    },
    {
      key: PROJECT_CONTROL_TABS.PROJECT,
      label: PROJECT_CONTROL_TAB_LABELS[PROJECT_CONTROL_TABS.PROJECT],
      content: <ProjectListPage />,
    },
  ];

  return (
    <div className="flex flex-col h-full">
      <Tabs items={tabItems} activeKey={activeTab} onChange={handleTabChange} />
    </div>
  );
}
