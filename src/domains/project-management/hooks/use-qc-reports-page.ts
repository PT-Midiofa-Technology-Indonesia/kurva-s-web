'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo, useState } from 'react';
import { useDebounce } from '@/shared/hooks/use-debounce';
import { getErrorMessage } from '@/shared/lib/api-error';
import { toast } from '@/shared/lib/toast';
import { MANPOWER_PLAN_LABELS } from '../constants/manpower-plan';
import type { QcReportRow, QcReportStatus } from '../types/manpower-planning';
import { useClaimQcReport } from './use-claim-qc-report';
import { MANPOWER_PLAN_QUERY_KEYS } from './use-manpower-plan';
import { useQcReports } from './use-qc-reports';

const { PER_PAGE: QC_PER_PAGE, TOASTS } = MANPOWER_PLAN_LABELS.QC_PAGE;

/** Delay (ms) between the last keystroke and the search reaching the server. */
const SEARCH_DEBOUNCE_MS = 400;

/**
 * Sentinel Select value for the "no status filter" option — Radix rejects an empty-string item
 * value, so the page maps it to the hook's `''` (filter off) state.
 */
export const QC_STATUS_FILTER_ALL_VALUE = 'all';

/** Which page dialog is currently open — `null` means all dialogs are closed. */
export type QcReportDialogTarget =
  | { kind: 'qc-assign'; rows: QcReportRow[] }
  | { kind: 'qc-review'; row: QcReportRow }
  | { kind: 'qc-detail'; row: QcReportRow };

/**
 * Page orchestration for the flat QC report flow: search + status filter, pagination, row selection
 * and which dialog is open. Every callback is `useCallback`-stable (they are handed to
 * QcReportTable, which emits selection from an effect — fresh identities would loop) and the
 * returned object itself is memoised (CLAUDE.md anti-pattern #3). Search (debounced), status and
 * page all reach the server as query params (`useQcReports({ page, perPage, search, status })`) —
 * the server filters and paginates; unlike `useManpowerPlanPage` no client-side filtering happens
 * here, and `rows` is exactly the page slice the server returned.
 */
export function useQcReportsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  // '' = no status filter (maps to `undefined` in the query params, i.e. the API returns every status).
  const [statusFilter, setStatusFilter] = useState<QcReportStatus | ''>('');
  const [page, setPage] = useState(1);
  const [selectedRows, setSelectedRows] = useState<QcReportRow[]>([]);
  const [clearSelectionSignal, setClearSelectionSignal] = useState(0);
  const [dialogTarget, setDialogTarget] = useState<QcReportDialogTarget | null>(null);

  const debouncedSearch = useDebounce(search, SEARCH_DEBOUNCE_MS);

  /**
   * A changed filter invalidates the current page — fall back to page 1 of the new result set.
   * React's "adjust state during render" pattern: comparing against the filters the page was last
   * rendered with (instead of an effect) resets `page` in the same commit as the filter change, so
   * the table never fetches the old page number against the new filter.
   */
  const [renderedFilters, setRenderedFilters] = useState({
    search: '',
    status: '' as QcReportStatus | '',
  });
  if (renderedFilters.search !== debouncedSearch || renderedFilters.status !== statusFilter) {
    setRenderedFilters({ search: debouncedSearch, status: statusFilter });
    setPage(1);
  }

  const { data, isLoading: isRowsLoading } = useQcReports({
    page,
    perPage: QC_PER_PAGE,
    search: debouncedSearch || undefined,
    status: statusFilter === '' ? undefined : statusFilter,
  });

  const { mutate: claimQcReport } = useClaimQcReport();

  /** Tells QcReportTable to drop its checkboxes; the table then reports the empty selection. */
  const bumpClearSelection = useCallback(() => setClearSelectionSignal((count) => count + 1), []);

  /**
   * Selection is emitted from the table's effect — only swap state when the content changed. The
   * table reports `rows ∩ selection`, so a filter that empties the table never emits phantom rows.
   */
  const handleSelectedRowsChange = useCallback((rows: QcReportRow[]) => {
    setSelectedRows((prev) => (prev.length === rows.length ? prev : rows));
  }, []);

  /**
   * Claim = self-assign the report to the current user; clears the checkboxes so the (now
   * non-Waiting, hence non-checkable) row leaves the selection with the refetch.
   */
  const handleClaim = useCallback(
    (row: QcReportRow) => {
      claimQcReport(row.id, {
        onSuccess: () => {
          toast.success({ title: TOASTS.CLAIM_SUCCESS });
          bumpClearSelection();
        },
        onError: (error) => {
          toast.error({ title: getErrorMessage(error) });
        },
      });
    },
    [claimQcReport, bumpClearSelection]
  );

  /** Opens the bulk dialog over the checked Waiting reports ("Assign Terpilih"). */
  const openQcAssign = useCallback(() => {
    setDialogTarget({ kind: 'qc-assign', rows: selectedRows });
  }, [selectedRows]);

  const openQcReview = useCallback((row: QcReportRow) => {
    setDialogTarget({ kind: 'qc-review', row });
  }, []);

  const openQcDetail = useCallback((row: QcReportRow) => {
    setDialogTarget({ kind: 'qc-detail', row });
  }, []);

  /**
   * Removes exactly one report from the open qc-assign dialog's list (functional update on the
   * target). The page maps each item's `id` to the report id, and the dialog emits it from the
   * remove button — so two Waiting reports sharing a `boqItemId` can be removed independently.
   */
  const removeAssignRow = useCallback((id: string) => {
    setDialogTarget((prev) => {
      if (prev?.kind !== 'qc-assign') return prev;

      const rows = prev.rows.filter((row) => row.id !== id);
      return rows.length === prev.rows.length ? prev : { kind: 'qc-assign', rows };
    });
  }, []);

  const closeDialogs = useCallback(() => setDialogTarget(null), []);

  /**
   * Runs when the qc-assign dialog finished a mutation. `useAssignQcReports` already invalidates
   * the manpower root itself, so this repeat is belt-and-braces — idempotent, and it keeps the QC
   * list refreshing even if the dialog ever submits through a different mutation again.
   */
  const handleAssignCompleted = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: MANPOWER_PLAN_QUERY_KEYS.all });
    bumpClearSelection();
    closeDialogs();
  }, [queryClient, bumpClearSelection, closeDialogs]);

  return useMemo(
    () => ({
      search,
      setSearch,
      statusFilter,
      setStatusFilter,
      page,
      setPage,
      rows: data?.rows ?? [],
      isRowsLoading,
      totalItems: data?.meta.total ?? 0,
      totalPages: data?.meta.lastPage ?? 1,
      currentPage: data?.meta.currentPage ?? 1,
      selectedRows,
      handleSelectedRowsChange,
      clearSelectionSignal,
      dialogTarget,
      openQcAssign,
      openQcReview,
      openQcDetail,
      handleClaim,
      removeAssignRow,
      closeDialogs,
      handleAssignCompleted,
      bumpClearSelection,
    }),
    // `setSearch`/`setStatusFilter`/`setPage` are useState setters — stable by contract, so not listed.
    [
      search,
      statusFilter,
      page,
      data,
      isRowsLoading,
      selectedRows,
      handleSelectedRowsChange,
      clearSelectionSignal,
      dialogTarget,
      openQcAssign,
      openQcReview,
      openQcDetail,
      handleClaim,
      removeAssignRow,
      closeDialogs,
      handleAssignCompleted,
      bumpClearSelection,
    ]
  );
}
