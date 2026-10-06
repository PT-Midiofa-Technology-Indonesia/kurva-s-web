'use client';

import { Expand, Minimize2, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Button, Input, SegmentedControl } from '@/components/atoms';
import type { GanttColumn } from '@/components/organisms/GanttChart';
import { type GanttBar, GanttChart, type GanttViewMode } from '@/components/organisms/GanttChart';
import { cn } from '@/lib/utils';
import { computeCodes } from '@/shared/components/templates/ProjectControl/SetSchedule/schedule-utils';
import type { ScheduleNode } from '@/shared/components/templates/ProjectControl/SetSchedule/types';
import { useFullscreen } from '@/shared/hooks/use-fullscreen';
import {
  SCHEDULE_COLUMN_LABELS,
  SCHEDULE_PAGE_LABELS,
  VIEW_MODE_OPTIONS,
} from '../constants/schedule';
import { filterScheduleTree } from '../services/filter-schedule-tree';
import type { ScheduleTask } from '../types/schedule';

const BAR_GROUP_COLOR = '#F59E0B';
const BAR_LEAF_COLOR = '#94A3B8';

const toGanttBar = (node: ScheduleTask): GanttBar => ({
  start: new Date(node.startDate),
  end: new Date(node.endDate),
  progress: node.progress,
  color: node.children.length > 0 ? BAR_GROUP_COLOR : BAR_LEAF_COLOR,
  type: node.children.length > 0 ? 'group' : 'task',
});

function createScheduleColumns(codes: Map<string, string>): GanttColumn<ScheduleTask>[] {
  const l = SCHEDULE_COLUMN_LABELS;
  return [
    {
      id: 'code',
      header: l.code,
      accessor: (row) => codes.get(row.id) ?? '-',
      showExpandToggle: true,
      indent: true,
      width: 220,
      render: (row) => (
        <span className="text-xs font-mono text-muted-foreground">{codes.get(row.id) ?? '-'}</span>
      ),
    },
    {
      id: 'taskName',
      header: l.taskName,
      accessor: (row) => row.taskName,
      width: 220,
    },
    {
      id: 'startDate',
      header: l.startDate,
      accessor: (row) => row.startDate,
      width: 150,
    },
    {
      id: 'endDate',
      header: l.endDate,
      accessor: (row) => row.endDate,
      width: 150,
    },
    {
      id: 'duration',
      header: l.duration,
      accessor: (row) => `${row.duration}d`,
      width: 80,
    },
    {
      id: 'weight',
      header: l.weight,
      accessor: (row) => (row.weight != null ? `${row.weight}` : '-'),
      width: 80,
    },
    {
      id: 'progress',
      header: l.progress,
      accessor: (row) => `${row.progress}%`,
      width: 80,
    },
  ];
}

interface ScheduleViewProps {
  tasks: ScheduleTask[];
  className?: string;
}

export function ScheduleView({ tasks, className }: ScheduleViewProps) {
  const { ref: containerRef, isFullscreen, toggleFullscreen } = useFullscreen<HTMLDivElement>();
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<GanttViewMode>('day');

  const codes = useMemo(() => computeCodes(tasks as unknown as ScheduleNode[]), [tasks]);
  const filteredTasks = useMemo(
    () => filterScheduleTree(tasks, search, codes),
    [tasks, search, codes]
  );
  const columns = useMemo(() => createScheduleColumns(codes), [codes]);

  // Build dependencies map from task tree
  const dependencies = useMemo(() => {
    const map = new Map<string, string[]>();
    const walk = (list: ScheduleTask[]) => {
      list.forEach((n) => {
        if (n.dependencies && n.dependencies.length > 0) {
          map.set(n.id, n.dependencies);
        }
        if (n.children.length > 0) walk(n.children);
      });
    };
    walk(tasks);
    return map;
  }, [tasks]);

  return (
    <div
      ref={containerRef}
      className={cn(
        'rounded-xl border bg-card shadow-sm overflow-hidden',
        isFullscreen && 'flex flex-col h-full',
        className
      )}
    >
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-2 px-4 py-3 border-b shrink-0">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={SCHEDULE_PAGE_LABELS.SEARCH_PLACEHOLDER}
            showLabel={false}
            showHint={false}
            className="w-56 pl-8 h-9"
          />
        </div>

        <div className="flex items-center gap-2">
          <SegmentedControl
            options={[...VIEW_MODE_OPTIONS]}
            value={viewMode}
            onChange={(v) => setViewMode(v as GanttViewMode)}
          />

          <Button
            type="button"
            variant="outline"
            size="sm"
            aria-label={
              isFullscreen
                ? SCHEDULE_PAGE_LABELS.FULLSCREEN_EXIT
                : SCHEDULE_PAGE_LABELS.FULLSCREEN_ENTER
            }
            onClick={toggleFullscreen}
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Expand className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Gantt Chart */}
      <div className={cn('overflow-hidden', isFullscreen ? 'flex-1' : 'h-150')}>
        <GanttChart<ScheduleTask>
          data={filteredTasks}
          columns={columns}
          getRowId={(n) => n.id}
          getSubRows={(n) => n.children}
          toGanttBar={toGanttBar}
          viewMode={viewMode}
          dependencies={dependencies}
          className="h-full rounded-none border-0"
        />
      </div>
    </div>
  );
}
