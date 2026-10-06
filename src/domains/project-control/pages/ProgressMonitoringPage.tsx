'use client';

import type { ExpandedState } from '@tanstack/react-table';
import { Expand, Minimize2 } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useCallback, useMemo, useState } from 'react';
import { Button } from '@/shared/components/atoms/Button';
import { SegmentedControl } from '@/shared/components/atoms/SegmentedControl';
import { SearchBar } from '@/shared/components/molecules/SearchBar';
import { DataTable } from '@/shared/components/organisms/DataTable';
import { Card } from '@/shared/components/ui/card';
import { useFullscreen } from '@/shared/hooks/use-fullscreen';
import { useSelectedProjectStore } from '@/shared/store/selected-project';
import type { ProjectBOQItem } from '../api/get-project-boq';
import { ProgressTaskDetailDrawer } from '../components';
import { InformasiProjectCard } from '../components/InformasiProjectCard';
import {
  getProjectMonitoringColumns,
  type ProjectMonitoringViewMode,
} from '../components/project-monitoring-columns';
import { PROGRESS_MONITORING_PAGE_LABELS, SCREEN_LABELS } from '../constants';
import { useProjectBOQ, useProjectManagementBOQ } from '../hooks';
import { getBOQRowId, getBOQSubRows } from '../services/task-monitoring-table.service';

const VIEW_MODE_OPTIONS: { value: ProjectMonitoringViewMode; label: string }[] = [
  { value: 'all', label: PROGRESS_MONITORING_PAGE_LABELS.VIEW_MODE.ALL },
  { value: 'day', label: PROGRESS_MONITORING_PAGE_LABELS.VIEW_MODE.DAY },
  { value: 'week', label: PROGRESS_MONITORING_PAGE_LABELS.VIEW_MODE.WEEK },
  { value: 'month', label: PROGRESS_MONITORING_PAGE_LABELS.VIEW_MODE.MONTH },
];

// ─── Page Component ──────────────────────────────────────────────────────────

interface ProgressMonitoringPageProps {
  projectId?: string;
  source?: 'project-control' | 'project-management';
}

export function ProgressMonitoringPage({
  projectId: projectIdProp,
  source = 'project-control',
}: ProgressMonitoringPageProps = {}) {
  const params = useParams<{ id?: string }>();
  const selectedProjectId = useSelectedProjectStore((s) => s.selectedProjectId);
  const isProjectManagementSource = source === 'project-management';
  const projectId =
    projectIdProp ?? params.id ?? (isProjectManagementSource ? selectedProjectId : undefined);

  const [viewMode, setViewMode] = useState<ProjectMonitoringViewMode>('all');
  const monitoringTime = viewMode === 'all' ? undefined : viewMode;
  const projectBOQQuery = useProjectBOQ(
    isProjectManagementSource ? undefined : projectId,
    monitoringTime
  );
  const projectManagementBOQQuery = useProjectManagementBOQ(projectId, monitoringTime, {
    enabled: isProjectManagementSource,
  });
  const boqData = isProjectManagementSource ? projectManagementBOQQuery.data : projectBOQQuery.data;
  const project = boqData?.project;
  const [searchValue, setSearchValue] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedProgressItem, setSelectedProgressItem] = useState<ProjectBOQItem | null>(null);

  const { ref: containerRef, isFullscreen, toggleFullscreen } = useFullscreen<HTMLDivElement>();

  const data = useMemo(() => boqData?.boq?.items ?? [], [boqData?.boq?.items]);

  const filteredData = useMemo(() => {
    if (!searchValue.trim()) return data;
    const lowerSearch = searchValue.toLowerCase();
    function filterNodes(nodes: ProjectBOQItem[]): ProjectBOQItem[] {
      return nodes
        .map((node) => {
          const children = node.children ?? [];
          const matches =
            node.name.toLowerCase().includes(lowerSearch) ||
            node.code.toLowerCase().includes(lowerSearch);
          const filteredChildren = filterNodes(children);
          if (matches || filteredChildren.length > 0) {
            return { ...node, children: filteredChildren };
          }
          return null;
        })
        .filter((node): node is ProjectBOQItem => node !== null);
    }
    return filterNodes(data);
  }, [data, searchValue]);

  const handleView = useCallback((item: ProjectBOQItem) => {
    setSelectedProgressItem(item);
    setDrawerOpen(true);
  }, []);

  const columns = useMemo(
    () =>
      getProjectMonitoringColumns(viewMode, {
        labels: PROGRESS_MONITORING_PAGE_LABELS.TABLE,
        onView: handleView,
      }),
    [viewMode, handleView]
  );

  // Expand all by default
  const [expanded, setExpanded] = useState<ExpandedState>(true);

  return (
    <div className="p-6 space-y-6">
      {/* Informasi Project Card */}
      {project && (
        <InformasiProjectCard
          project={project}
          labels={PROGRESS_MONITORING_PAGE_LABELS.INFORMATION_CARD}
          hideEstimatedValue={isProjectManagementSource}
        />
      )}

      {/* Progress Monitoring Section */}
      <Card
        ref={containerRef}
        className={`p-4 space-y-4 ${isFullscreen ? 'rounded-xl border bg-card p-4' : ''}`}
      >
        <div className="flex items-center justify-between">
          <SearchBar
            placeholder={PROGRESS_MONITORING_PAGE_LABELS.SEARCH_PLACEHOLDER}
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onClear={() => setSearchValue('')}
            showClear
            width="240px"
          />

          <div className="flex items-center gap-3">
            <SegmentedControl
              options={VIEW_MODE_OPTIONS}
              value={viewMode}
              onChange={(value) => setViewMode(value as ProjectMonitoringViewMode)}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={toggleFullscreen}
              aria-label={
                isFullscreen ? SCREEN_LABELS.fullscreenExit : SCREEN_LABELS.fullscreenEnter
              }
            >
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Expand className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* BOQ Data Table */}
        <DataTable<ProjectBOQItem, unknown>
          columns={columns}
          data={filteredData}
          getRowId={getBOQRowId}
          getSubRows={getBOQSubRows}
          enableTreeView
          expanded={expanded}
          onExpandedChange={setExpanded}
          enableColumnDnd={false}
          enableColumnResize={false}
          enablePagination={false}
          enableRangeSelection={false}
          enableZebraStripes={false}
          emptyMessage="Tidak ada data task"
          className="w-full"
        />

        <ProgressTaskDetailDrawer
          open={drawerOpen}
          onClose={() => {
            setDrawerOpen(false);
            setSelectedProgressItem(null);
          }}
          item={selectedProgressItem}
          isFullscreen={isFullscreen}
        />
      </Card>
    </div>
  );
}
