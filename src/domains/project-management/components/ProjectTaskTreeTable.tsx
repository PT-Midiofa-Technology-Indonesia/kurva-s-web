'use client';

import type { ColumnDef, ExpandedState } from '@tanstack/react-table';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useProjectTaskDetailHistory } from '@/domains/project-control/hooks/use-project-task-detail-history';
import { ConfirmDialog } from '@/shared/components/molecules/AlertDialog';
import { DataTable } from '@/shared/components/organisms/DataTable';
import type { ExistingFile } from '@/shared/components/organisms/FormGenerator/types';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { getErrorMessage } from '@/shared/lib/api-error';
import { toast } from '@/shared/lib/toast';
import { cn } from '@/shared/lib/utils';
import { formatDate } from '@/shared/utils/format';
import type {
  TaskDetailHistory,
  TaskHistory,
} from '../../project-control/api/get-project-detail-task-history';
import {
  DEFAULT_TASK_STATUS_BADGE_CLASSNAME,
  PROJECT_TASK_TREE_LABELS,
  QC_DECISION_LABELS,
  TASK_STATUS_BADGE_CLASSNAMES,
} from '../constants';
import { useCancelProjectTask, useClaimProjectTask } from '../hooks';
import type {
  ProjectTaskCategory,
  ProjectTreeItem,
  TaskActionItem,
  TaskControlStatus,
} from '../types/manpower-planning';
import { QcTaskReviewDialog } from './QcTaskReviewDialog';
import {
  TaskDoneDialog,
  type TaskDoneDialogDetail,
  type TaskDoneDialogQcDetail,
} from './TaskDoneDialog';

// const NON_CANCELLABLE_STATUSES: TaskControlStatus[] = [
//   'Done',
//   'QC Passed',
//   'QC Failed',
//   'Delegate',
// ];
//
// const QC_CANCELLABLE_STATUSES: TaskControlStatus[] = ['Created', 'In Progress'];

/** Statuses where the task can still be worked on — anything else opens the dialog read-only. */
const ACTIONABLE_STATUSES: TaskControlStatus[] = ['Created', 'In Progress', 'Reopened'];

function isActionableStatus(status?: string): boolean {
  return ACTIONABLE_STATUSES.includes(status as TaskControlStatus);
}

function toTaskActionItem(item: ProjectTreeItem): TaskActionItem | null {
  if (!item.taskId) return null;

  return {
    id: item.id,
    taskId: item.taskId,
    boqCode: item.code,
    title: item.jobItem,
    assignee: item.assignee ?? null,
    doneAt: item.doneAt ?? null,
    status: item.status ?? 'Created',
  };
}

function toTaskDoneDialogFallback(item: ProjectTreeItem | null): TaskDoneDialogDetail | null {
  if (!item) return null;

  return {
    createdBy: item.createdBy ?? '-',
    doneBy: item.doneBy ?? '-',
    description: item.description ?? '-',
    activityDescription: '',
    evidenceFiles: [],
    qcEvidenceFiles: [],
    qc: null,
  };
}

function getLatestTaskHistory(tasks: TaskHistory[]): TaskHistory | null {
  if (tasks.length === 0) return null;

  return tasks.slice(1).reduce<TaskHistory>((latestTask, currentTask) => {
    const latestTimestamp = Date.parse(latestTask.updatedAt ?? latestTask.createdAt ?? '');
    const currentTimestamp = Date.parse(currentTask.updatedAt ?? currentTask.createdAt ?? '');

    if (Number.isNaN(latestTimestamp)) return currentTask;
    if (Number.isNaN(currentTimestamp)) return latestTask;

    return currentTimestamp > latestTimestamp ? currentTask : latestTask;
  }, tasks[0]);
}

function mapEvidenceFiles(
  evidences: TaskDetailHistory['evidences'] | TaskDetailHistory['evidenceQcTask']
): ExistingFile[] {
  return (evidences ?? []).flatMap((evidence) =>
    (evidence.files ?? []).map((file) => ({
      id: file.id,
      fileName: file.fileName,
      fileSize: file.fileSize,
      mimeType: file.mimeType,
      url: file.filePath,
    }))
  );
}

/**
 * The task detail response already carries the QC cycles run against the task, so the
 * manpower-planning dialog can surface the QC outcome without a second request. Only the
 * latest cycle is shown — a retried task keeps its earlier attempts in `qcTasks`.
 */
function toTaskDoneDialogQcDetail(data: TaskDetailHistory): TaskDoneDialogQcDetail | null {
  const latestQcTask = getLatestTaskHistory(data.qcTasks ?? []);
  if (!latestQcTask) return null;

  const decision = typeof latestQcTask.qcDecision === 'string' ? latestQcTask.qcDecision : null;

  return {
    delegator: latestQcTask.createdByUser?.name ?? '-',
    assignee: latestQcTask.assignedEmployee?.fullName ?? '-',
    qcAt: latestQcTask.doneAt ?? null,
    decision: (decision ? QC_DECISION_LABELS[decision] : null) ?? '-',
    note: typeof latestQcTask.notes === 'string' ? latestQcTask.notes : '',
    evidenceFiles: mapEvidenceFiles(data.evidenceQcTask),
  };
}

function toTaskDoneDialogDetailFromHistory(
  data: TaskDetailHistory,
  taskId: string,
  fallbackItem: ProjectTreeItem | null
): TaskDoneDialogDetail {
  const matchedTask = data.taskHistory.find((task) => task.id === taskId);
  const latestTask = matchedTask ?? getLatestTaskHistory(data.taskHistory) ?? null;

  return {
    createdBy: latestTask?.createdByUser?.name ?? fallbackItem?.createdBy ?? '-',
    doneBy: latestTask?.doneByUser?.name ?? fallbackItem?.doneBy ?? '-',
    description: latestTask?.description ?? fallbackItem?.description ?? '-',
    activityDescription: typeof latestTask?.notes === 'string' ? latestTask.notes : '',
    evidenceFiles: mapEvidenceFiles(data.evidences),
    qcEvidenceFiles: mapEvidenceFiles(data.evidenceQcTask),
    qc: toTaskDoneDialogQcDetail(data),
  };
}

function toQcTaskReviewDialogDetailFromHistory(
  data: TaskDetailHistory,
  taskId: string,
  fallbackItem: ProjectTreeItem | null
): TaskDoneDialogDetail {
  const matchedTask = data.taskHistory.find((task) => task.id === taskId);
  const latestTask = matchedTask ?? getLatestTaskHistory(data.taskHistory) ?? null;
  const latestQcTask = getLatestTaskHistory(data.qcTasks ?? []);

  return {
    createdBy: latestTask?.createdByUser?.name ?? fallbackItem?.createdBy ?? '-',
    doneBy: latestTask?.doneByUser?.name ?? fallbackItem?.doneBy ?? '-',
    description: typeof latestTask?.notes === 'string' ? latestTask.notes : '-',
    activityDescription: typeof latestQcTask?.notes === 'string' ? latestQcTask.notes : '-',
    evidenceFiles: mapEvidenceFiles(data.evidences),
    qcEvidenceFiles: mapEvidenceFiles(data.evidenceQcTask),
    qc: null,
  };
}

interface ProjectTaskTreeTableProps {
  items: ProjectTreeItem[];
  search: string;
  isLoading?: boolean;
  clearSelectionSignal?: number;
  taskCategory?: ProjectTaskCategory;
  onSelectedItemsChange: (selectedItems: ProjectTreeItem[]) => void;
}

function getSubRows(row: ProjectTreeItem): ProjectTreeItem[] | undefined {
  const children = row.children ?? [];
  return children.length > 0 ? children : undefined;
}

function getRowId(originalRow: ProjectTreeItem): string {
  return originalRow.id;
}

function flattenTree(nodes: ProjectTreeItem[]): ProjectTreeItem[] {
  const result: ProjectTreeItem[] = [];
  for (const node of nodes) {
    result.push(node);
    if (node.children) {
      result.push(...flattenTree(node.children));
    }
  }
  return result;
}

/** A row is selectable unless the API explicitly marked it as non-delegatable. */
function isSelectableItem(item: ProjectTreeItem): boolean {
  return item.isDelegatable !== false;
}

/**
 * Maps every node id to all of its descendant ids (children, grandchildren, …).
 * Checking a row cascades down this list — never up to its ancestors.
 */
function buildDescendantIdMap(nodes: ProjectTreeItem[]): Map<string, string[]> {
  const map = new Map<string, string[]>();

  function collect(node: ProjectTreeItem): string[] {
    const descendantIds: string[] = [];
    for (const child of node.children ?? []) {
      descendantIds.push(child.id, ...collect(child));
    }
    map.set(node.id, descendantIds);
    return descendantIds;
  }

  for (const node of nodes) {
    collect(node);
  }
  return map;
}

export function ProjectTaskTreeTable({
  items,
  search,
  isLoading = false,
  clearSelectionSignal,
  taskCategory = 'control',
  onSelectedItemsChange,
}: ProjectTaskTreeTableProps) {
  const isQc = taskCategory === 'qc';
  const [expanded, setExpanded] = useState<ExpandedState>(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [doneTaskItem, setDoneTaskItem] = useState<ProjectTreeItem | null>(null);
  const [cancelTaskItem, setCancelTaskItem] = useState<ProjectTreeItem | null>(null);
  const { mutate: cancelTask, isPending: isCancelling } = useCancelProjectTask();
  const { mutate: claimTask } = useClaimProjectTask();
  const treeSelectionKey = useMemo(
    () => items.map((item) => `${item.id}:${item.taskId ?? ''}:${item.status ?? ''}`).join('|'),
    [items]
  );

  // Selections don't carry across a different project's tree (e.g. after switching
  // the project selector) — ids from the previous tree wouldn't map to real boqItemIds.
  useEffect(() => {
    if (treeSelectionKey === '') {
      setSelectedIds(new Set());
      return;
    }

    setSelectedIds(new Set());
  }, [treeSelectionKey]);

  useEffect(() => {
    if (clearSelectionSignal === undefined) return;
    setSelectedIds(new Set());
  }, [clearSelectionSignal]);

  const doneActionItem = useMemo(
    () => (doneTaskItem ? toTaskActionItem(doneTaskItem) : null),
    [doneTaskItem]
  );
  const {
    data: doneTaskHistory,
    isLoading: isDoneTaskDetailLoading,
    isFetching: isDoneTaskDetailFetching,
  } = useProjectTaskDetailHistory(doneActionItem?.id);
  const doneTaskFallbackDetail = useMemo(
    () => toTaskDoneDialogFallback(doneTaskItem),
    [doneTaskItem]
  );
  const doneTaskDetail = useMemo(() => {
    if (!doneActionItem?.id || !doneTaskHistory) {
      return null;
    }

    return isQc
      ? toQcTaskReviewDialogDetailFromHistory(doneTaskHistory, doneActionItem.id, doneTaskItem)
      : toTaskDoneDialogDetailFromHistory(doneTaskHistory, doneActionItem.id, doneTaskItem);
  }, [doneActionItem?.id, doneTaskHistory, doneTaskItem, isQc]);
  const effectiveDoneTaskDetail =
    doneTaskDetail ??
    (isDoneTaskDetailLoading || isDoneTaskDetailFetching ? null : doneTaskFallbackDetail);

  const handleClaim = useCallback(
    (item: ProjectTreeItem) => {
      if (!item.taskId) return;

      claimTask(item.taskId, {
        onSuccess: () => {
          toast.success({ title: PROJECT_TASK_TREE_LABELS.TOAST.QC_CLAIM_SUCCESS });
        },
        onError: (error) => {
          toast.error({ title: getErrorMessage(error) });
        },
      });
    },
    [claimTask]
  );

  const handleCancelConfirm = () => {
    const actionItem = cancelTaskItem ? toTaskActionItem(cancelTaskItem) : null;
    if (!actionItem) return;

    cancelTask(actionItem.taskId, {
      onSuccess: () => {
        toast.success({ title: PROJECT_TASK_TREE_LABELS.TOAST.TASK_CANCEL_SUCCESS });
        setCancelTaskItem(null);
      },
      onError: (error) => {
        toast.error({ title: getErrorMessage(error) });
      },
    });
  };

  const filteredData = useMemo(() => {
    if (!search.trim()) return items;
    const lowerSearch = search.toLowerCase();

    function filterNodes(nodes: ProjectTreeItem[]): ProjectTreeItem[] {
      const result: ProjectTreeItem[] = [];
      for (const node of nodes) {
        const children = node.children ?? [];
        const matches =
          node.jobItem.toLowerCase().includes(lowerSearch) ||
          node.code.toLowerCase().includes(lowerSearch);
        const filteredChildren = filterNodes(children);
        if (matches || filteredChildren.length > 0) {
          result.push({ ...node, children: filteredChildren });
        }
      }
      return result;
    }
    return filterNodes(items);
  }, [search, items]);

  // Rows the API marked as non-delegatable can't be selected — not directly,
  // not through a parent's cascade, not through "select all".
  const selectableIds = useMemo(
    () =>
      new Set(
        flattenTree(filteredData)
          .filter(isSelectableItem)
          .map((item) => item.id)
      ),
    [filteredData]
  );

  const descendantIdsById = useMemo(() => buildDescendantIdMap(filteredData), [filteredData]);

  const toggleSelection = useCallback(
    (id: string, checked: boolean) => {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        // Checking a row also checks its whole subtree (all nesting levels);
        // ancestors are deliberately left untouched.
        const ids = [id, ...(descendantIdsById.get(id) ?? [])];
        for (const currentId of ids) {
          if (checked) {
            if (selectableIds.has(currentId)) next.add(currentId);
          } else {
            next.delete(currentId);
          }
        }
        return next;
      });
    },
    [descendantIdsById, selectableIds]
  );

  const toggleAll = useCallback(
    (checked: boolean) => {
      setSelectedIds(checked ? new Set(selectableIds) : new Set<string>());
    },
    [selectableIds]
  );

  useEffect(() => {
    const allFlat = flattenTree(filteredData);
    const selected = allFlat.filter((item) => selectedIds.has(item.id));
    onSelectedItemsChange(selected);
  }, [selectedIds, filteredData, onSelectedItemsChange]);

  const isAllSelected =
    selectableIds.size > 0 && [...selectableIds].every((id) => selectedIds.has(id));
  const isSomeSelected = selectedIds.size > 0 && !isAllSelected;

  const columns: ColumnDef<ProjectTreeItem>[] = useMemo(
    () => [
      {
        id: '__select__',
        header: () => (
          <Checkbox
            checked={isAllSelected || (isSomeSelected && 'indeterminate')}
            onCheckedChange={(value) => toggleAll(!!value)}
            disabled={selectableIds.size === 0}
            aria-label={PROJECT_TASK_TREE_LABELS.TABLE.SELECT_ALL}
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={selectedIds.has(row.original.id)}
            onCheckedChange={(value) => toggleSelection(row.original.id, !!value)}
            disabled={!isSelectableItem(row.original)}
            aria-label={PROJECT_TASK_TREE_LABELS.TABLE.SELECT_ROW}
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
        id: 'code',
        header: PROJECT_TASK_TREE_LABELS.TABLE.KODE,
        accessorKey: 'code',
        enableSorting: false,
        enableHiding: false,
      },
      {
        id: 'jobItem',
        header: PROJECT_TASK_TREE_LABELS.TABLE.JOB_ITEM,
        accessorKey: 'jobItem',
        enableSorting: false,
      },
      {
        id: 'jenis',
        header: PROJECT_TASK_TREE_LABELS.TABLE.JENIS,
        accessorKey: 'jenis',
        enableSorting: false,
      },
      {
        id: 'assignee',
        header: PROJECT_TASK_TREE_LABELS.TABLE.ASSIGNEE,
        cell: ({ row }) => <span>{row.original.assignee ?? '-'}</span>,
        enableSorting: false,
      },
      {
        id: 'doneAt',
        header: PROJECT_TASK_TREE_LABELS.TABLE.DONE_AT,
        cell: ({ row }) =>
          row.original.doneAt ? <span>{formatDate(row.original.doneAt)}</span> : <span>-</span>,
        enableSorting: false,
      },
      {
        id: 'retryCount',
        header: PROJECT_TASK_TREE_LABELS.TABLE.RETRY_COUNT,
        cell: ({ row }) => <span>{row.original.retryCount ?? '-'}</span>,
        enableSorting: false,
      },
      {
        id: 'status',
        header: PROJECT_TASK_TREE_LABELS.TABLE.STATUS,
        cell: ({ row }) => {
          const status = row.original.status;
          if (!status) return <span>-</span>;

          return (
            <Badge
              variant="secondary"
              className={cn(
                'h-5 rounded-md border-0 px-2 text-xs font-medium',
                TASK_STATUS_BADGE_CLASSNAMES[status] ?? DEFAULT_TASK_STATUS_BADGE_CLASSNAME
              )}
            >
              {status}
            </Badge>
          );
        },
        enableSorting: false,
      },
      {
        id: 'actions',
        header: PROJECT_TASK_TREE_LABELS.TABLE.ACTION,
        cell: ({ row }) => {
          if (!row.original.taskId) return null;
          const status = row.original.status;
          const isReadOnlyDetail = !isActionableStatus(status);
          // const isCancellable = isQc
          //   ? QC_CANCELLABLE_STATUSES.includes(status as TaskControlStatus)
          //   : !NON_CANCELLABLE_STATUSES.includes(status as TaskControlStatus);
          // Claim is only offered on a fresh, still-unassigned QC task.
          const isUnclaimedQc = isQc && !row.original.assignee && status === 'Created';
          // An unclaimed QC task can still be inspected — the dialog just can't be submitted yet.
          const showAsDetail = isReadOnlyDetail || isUnclaimedQc;
          // const isCancelled = status === 'Cancelled';

          return (
            <div className="flex justify-end gap-2">
              {isUnclaimedQc && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClaim(row.original);
                  }}
                >
                  {PROJECT_TASK_TREE_LABELS.ACTIONS.CLAIM}
                </Button>
              )}
              <Button
                type="button"
                variant={showAsDetail ? 'outline' : 'default'}
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setDoneTaskItem(row.original);
                }}
              >
                {showAsDetail
                  ? PROJECT_TASK_TREE_LABELS.ACTIONS.DETAIL
                  : PROJECT_TASK_TREE_LABELS.ACTIONS.DONE}
              </Button>
              {/* {!isCancelled && (
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  disabled={!isCancellable}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCancelTaskItem(row.original);
                  }}
                >
                  {isQc
                    ? PROJECT_TASK_TREE_LABELS.ACTIONS.CANCEL_QC_TASK
                    : PROJECT_TASK_TREE_LABELS.ACTIONS.CANCEL_TASK}
                </Button>
              )} */}
            </div>
          );
        },
        enableSorting: false,
      } satisfies ColumnDef<ProjectTreeItem>,
    ],

    [
      isAllSelected,
      isSomeSelected,
      selectedIds,
      selectableIds,
      toggleAll,
      toggleSelection,
      isQc,
      handleClaim,
    ]
  );

  return (
    <>
      <DataTable<ProjectTreeItem, unknown>
        columns={columns}
        data={filteredData}
        isLoading={isLoading}
        getRowId={getRowId}
        getSubRows={getSubRows}
        enableTreeView
        expanded={expanded}
        onExpandedChange={setExpanded}
        enableColumnDnd={false}
        enableColumnResize={false}
        enablePagination={false}
        enableRangeSelection={false}
        enableZebraStripes={false}
        emptyMessage={PROJECT_TASK_TREE_LABELS.TABLE.EMPTY}
        className="w-full"
      />

      {isQc ? (
        <QcTaskReviewDialog
          open={doneTaskItem != null}
          onOpenChange={(open) => {
            if (!open) setDoneTaskItem(null);
          }}
          item={doneActionItem}
          detail={effectiveDoneTaskDetail}
          readOnly={!isActionableStatus(doneActionItem?.status)}
          isLoading={isDoneTaskDetailLoading || isDoneTaskDetailFetching}
        />
      ) : (
        <TaskDoneDialog
          open={doneTaskItem != null}
          onOpenChange={(open) => {
            if (!open) setDoneTaskItem(null);
          }}
          item={doneActionItem}
          detail={effectiveDoneTaskDetail}
          readOnly={!isActionableStatus(doneActionItem?.status)}
          isLoading={isDoneTaskDetailLoading || isDoneTaskDetailFetching}
        />
      )}

      <ConfirmDialog
        open={cancelTaskItem != null}
        onOpenChange={(open) => {
          if (!open) setCancelTaskItem(null);
        }}
        variant="danger"
        title={PROJECT_TASK_TREE_LABELS.DIALOG.CANCEL_TITLE}
        description={PROJECT_TASK_TREE_LABELS.DIALOG.CANCEL_DESCRIPTION(
          cancelTaskItem?.jobItem ?? ''
        )}
        cancelText={PROJECT_TASK_TREE_LABELS.DIALOG.CANCEL_TEXT}
        confirmText={PROJECT_TASK_TREE_LABELS.DIALOG.CONFIRM_CANCEL}
        onCancel={() => setCancelTaskItem(null)}
        onConfirm={handleCancelConfirm}
        isLoading={isCancelling}
      />
    </>
  );
}
