'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { DataTable } from '@/shared/components/organisms/DataTable';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { cn } from '@/shared/lib/utils';
import { formatDate } from '@/shared/utils/format';
import { BADGE_CHROME, MANPOWER_PLAN_LABELS } from '../constants/manpower-plan';
import { getQcRowAction, isQcRowCheckable } from '../services/manpower-plan-flow.service';
import type { QcReportRow } from '../types/manpower-planning';

/** Helpers cell shows at most this many helper names before the `+n` overflow rule. */
const MAX_VISIBLE_HELPERS = 2;

/** Same amber as ManpowerPlanTreeTable's selesaikan-leaf action button. */
const SELESAIKAN_BUTTON_CLASSNAME = 'bg-amber-400 text-slate-950 hover:bg-amber-500';

const { ACTIONS, TABLE } = MANPOWER_PLAN_LABELS.QC_PAGE;

/** `helpers` cell: at most MAX_VISIBLE_HELPERS names, then the `+n` overflow marker. */
function renderHelpers(helpers: string[]): string {
  const visible = helpers.slice(0, MAX_VISIBLE_HELPERS).join(', ');
  const overflowCount = helpers.length - MAX_VISIBLE_HELPERS;

  return overflowCount > 0
    ? `${visible} ${TABLE.MANPOWER_HELPERS_OVERFLOW(overflowCount)}`
    : visible;
}

function getRowId(originalRow: QcReportRow): string {
  return originalRow.id;
}

interface QcReportTableProps {
  rows: QcReportRow[];
  isLoading?: boolean;
  clearSelectionSignal?: number;
  onSelectedRowsChange: (rows: QcReportRow[]) => void;
  onClaim: (row: QcReportRow) => void;
  onReview: (row: QcReportRow) => void;
  onView: (row: QcReportRow) => void;
}

/**
 * FLAT QC report table — deliberately no `enableTreeView`/`getSubRows`/`expanded`: one report per
 * row, no hierarchy, so selection is a plain per-row checkbox over `isQcRowCheckable` rows with a
 * header select-all (no descendant cascade to think about).
 */
export function QcReportTable({
  rows,
  isLoading = false,
  clearSelectionSignal,
  onSelectedRowsChange,
  onClaim,
  onReview,
  onView,
}: QcReportTableProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Selections don't survive a different dataset (project switch / fresh fetch) — stale ids
  // wouldn't map to real report ids any more. Status rides in the key because a row's action set
  // changes with it. An empty key means "no data yet" — resetting then would wipe a selection
  // being built while rows are momentarily absent, so that case is skipped.
  const rowSelectionKey = useMemo(
    () => rows.map((row) => `${row.id}:${row.status}`).join('|'),
    [rows]
  );
  useEffect(() => {
    if (rowSelectionKey === '') return;
    setSelectedIds(new Set());
  }, [rowSelectionKey]);

  useEffect(() => {
    if (clearSelectionSignal === undefined) return;
    setSelectedIds(new Set());
  }, [clearSelectionSignal]);

  // Non-Waiting rows are never selectable — the bulk-assign flow targets unclaimed reports only.
  const checkableIds = useMemo(
    () => new Set(rows.filter(isQcRowCheckable).map((row) => row.id)),
    [rows]
  );

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
      setSelectedIds(checked ? new Set(checkableIds) : new Set<string>());
    },
    [checkableIds]
  );

  useEffect(() => {
    const selected = rows.filter((row) => selectedIds.has(row.id));
    onSelectedRowsChange(selected);
  }, [selectedIds, rows, onSelectedRowsChange]);

  const isAllSelected =
    checkableIds.size > 0 && [...checkableIds].every((id) => selectedIds.has(id));
  const isSomeSelected = selectedIds.size > 0 && !isAllSelected;

  const columns: ColumnDef<QcReportRow>[] = useMemo(
    () => [
      {
        id: '__select__',
        header: () => (
          <Checkbox
            checked={isAllSelected || (isSomeSelected && 'indeterminate')}
            onCheckedChange={(value) => toggleAll(!!value)}
            disabled={checkableIds.size === 0}
            aria-label={TABLE.SELECT_ALL}
          />
        ),
        // Only Waiting rows are claimable, so only they enter the selection — others render empty.
        cell: ({ row }) =>
          isQcRowCheckable(row.original) ? (
            <Checkbox
              checked={selectedIds.has(row.original.id)}
              onCheckedChange={(value) => toggleSelection(row.original.id, !!value)}
              aria-label={TABLE.SELECT_ROW}
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
        header: TABLE.KODE,
        accessorKey: 'code',
        enableSorting: false,
        enableHiding: false,
      },
      {
        id: 'jobItem',
        header: TABLE.JOB_ITEM,
        accessorKey: 'jobItem',
        enableSorting: false,
      },
      {
        id: 'manpower',
        header: TABLE.MANPOWER,
        cell: ({ row }) => {
          const { fullName, helpers } = row.original.manpower;

          return (
            <div className="flex flex-col">
              <span className="font-medium">{fullName}</span>
              {helpers.length > 0 && (
                <span className="text-xs text-muted-foreground">{renderHelpers(helpers)}</span>
              )}
            </div>
          );
        },
        enableSorting: false,
      },
      {
        id: 'status',
        header: TABLE.STATUS,
        cell: ({ row }) => (
          <Badge
            variant="secondary"
            className={cn(
              BADGE_CHROME.STATUS,
              MANPOWER_PLAN_LABELS.QC_PAGE.STATUS_BADGE_CLASSNAMES[row.original.status]
            )}
          >
            {row.original.status}
          </Badge>
        ),
        enableSorting: false,
      },
      {
        id: 'note',
        header: TABLE.CATATAN,
        cell: ({ row }) => (
          <span className="block max-w-[280px] truncate">{row.original.note ?? '-'}</span>
        ),
        enableSorting: false,
      },
      {
        id: 'assigneeQc',
        header: TABLE.ASSIGN_QC,
        cell: ({ row }) => <span>{row.original.assigneeQc ?? '-'}</span>,
        enableSorting: false,
      },
      {
        id: 'revisiCount',
        header: TABLE.REVISI,
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
        id: 'lastUpdate',
        header: TABLE.LAST_UPDATE,
        cell: ({ row }) =>
          row.original.lastUpdate ? (
            <span>{formatDate(row.original.lastUpdate)}</span>
          ) : (
            <span>-</span>
          ),
        enableSorting: false,
      },
      {
        id: 'actions',
        header: TABLE.ACTION,
        cell: ({ row }) => {
          const action = getQcRowAction(row.original);

          return (
            <div className="flex justify-end gap-2">
              {action === 'claim' && (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    aria-label={ACTIONS.CLAIM}
                    onClick={(e) => {
                      e.stopPropagation();
                      onClaim(row.original);
                    }}
                  >
                    {ACTIONS.CLAIM}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    aria-label={ACTIONS.LIHAT}
                    onClick={(e) => {
                      e.stopPropagation();
                      onView(row.original);
                    }}
                  >
                    {ACTIONS.LIHAT}
                  </Button>
                </>
              )}
              {action === 'review' && (
                <Button
                  type="button"
                  variant="default"
                  size="sm"
                  className={SELESAIKAN_BUTTON_CLASSNAME}
                  aria-label={ACTIONS.SELESAIKAN}
                  onClick={(e) => {
                    e.stopPropagation();
                    onReview(row.original);
                  }}
                >
                  {ACTIONS.SELESAIKAN}
                </Button>
              )}
              {action === 'view' && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  aria-label={ACTIONS.LIHAT}
                  onClick={(e) => {
                    e.stopPropagation();
                    onView(row.original);
                  }}
                >
                  {ACTIONS.LIHAT}
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
      checkableIds,
      toggleAll,
      toggleSelection,
      onClaim,
      onReview,
      onView,
    ]
  );

  return (
    <DataTable<QcReportRow, unknown>
      columns={columns}
      data={rows}
      isLoading={isLoading}
      getRowId={getRowId}
      enableColumnDnd={false}
      enableColumnResize={false}
      enablePagination={false}
      enableRangeSelection={false}
      enableZebraStripes={false}
      emptyMessage={TABLE.EMPTY}
      className="w-full"
    />
  );
}
