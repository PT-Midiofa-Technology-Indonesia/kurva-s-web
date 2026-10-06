'use client';

import type { ColumnDef, ExpandedState } from '@tanstack/react-table';
import { CornerDownRight, PlusSquare } from 'lucide-react';
import { useCallback, useMemo, useRef, useState } from 'react';
import { ContextMenuItem, ContextMenuSeparator } from '@/components/ui/context-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useEmployeesInfinite } from '@/domains/manpower';
import { DataTable } from '@/shared/components/organisms/DataTable';
import { CREATE_MOM_LABELS, TODO_TREE_LABELS } from '../constants';
import type { TodoNode, TodoTaskType } from '../types';
import {
  addTodoChild,
  addTodoSibling,
  canAddTodoChild,
  cloneTodoNode,
  computeTodoCodes,
  createEmptyTodoNode,
  deleteTodoNode,
  updateTodoNode,
} from '../utils/todo-tree.utils';

const labels = CREATE_MOM_LABELS.TODO;
const columnLabels = TODO_TREE_LABELS.COLUMNS;
const taskTypeLabels = TODO_TREE_LABELS.TASK_TYPES;

const TASK_TYPE_OPTIONS: { value: TodoTaskType; label: string }[] = [
  { value: 'work', label: taskTypeLabels.WORK },
  { value: 'qc', label: taskTypeLabels.QC },
];

export interface TodoTreeTableProps {
  value: TodoNode[];
  onChange: (next: TodoNode[]) => void;
  companyId?: string;
}

export function TodoTreeTable({ value, onChange, companyId }: TodoTreeTableProps) {
  const clipboardRef = useRef<TodoNode | null>(null);
  const [assigneeSearch, setAssigneeSearch] = useState('');
  const [expanded, setExpanded] = useState<ExpandedState>(true);

  const {
    options: employeeOptions,
    hasMore: hasMoreEmployees,
    loadMore: loadMoreEmployees,
  } = useEmployeesInfinite({ companyId, search: assigneeSearch });

  const codes = useMemo(() => computeTodoCodes(value), [value]);

  const handleCellEdit = useCallback(
    (_rowIndex: number, columnId: string, val: unknown, row?: TodoNode) => {
      if (!row) return;

      if (columnId === 'task') {
        onChange(updateTodoNode(value, row.id, { task: String(val ?? '') }));
        return;
      }

      if (columnId === 'taskType') {
        const nextType = val as TodoTaskType;
        onChange(
          updateTodoNode(value, row.id, {
            taskType: nextType,
            assignedToEmployeeId: null,
            assignedToEmployeeName: null,
          })
        );
        return;
      }

      if (columnId === 'assignee') {
        const employeeId = val ? String(val) : null;
        const employeeName = employeeId
          ? (employeeOptions.find((option) => option.value === employeeId)?.label ?? null)
          : null;

        onChange(
          updateTodoNode(value, row.id, {
            assignedToEmployeeId: employeeId,
            assignedToEmployeeName: employeeName,
          })
        );
      }
    },
    [value, onChange, employeeOptions]
  );

  const handleAddChild = useCallback(
    (node: TodoNode) => {
      onChange(addTodoChild(value, node.id, createEmptyTodoNode()));
      setExpanded((prev) => (prev === true ? prev : { ...prev, [node.id]: true }));
    },
    [value, onChange]
  );

  const handleAddSibling = useCallback(
    (node: TodoNode) => onChange(addTodoSibling(value, node.id, 'below', createEmptyTodoNode())),
    [value, onChange]
  );

  const handleInsertAbove = useCallback(
    (node: TodoNode) => onChange(addTodoSibling(value, node.id, 'above', createEmptyTodoNode())),
    [value, onChange]
  );

  const handleInsertBelow = useCallback(
    (node: TodoNode) => onChange(addTodoSibling(value, node.id, 'below', createEmptyTodoNode())),
    [value, onChange]
  );

  const handleDelete = useCallback(
    (node: TodoNode) => onChange(deleteTodoNode(value, node.id)),
    [value, onChange]
  );

  const handleCut = useCallback((node: TodoNode) => {
    clipboardRef.current = node;
  }, []);

  const handleCopy = useCallback((node: TodoNode) => {
    clipboardRef.current = cloneTodoNode(node);
  }, []);

  const handlePaste = useCallback(
    (target: TodoNode) => {
      const buffered = clipboardRef.current;
      if (!buffered) return;
      onChange(addTodoSibling(value, target.id, 'below', cloneTodoNode(buffered)));
      clipboardRef.current = null;
    },
    [value, onChange]
  );

  const columns = useMemo<ColumnDef<TodoNode>[]>(
    () => [
      {
        id: 'code',
        header: columnLabels.CODE,
        enableSorting: false,
        size: 140,
        cell: ({ row }) => <span>{codes.get(row.original.id)}</span>,
      },
      {
        id: 'actions',
        header: columnLabels.ADD_TASK_SUBTASK,
        enableSorting: false,
        size: 140,
        cell: ({ row }) => {
          const node = row.original;
          const canChild = canAddTodoChild(value, node.id);
          return (
            <TooltipProvider>
              <div className="flex items-center gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      onClick={() => handleAddSibling(node)}
                      className="text-muted-foreground hover:text-foreground"
                      aria-label={labels.TOOLTIPS.ADD_SIBLING}
                    >
                      <PlusSquare className="h-3.5 w-3.5" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>{labels.TOOLTIPS.ADD_SIBLING}</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      disabled={!canChild}
                      onClick={() => handleAddChild(node)}
                      className="text-muted-foreground hover:text-foreground disabled:opacity-30"
                      aria-label={labels.TOOLTIPS.ADD_CHILD}
                    >
                      <CornerDownRight className="h-3.5 w-3.5" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>{labels.TOOLTIPS.ADD_CHILD}</TooltipContent>
                </Tooltip>
              </div>
            </TooltipProvider>
          );
        },
      },
      {
        accessorKey: 'task',
        header: columnLabels.TASK,
        enableSorting: false,
        meta: { editable: true },
      },
      {
        id: 'taskType',
        header: columnLabels.TYPE,
        enableSorting: false,
        size: 130,
        cell: ({ row }) =>
          TASK_TYPE_OPTIONS.find((option) => option.value === row.original.taskType)?.label,
        meta: {
          editable: true,
          edit: { editType: 'select', selectOptions: TASK_TYPE_OPTIONS },
        },
      },
      {
        id: 'assignee',
        header: columnLabels.ASSIGNEE,
        enableSorting: false,
        size: 200,
        cell: ({ row }) => row.original.assignedToEmployeeName ?? '-',
        meta: {
          editable: true,
          edit: {
            editType: 'async-select',
            selectOptions: employeeOptions,
            selectHasNextPage: hasMoreEmployees,
            selectOnLoadMore: loadMoreEmployees,
            selectOnSearch: setAssigneeSearch,
          },
        },
      },
    ],
    [
      codes,
      value,
      handleAddChild,
      handleAddSibling,
      employeeOptions,
      hasMoreEmployees,
      loadMoreEmployees,
    ]
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
      enableRangeSelection
      enableZebraStripes={false}
      onCellEdit={handleCellEdit}
      emptyMessage={labels.EMPTY_TITLE}
      contextMenu={(row) => {
        const node = row.original;
        return (
          <>
            <ContextMenuItem onClick={() => handleCut(node)}>
              {labels.CONTEXT_MENU.CUT}
            </ContextMenuItem>
            <ContextMenuItem onClick={() => handleCopy(node)}>
              {labels.CONTEXT_MENU.COPY}
            </ContextMenuItem>
            <ContextMenuItem disabled={!clipboardRef.current} onClick={() => handlePaste(node)}>
              {labels.CONTEXT_MENU.PASTE}
            </ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuItem onClick={() => handleInsertAbove(node)}>
              {labels.CONTEXT_MENU.INSERT_ABOVE}
            </ContextMenuItem>
            <ContextMenuItem onClick={() => handleInsertBelow(node)}>
              {labels.CONTEXT_MENU.INSERT_BELOW}
            </ContextMenuItem>
            {canAddTodoChild(value, node.id) && (
              <ContextMenuItem onClick={() => handleAddChild(node)}>
                {labels.CONTEXT_MENU.ADD_CHILD}
              </ContextMenuItem>
            )}
            <ContextMenuSeparator />
            <ContextMenuItem variant="destructive" onClick={() => handleDelete(node)}>
              {labels.CONTEXT_MENU.DELETE}
            </ContextMenuItem>
          </>
        );
      }}
    />
  );
}
