'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useMemo, useState } from 'react';
import { useProjectCapabilitiesInfinite } from '@/domains/project-capability';
import { useDebounce } from '@/hooks/use-debounce';
import type { BOQTemplateRow } from '@/shared/components/templates/BOQ/BOQTemplate/BOQTemplateList';
import { BOQTemplateListWithSuggestions } from '../components';
import { useBOQTemplates, useSyncBOQTemplates } from '../hooks';

export function BOQTemplatePage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [rows, setRows] = useState<BOQTemplateRow[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const handleView = useCallback(
    (row: BOQTemplateRow) => {
      router.push(`/project-control/boq-management/${row.id}/detail`);
    },
    [router]
  );

  const debouncedSearch = useDebounce(search, 300);

  const isActive = statusFilter === 'true' ? true : statusFilter === 'false' ? false : undefined;

  const { data, isLoading } = useBOQTemplates({
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
  const { mutateAsync: syncTemplates, isPending: isSaving } = useSyncBOQTemplates();

  const projectCapabilityLabelToId = useMemo(() => {
    const map = new Map<string, string>();
    for (const opt of projectCapabilityOptions) {
      map.set(opt.label, opt.value);
    }
    return map;
  }, [projectCapabilityOptions]);

  const templateRows = useMemo<BOQTemplateRow[]>(
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

  const handleRowsChange = (newRows: BOQTemplateRow[]) => {
    const updatedRows = newRows.map((row) => {
      if (row.projectCapability) {
        const capId = projectCapabilityLabelToId.get(row.projectCapability);
        return capId ? { ...row, projectCapabilityId: capId } : row;
      }
      return row;
    });
    setRows(updatedRows);
  };

  const handleSave = async (currentRows: BOQTemplateRow[]) => {
    const existingIds = new Set(templateRows.map((r) => r.id));
    const items = currentRows.map((row) => ({
      id: existingIds.has(row.id) ? row.id : null,
      projectCapabilityId: row.projectCapabilityId,
      name: row.name,
      isActive: row.status === 'active',
    }));
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
    <div className="p-6">
      <BOQTemplateListWithSuggestions
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
