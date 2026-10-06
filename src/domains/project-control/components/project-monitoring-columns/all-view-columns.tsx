'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { Eye } from 'lucide-react';
import type { ProjectBOQItem } from '@/domains/project-control/api/get-project-boq';
import { getStatusBadgeClass } from '@/domains/project-control/services/task-monitoring-table.service';
import { Button } from '@/shared/components/atoms/Button';
import { Badge } from '@/shared/components/ui/badge';
import { formatDate } from '@/shared/lib/utils';
import type { PROGRESS_MONITORING_PAGE_LABELS } from '../../constants';

export interface CreateProjectMonitoringColumnsOptions {
  labels: typeof PROGRESS_MONITORING_PAGE_LABELS.TABLE;
  onView: (item: ProjectBOQItem) => void;
}

export function createAllViewColumns({
  labels,
  onView,
}: CreateProjectMonitoringColumnsOptions): ColumnDef<ProjectBOQItem>[] {
  return [
    {
      id: 'code',
      header: labels.KODE,
      accessorKey: 'code',
      cell: ({ getValue }) => {
        const value = getValue() as string;
        return (
          <span className="text-sm font-medium text-slate-700 whitespace-nowrap">{value}</span>
        );
      },
    },
    {
      id: 'view',
      header: labels.VIEW,
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="xs"
          onClick={(e) => {
            e.stopPropagation();
            onView(row.original);
          }}
          aria-label="View task detail"
        >
          <Eye className="h-4 w-4 text-slate-500" />
        </Button>
      ),
      enableSorting: false,
    },
    {
      id: 'name',
      header: labels.TASK_NAME,
      accessorKey: 'name',
      cell: ({ getValue }) => {
        const value = getValue() as string;
        return <span className="text-sm text-slate-900 font-medium">{value}</span>;
      },
    },
    {
      id: 'scheduleStartDate',
      header: labels.START,
      accessorFn: (item) => formatDate(item.scheduleStartDate),
      cell: ({ getValue }) => {
        const value = getValue() as string;
        return <span className="text-sm text-slate-600 whitespace-nowrap">{value}</span>;
      },
    },
    {
      id: 'scheduleEndDate',
      header: labels.END,
      accessorFn: (item) => formatDate(item.scheduleEndDate),
      cell: ({ getValue }) => {
        const value = getValue() as string;
        return <span className="text-sm text-slate-600 whitespace-nowrap">{value}</span>;
      },
    },
    {
      id: 'assignee',
      header: labels.ASSIGNE,
      accessorFn: (item) =>
        (item.taskMonitoring?.assignedEmployees ?? [])
          .map((employee) => employee.fullName)
          .filter(Boolean)
          .join(', '),
      cell: ({ getValue }) => {
        const value = getValue() as string;
        return <span className="text-sm text-slate-600 whitespace-nowrap">{value || '-'}</span>;
      },
    },
    {
      id: 'totalScheduleDays',
      header: labels.DAYS,
      accessorFn: (item) =>
        typeof item.taskMonitoring?.totalScheduleDays === 'number'
          ? item.taskMonitoring.totalScheduleDays
          : 0,
      cell: ({ getValue }) => {
        const value = getValue() as number;
        return <span className="text-sm text-slate-600 text-center block">{value}</span>;
      },
    },
    {
      id: 'weightItem',
      header: labels.BOBOT,
      accessorFn: (item) => item.taskMonitoring?.weightItem,
      cell: ({ getValue }) => {
        const value = getValue() as string;
        return <span className="text-sm text-slate-600">{value}</span>;
      },
    },
    {
      id: 'totalTask',
      header: labels.TOTAL,
      accessorFn: (item) => item.taskMonitoring?.totalTask,
      cell: ({ getValue }) => {
        const value = getValue() as string;
        return <span className="text-sm text-slate-600 whitespace-nowrap">{value}</span>;
      },
    },
    {
      id: 'totalDoneTask',
      header: labels.DONE,
      accessorFn: (item) => item.taskMonitoring?.totalDoneTask,
      cell: ({ getValue }) => {
        const value = getValue() as string;
        return <span className="text-sm text-slate-600 whitespace-nowrap">{value}</span>;
      },
    },
    {
      id: 'percent',
      header: labels.PERCENT,
      accessorFn: (item) => Number(item.taskMonitoring?.percentageDoneTask ?? 0),
      cell: ({ getValue }) => {
        const value = getValue() as number;
        return <span className="text-sm font-medium text-slate-700 w-8 text-right">{value}%</span>;
      },
    },
    {
      id: 'status',
      header: labels.STATUS,
      accessorFn: (item) => item.taskMonitoring?.statusLabel ?? '',
      cell: ({ getValue }) => {
        const value = getValue() as string;
        return (
          <Badge
            className={`text-xs font-medium rounded-md px-2 py-0.5 ${getStatusBadgeClass(value)}`}
          >
            {value || '-'}
          </Badge>
        );
      },
    },
  ];
}
