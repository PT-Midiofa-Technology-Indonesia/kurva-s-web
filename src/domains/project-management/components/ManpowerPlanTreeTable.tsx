'use client';

import type { ColumnDef, ExpandedState } from '@tanstack/react-table';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { DataTable } from '@/shared/components/organisms/DataTable';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { cn } from '@/shared/lib/utils';
import { formatDate } from '@/shared/utils/format';
import { BADGE_CHROME, MANPOWER_PLAN_LABELS } from '../constants/manpower-plan';
import {
  getManpowerRowAction,
  isManpowerRowCheckable,
  isManpowerRowEditable,
  type ManpowerRowAction,
} from '../services/manpower-plan-flow.service';
import type { ManpowerPlanTreeItem } from '../types/manpower-planning';

/** Assignees cell shows at most this many names before the `+n` overflow rule. */
const MAX_VISIBLE_ASSIGNEES = 2;

type ResolvedManpowerRowAction = Exclude<ManpowerRowAction, null>;

interface ManpowerActionPresentation {
  label: string;
  variant: 'default' | 'outline';
  className?: string;
}

/**
 * One button per row, keyed by `getManpowerRowAction(item)`. Presentation only — routing to the
 * page's two callbacks is decided in the cell by `isParentAction`.
 */
const ACTION_PRESENTATION: Record<ResolvedManpowerRowAction, ManpowerActionPresentation> = {
  'assign-parent': {
    label: MANPOWER_PLAN_LABELS.ACTIONS.ASSIGN,
    variant: 'default',
    className: 'bg-teal-600 text-white hover:bg-teal-700',
  },
  'view-parent': { label: MANPOWER_PLAN_LABELS.ACTIONS.LIHAT, variant: 'outline' },
  'assign-leaf': { label: MANPOWER_PLAN_LABELS.ACTIONS.ASSIGN, variant: 'default' },
  'selesaikan-leaf': {
    label: MANPOWER_PLAN_LABELS.ACTIONS.SELESAIKAN,
    variant: 'default',
    className: 'bg-amber-400 text-slate-950 hover:bg-amber-500',
  },
  'view-leaf': { label: MANPOWER_PLAN_LABELS.ACTIONS.LIHAT, variant: 'outline' },
};

/** Parents and leaves emit to different page callbacks — the guard also narrows `action`. */
function isParentAction(
  action: ResolvedManpowerRowAction
): action is 'assign-parent' | 'view-parent' {
  return action === 'assign-parent' || action === 'view-parent';
}

function getSubRows(row: ManpowerPlanTreeItem): ManpowerPlanTreeItem[] | undefined {
  const children = row.children ?? [];
  return children.length > 0 ? children : undefined;
}

function getRowId(originalRow: ManpowerPlanTreeItem): string {
  return originalRow.id;
}

function flattenTree(nodes: ManpowerPlanTreeItem[]): ManpowerPlanTreeItem[] {
  const result: ManpowerPlanTreeItem[] = [];
  for (const node of nodes) {
    result.push(node);
    if (node.children) {
      result.push(...flattenTree(node.children));
    }
  }
  return result;
}

/** A node survives when it (code/name) or any descendant matches — its subtree stays attached. */
function filterTreeBySearch(
  nodes: ManpowerPlanTreeItem[],
  lowerSearch: string
): ManpowerPlanTreeItem[] {
  const result: ManpowerPlanTreeItem[] = [];
  for (const node of nodes) {
    const children = node.children ?? [];
    const matches =
      node.code.toLowerCase().includes(lowerSearch) ||
      node.name.toLowerCase().includes(lowerSearch);
    const filteredChildren = filterTreeBySearch(children, lowerSearch);
    if (matches || filteredChildren.length > 0) {
      result.push({ ...node, children: filteredChildren });
    }
  }
  return result;
}

/** `assignees` cell: at most MAX_VISIBLE_ASSIGNEES names, then the `+n` overflow marker. */
function renderAssignees(assignees: string[]): string {
  if (assignees.length === 0) return '-';
  const visible = assignees.slice(0, MAX_VISIBLE_ASSIGNEES).join(', ');
  const overflowCount = assignees.length - MAX_VISIBLE_ASSIGNEES;

  return overflowCount > 0
    ? `${visible} ${MANPOWER_PLAN_LABELS.TABLE.ASSIGNEES_OVERFLOW(overflowCount)}`
    : visible;
}

interface ManpowerPlanTreeTableProps {
  items: ManpowerPlanTreeItem[];
  search: string;
  isLoading?: boolean;
  clearSelectionSignal?: number;
  onSelectedItemsChange: (items: ManpowerPlanTreeItem[]) => void;
  onParentAction: (item: ManpowerPlanTreeItem, action: 'assign-parent' | 'view-parent') => void;
  onLeafAction: (
    item: ManpowerPlanTreeItem,
    action: 'assign-leaf' | 'selesaikan-leaf' | 'view-leaf' | 'edit-leaf'
  ) => void;
}

export function ManpowerPlanTreeTable({
  items,
  search,
  isLoading = false,
  clearSelectionSignal,
  onSelectedItemsChange,
  onParentAction,
  onLeafAction,
}: ManpowerPlanTreeTableProps) {
  const [expanded, setExpanded] = useState<ExpandedState>(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Selections don't survive a different tree (project switch / fresh fetch) — stale ids
  // wouldn't map to real boqItemIds any more. An empty key means "no data yet" (search keystroke
  // refetch) — resetting then would wipe a selection being built, so that case is skipped.
  const treeSelectionKey = useMemo(() => items.map((item) => item.id).join('|'), [items]);
  useEffect(() => {
    if (treeSelectionKey === '') return;
    setSelectedIds(new Set());
  }, [treeSelectionKey]);

  useEffect(() => {
    if (clearSelectionSignal === undefined) return;
    setSelectedIds(new Set());
  }, [clearSelectionSignal]);

  const filteredData = useMemo(() => {
    if (!search.trim()) return items;
    return filterTreeBySearch(items, search.toLowerCase());
  }, [items, search]);

  // Checkbox column is parents-only: leaves render an empty cell and never enter the selection.
  const selectableIds = useMemo(
    () =>
      new Set(
        flattenTree(filteredData)
          .filter(isManpowerRowCheckable)
          .map((item) => item.id)
      ),
    [filteredData]
  );

  // No descendant cascade on purpose — checkboxes mark PARENT items for bulk parent-assignment,
  // so checking a parent selects only that parent (select-all takes every parent).
  const toggleSelection = useCallback((id: string, checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
  }, []);

  const toggleAll = useCallback(
    (checked: boolean) => {
      setSelectedIds(checked ? new Set(selectableIds) : new Set<string>());
    },
    [selectableIds]
  );

  useEffect(() => {
    const selected = flattenTree(filteredData).filter((item) => selectedIds.has(item.id));
    onSelectedItemsChange(selected);
  }, [selectedIds, filteredData, onSelectedItemsChange]);

  const isAllSelected =
    selectableIds.size > 0 && [...selectableIds].every((id) => selectedIds.has(id));
  const isSomeSelected = selectedIds.size > 0 && !isAllSelected;

  const columns: ColumnDef<ManpowerPlanTreeItem>[] = useMemo(
    () => [
      {
        id: '__select__',
        header: () => (
          <Checkbox
            checked={isAllSelected || (isSomeSelected && 'indeterminate')}
            onCheckedChange={(value) => toggleAll(!!value)}
            disabled={selectableIds.size === 0}
            aria-label={MANPOWER_PLAN_LABELS.TABLE.SELECT_ALL}
          />
        ),
        // Per Figma the checkbox belongs to parents only — a leaf row renders an empty cell.
        cell: ({ row }) =>
          isManpowerRowCheckable(row.original) ? (
            <Checkbox
              checked={selectedIds.has(row.original.id)}
              onCheckedChange={(value) => toggleSelection(row.original.id, !!value)}
              aria-label={MANPOWER_PLAN_LABELS.TABLE.SELECT_ROW}
              onClick={(e) => e.stopPropagation()}
            />
          ) : null,
        enableSorting: false,
        enableHiding: false,
        enableResizing: false,
        size: 40,
        minSize: 40,
        maxSize: 40,
      },
      {
        id: 'code',
        header: MANPOWER_PLAN_LABELS.TABLE.KODE,
        accessorKey: 'code',
        enableSorting: false,
        enableHiding: false,
      },
      {
        id: 'jobItem',
        header: MANPOWER_PLAN_LABELS.TABLE.JOB_ITEM,
        accessorKey: 'name',
        enableSorting: false,
      },
      {
        id: 'volume',
        header: MANPOWER_PLAN_LABELS.TABLE.VOLUME,
        cell: ({ row }) => (
          <span>
            {row.original.volume ? `${row.original.volume.value} ${row.original.volume.unit}` : '-'}
          </span>
        ),
        enableSorting: false,
      },
      {
        id: 'assignees',
        header: MANPOWER_PLAN_LABELS.TABLE.ASSIGN,
        cell: ({ row }) => <span>{renderAssignees(row.original.assignees)}</span>,
        enableSorting: false,
      },
      {
        id: 'progress',
        header: MANPOWER_PLAN_LABELS.TABLE.PROGRES,
        cell: ({ row }) => {
          const { progress, volume } = row.original;
          if (!progress || !volume) return <span>-</span>;

          return (
            <span>
              {progress.achieved} / {volume.value} {volume.unit}
            </span>
          );
        },
        enableSorting: false,
      },
      {
        id: 'status',
        header: MANPOWER_PLAN_LABELS.TABLE.STATUS,
        cell: ({ row }) => (
          <Badge
            variant="secondary"
            className={cn(
              BADGE_CHROME.STATUS,
              MANPOWER_PLAN_LABELS.STATUS_BADGE_CLASSNAMES[row.original.status]
            )}
          >
            {row.original.status}
          </Badge>
        ),
        enableSorting: false,
      },
      {
        id: 'lastUpdate',
        header: MANPOWER_PLAN_LABELS.TABLE.LAST_UPDATE,
        cell: ({ row }) =>
          row.original.lastUpdate ? (
            <span>{formatDate(row.original.lastUpdate)}</span>
          ) : (
            <span>-</span>
          ),
        enableSorting: false,
      },
      {
        id: 'revisi',
        header: MANPOWER_PLAN_LABELS.TABLE.REVISI,
        cell: ({ row }) =>
          row.original.revisiCount > 0 ? (
            <Badge variant="secondary" className={cn(BADGE_CHROME.REVISI)}>
              {MANPOWER_PLAN_LABELS.TABLE.REVISI_COUNT(row.original.revisiCount)}
            </Badge>
          ) : (
            <span>-</span>
          ),
        enableSorting: false,
      },
      {
        id: 'actions',
        header: MANPOWER_PLAN_LABELS.TABLE.ACTION,
        cell: ({ row }) => {
          const action = getManpowerRowAction(row.original);
          const isEditable = isManpowerRowEditable(row.original);
          if (!action && !isEditable) return null;

          return (
            <div className="flex justify-end gap-2">
              {isEditable && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onLeafAction(row.original, 'edit-leaf');
                  }}
                >
                  {MANPOWER_PLAN_LABELS.ACTIONS.EDIT}
                </Button>
              )}
              {action && (
                <Button
                  type="button"
                  variant={ACTION_PRESENTATION[action].variant}
                  size="sm"
                  className={ACTION_PRESENTATION[action].className}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (isParentAction(action)) {
                      onParentAction(row.original, action);
                    } else {
                      onLeafAction(row.original, action);
                    }
                  }}
                >
                  {ACTION_PRESENTATION[action].label}
                </Button>
              )}
            </div>
          );
        },
        enableSorting: false,
      },
    ],
    [
      isAllSelected,
      isSomeSelected,
      selectedIds,
      selectableIds,
      toggleAll,
      toggleSelection,
      onParentAction,
      onLeafAction,
    ]
  );

  return (
    <DataTable<ManpowerPlanTreeItem, unknown>
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
      emptyMessage={MANPOWER_PLAN_LABELS.TABLE.EMPTY}
      className="w-full"
    />
  );
}
