// src/domains/mom/components/TodoTreeView.tsx
'use client';

import type { ColumnDef, ExpandedState } from '@tanstack/react-table';
import { useMemo, useState } from 'react';
import { DataTable } from '@/shared/components/organisms/DataTable';
import { CREATE_MOM_LABELS, TODO_TREE_LABELS } from '../constants';
import type { TodoNode } from '../types';
import { computeTodoCodes } from '../utils/todo-tree.utils';

const labels = CREATE_MOM_LABELS.TODO;
const columnLabels = TODO_TREE_LABELS.COLUMNS;
const taskTypeLabels = TODO_TREE_LABELS.TASK_TYPES;

export interface TodoTreeViewProps {
  value: TodoNode[];
}

export function TodoTreeView({ value }: TodoTreeViewProps) {
  const [expanded, setExpanded] = useState<ExpandedState>(true);
  const codes = useMemo(() => computeTodoCodes(value), [value]);

  const columns = useMemo<ColumnDef<TodoNode>[]>(
    () => [
      {
        id: 'code',
        header: columnLabels.CODE,
        enableSorting: false,
        size: 140,
        cell: ({ row }) => codes.get(row.original.id),
      },
      {
        accessorKey: 'task',
        header: columnLabels.TASK,
        enableSorting: false,
      },
      {
        id: 'taskType',
        header: columnLabels.TYPE,
        enableSorting: false,
        size: 130,
        cell: ({ row }) =>
          row.original.taskType === 'work' ? taskTypeLabels.WORK : taskTypeLabels.QC,
      },
      {
        id: 'assignee',
        header: columnLabels.ASSIGNEE,
        enableSorting: false,
        size: 200,
        cell: ({ row }) => row.original.assignedToEmployeeName ?? '-',
      },
    ],
    [codes]
  );

  return (
    <DataTable<TodoNode, unknown>
      columns={columns}
      data={value}
      getRowId={(row) => row.id}
      expanded={expanded}
      onExpandedChange={setExpanded}
      enableTreeView
      enableColumnDnd={false}
      enableColumnResize={false}
      enablePagination={false}
      enableRangeSelection={false}
      enableZebraStripes={false}
      emptyMessage={labels.EMPTY_TITLE}
    />
  );
}
