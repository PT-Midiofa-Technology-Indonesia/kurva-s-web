'use client';

import type { ColumnDef, ExpandedState } from '@tanstack/react-table';
import { useMemo, useState } from 'react';
import { DataTable } from '@/shared/components/organisms/DataTable';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { cn } from '@/shared/lib/utils';
import { formatDate } from '@/shared/utils/format';
import { ACTION_ITEM_LABELS, MEETING_TASK_STATUS_BADGE_CLASSNAMES } from '../constants';
import type { TaskTreeNode } from '../services/task-tree';
import type { TaskControlRow } from '../types';

const labels = ACTION_ITEM_LABELS.TASK_CONTROL;

/** Sub-tasks are nested under their parent; `DataTable` reads them from `children`. */
type TaskRow = TaskTreeNode<TaskControlRow>;

function getRowId(row: TaskRow): string {
  return row.id;
}

interface ActionItemTaskTableProps {
  rows: TaskRow[];
  isLoading: boolean;
  selectedIds: Set<string>;
  onToggleSelection: (id: string, checked: boolean) => void;
  onToggleAll: (checked: boolean) => void;
  /** Ids on the CURRENT page only — drives both the header checkbox and toggleAll. */
  pageSelectableIds: string[];
  onOpenDetail: (row: TaskRow) => void;
}

export function ActionItemTaskTable({
  rows,
  isLoading,
  selectedIds,
  onToggleSelection,
  onToggleAll,
  pageSelectableIds,
  onOpenDetail,
}: ActionItemTaskTableProps) {
  const isAllSelected =
    pageSelectableIds.length > 0 && pageSelectableIds.every((id) => selectedIds.has(id));
  const isSomeSelected = pageSelectableIds.some((id) => selectedIds.has(id)) && !isAllSelected;

  // `true` expands every row with children by default; the user can still
  // collapse individual rows afterward (state then narrows to a row-id map).
  const [expanded, setExpanded] = useState<ExpandedState>(true);

  const columns = useMemo<ColumnDef<TaskRow>[]>(
    () => [
      {
        id: '__select__',
        header: () => (
          <Checkbox
            checked={isAllSelected || (isSomeSelected && 'indeterminate')}
            onCheckedChange={(value) => onToggleAll(!!value)}
            disabled={pageSelectableIds.length === 0}
            aria-label="Select all"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={selectedIds.has(row.original.id)}
            onCheckedChange={(value) => onToggleSelection(row.original.id, !!value)}
            disabled={row.original.isDelegatable === false}
            aria-label="Select row"
            onClick={(e) => e.stopPropagation()}
          />
        ),
        enableSorting: false,
        enableHiding: false,
        enableResizing: false,
        size: 40,
        minSize: 40,
        maxSize: 40,
      },
      {
        accessorKey: 'code',
        header: labels.COLUMNS.CODE,
        enableSorting: false,
      },
      {
        accessorKey: 'task',
        header: labels.COLUMNS.TASK,
        enableSorting: false,
      },
      {
        accessorKey: 'projectName',
        header: labels.COLUMNS.PROJECT,
        enableSorting: false,
      },
      {
        id: 'assignee',
        header: labels.COLUMNS.ASSIGNEE,
        enableSorting: false,
        cell: ({ row }) => <span>{row.original.assignee ?? '-'}</span>,
      },
      {
        id: 'doneAt',
        header: labels.COLUMNS.DONE_AT,
        enableSorting: false,
        cell: ({ row }) =>
          row.original.doneAt ? <span>{formatDate(row.original.doneAt)}</span> : <span>-</span>,
      },
      {
        id: 'retryCount',
        header: labels.COLUMNS.RETRY_COUNT,
        enableSorting: false,
        cell: ({ row }) => <span>{row.original.retryCount}x</span>,
      },
      {
        id: 'status',
        header: labels.COLUMNS.STATUS,
        enableSorting: false,
        cell: ({ row }) => (
          <Badge
            variant="secondary"
            className={cn(
              'h-5 rounded-md border-0 px-2 text-xs font-medium',
              MEETING_TASK_STATUS_BADGE_CLASSNAMES[row.original.status]
            )}
          >
            {row.original.statusLabel}
          </Badge>
        ),
      },
      {
        id: 'action',
        header: labels.ACTION.HEADER,
        enableSorting: false,
        size: 120,
        cell: ({ row }) => {
          const isCompleted = ['done', 'qc_passed', 'cancelled'].includes(row.original.status);

          return (
            <Button
              type="button"
              variant={isCompleted ? 'outline' : 'default'}
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onOpenDetail(row.original);
              }}
            >
              {isCompleted ? labels.ACTION.VIEW : labels.ACTION.COMPLETE}
            </Button>
          );
        },
      },
    ],
    [
      isAllSelected,
      isSomeSelected,
      selectedIds,
      onToggleAll,
      onToggleSelection,
      onOpenDetail,
      pageSelectableIds.length,
    ]
  );

  return (
    <DataTable<TaskRow, unknown>
      columns={columns}
      data={rows}
      getRowId={getRowId}
      isLoading={isLoading}
      enableTreeView
      expanded={expanded}
      onExpandedChange={setExpanded}
      enableColumnDnd={false}
      enableColumnResize={false}
      enablePagination={false}
      enableRangeSelection={false}
      enableZebraStripes={false}
      emptyMessage={labels.EMPTY_TABLE}
      className="w-full"
    />
  );
}
