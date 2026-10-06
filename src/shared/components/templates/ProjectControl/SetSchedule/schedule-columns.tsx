import { CornerDownRight, SquarePlus } from 'lucide-react';
import type { GanttColumn } from '@/components/organisms/GanttChart';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { ScheduleNode } from './types';

export interface ScheduleColumnLabels {
  kode: string;
  taskName: string;
  start: string;
  end: string;
  days: string;
  bobot: string;
  percent: string;
}

export const DEFAULT_SCHEDULE_COLUMN_LABELS: ScheduleColumnLabels = {
  kode: 'Kode',
  taskName: 'Task Name',
  start: 'Start',
  end: 'End',
  days: 'Days',
  bobot: 'Bobot',
  percent: '%',
};

export interface ScheduleColumnsOptions {
  codes: Map<string, string>;
  onAddSibling: (node: ScheduleNode) => void;
  onAddChild: (node: ScheduleNode) => void;
  labels?: ScheduleColumnLabels;
  hideAddColumn?: boolean;
}

export function createScheduleColumns(opts: ScheduleColumnsOptions): GanttColumn<ScheduleNode>[] {
  const { codes, onAddSibling, onAddChild } = opts;
  const labels = opts.labels ?? DEFAULT_SCHEDULE_COLUMN_LABELS;

  const baseColumns: GanttColumn<ScheduleNode>[] = [
    {
      id: 'kode',
      header: labels.kode,
      accessor: (row) => codes.get(row.id) ?? '-',
      showExpandToggle: true,
      indent: true,
      width: 220,
      render: (row) => (
        <span className="text-xs font-mono text-muted-foreground">{codes.get(row.id) ?? '-'}</span>
      ),
    },
  ];

  if (!opts.hideAddColumn) {
    baseColumns.push({
      id: 'tambah',
      header: '',
      width: 64,
      accessor: () => '',
      render: (row) => (
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  aria-label="Tambah Menu"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddSibling(row);
                  }}
                >
                  <SquarePlus className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top">Tambah Menu</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  aria-label="Tambah Sub Menu"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddChild(row);
                  }}
                >
                  <CornerDownRight className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top">Tambah Sub Menu</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      ),
    });
  }

  return [
    ...baseColumns,
    {
      id: 'taskName',
      header: labels.taskName,
      accessor: (row) => row.taskName,
      editable: true,
      width: 220,
    },
    {
      id: 'start',
      header: labels.start,
      accessor: (row) => row.startDate,
      editable: true,
      type: 'date',
      width: 150,
    },
    {
      id: 'end',
      header: labels.end,
      accessor: (row) => row.endDate,
      editable: true,
      type: 'date',
      width: 150,
    },
    {
      id: 'days',
      header: labels.days,
      accessor: (row) => `${row.days}d`,
      width: 70,
    },
    {
      id: 'bobot',
      header: labels.bobot,
      accessor: (row) => row.bobot ?? '-',
      width: 70,
    },
    {
      id: 'percent',
      header: labels.percent,
      accessor: (row) => `${row.percent > 0 ? row.percent : 0}%`,
      width: 70,
    },
  ];
}
