'use client';

import type { ColumnDef } from '@tanstack/react-table';
import type { ProjectBOQItem } from '@/domains/project-control/api/get-project-boq';
import {
  type CreateProjectMonitoringColumnsOptions,
  createAllViewColumns,
} from './all-view-columns';

export function createDetailViewColumns(
  options: CreateProjectMonitoringColumnsOptions
): ColumnDef<ProjectBOQItem>[] {
  const { labels } = options;
  const baseColumns = createAllViewColumns(options);
  const assigneeIndex = baseColumns.findIndex((column) => column.id === 'assignee');

  const detailColumns: ColumnDef<ProjectBOQItem>[] = [
    {
      id: 'manpowerTask',
      header: labels.MANPOWER_TASK,
      accessorFn: (item) => item.taskMonitoring?.manpowerTask ?? 0,
      cell: ({ getValue }) => {
        const value = getValue() as number;
        return <span className="text-sm text-slate-600 text-center block">{value}</span>;
      },
    },
    {
      id: 'qcTask',
      header: labels.QC_TASK,
      accessorFn: (item) => item.taskMonitoring?.qcTask ?? 0,
      cell: ({ getValue }) => {
        const value = getValue() as number;
        return <span className="text-sm text-slate-600 text-center block">{value}</span>;
      },
    },
  ];

  const insertAt = assigneeIndex === -1 ? baseColumns.length : assigneeIndex + 1;
  return [...baseColumns.slice(0, insertAt), ...detailColumns, ...baseColumns.slice(insertAt)];
}
