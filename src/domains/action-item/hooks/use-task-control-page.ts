'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useMeetings } from '@/domains/mom/hooks/use-meetings';
import {
  buildDescendantIdMap,
  getCascadeSelectionIds,
  getSelectableIds,
} from '../services/task-selection';
import { buildTaskTree } from '../services/task-tree';
import type { MeetingTaskApiStatus } from '../types/api';
import { useMeetingTasks } from './use-meeting-tasks';

export interface TaskControlPageParams {
  companyId: string;
  momId?: string;
  status?: MeetingTaskApiStatus;
  search?: string;
  page: number;
  perPage: number;
}

export interface UseTaskControlPageOptions {
  params: TaskControlPageParams;
  onSetQueryParams?: (params: Record<string, string | number | undefined>) => void;
}

export function useTaskControlPage({ params, onSetQueryParams }: UseTaskControlPageOptions) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const meetingsQuery = useMeetings({
    companyId: params.companyId,
    perPage: 100,
  });

  const momOptions = useMemo(
    () => (meetingsQuery.data?.rows ?? []).map((row) => ({ value: row.id, label: row.title })),
    [meetingsQuery.data?.rows]
  );

  const selectedMomTitle = useMemo(
    () => momOptions.find((option) => option.value === params.momId)?.label ?? '-',
    [momOptions, params.momId]
  );

  const tasksQuery = useMeetingTasks({
    companyId: params.companyId,
    meetingId: params.momId ?? '',
    status: params.status,
    search: params.search || undefined,
    page: params.page,
    perPage: params.perPage,
  });

  // The API returns a FLAT page of tasks; the hierarchy is encoded in `code`
  // ("A.1" is a sub-task of "A"). The tree is used for cascade selection while
  // the flat list remains the source for delegate payload rows.
  const flatRows = useMemo(() => tasksQuery.data?.rows ?? [], [tasksQuery.data?.rows]);
  const rows = useMemo(() => buildTaskTree(flatRows), [flatRows]);
  const totalItems = tasksQuery.data?.meta.total ?? 0;
  const totalPages = Math.max(1, tasksQuery.data?.meta.lastPage ?? 1);

  const selectableIds = useMemo(() => getSelectableIds(rows), [rows]);

  // Ids on the CURRENT page only — the single source of truth for both the
  // header checkbox's displayed state and what toggleAll actually selects, so
  // "select all" never reaches rows the user cannot see or delegate.
  const pageSelectableIds = useMemo(
    () => flatRows.filter((row) => selectableIds.has(row.id)).map((row) => row.id),
    [flatRows, selectableIds]
  );

  const descendantIdsById = useMemo(() => buildDescendantIdMap(rows), [rows]);

  const codesById = useMemo(() => new Map(flatRows.map((row) => [row.id, row.code])), [flatRows]);

  // Reset selection whenever the visible MoM changes so stale ids never leak
  // into the Delegate dialog.
  // biome-ignore lint/correctness/useExhaustiveDependencies: only momId identifies a "new list"
  useEffect(() => {
    setSelectedIds(new Set());
  }, [params.momId]);

  const toggleSelection = useCallback(
    (id: string, checked: boolean) => {
      const cascadeIds = getCascadeSelectionIds(id, descendantIdsById, selectableIds);

      setSelectedIds((prev) => {
        const next = new Set(prev);
        for (const currentId of cascadeIds) {
          if (checked) next.add(currentId);
          else next.delete(currentId);
        }
        return next;
      });
    },
    [descendantIdsById, selectableIds]
  );

  const toggleAll = useCallback(
    (checked: boolean) => {
      setSelectedIds(checked ? new Set(pageSelectableIds) : new Set());
    },
    [pageSelectableIds]
  );

  const clearSelection = useCallback(() => setSelectedIds(new Set()), []);

  const selectedTasks = useMemo(
    () => flatRows.filter((row) => selectableIds.has(row.id) && selectedIds.has(row.id)),
    [flatRows, selectableIds, selectedIds]
  );

  const handleMomChange = useCallback(
    (value: string | string[] | null | undefined) => {
      const id = Array.isArray(value) ? value[0] : value;
      onSetQueryParams?.({ momId: id || undefined, page: 1 });
    },
    [onSetQueryParams]
  );

  const handleStatusChange = useCallback(
    (value: string | string[] | null | undefined) => {
      const status = Array.isArray(value) ? value[0] : value;
      onSetQueryParams?.({ status: status || undefined, page: 1 });
    },
    [onSetQueryParams]
  );

  const handleSearchChange = useCallback(
    (value: string | undefined) => {
      onSetQueryParams?.({ search: value, page: 1 });
    },
    [onSetQueryParams]
  );

  const handlePaginationChange = useCallback(
    (page: number, perPage: number) => {
      onSetQueryParams?.({ page, perPage });
    },
    [onSetQueryParams]
  );

  return {
    momOptions,
    isMomLoading: meetingsQuery.isLoading,
    selectedMomTitle,
    rows,
    isLoading: tasksQuery.isLoading,
    totalItems,
    totalPages,
    pageSelectableIds,
    codesById,
    selectedIds,
    toggleSelection,
    toggleAll,
    clearSelection,
    selectedTasks,
    handleMomChange,
    handleStatusChange,
    handleSearchChange,
    handlePaginationChange,
  };
}
