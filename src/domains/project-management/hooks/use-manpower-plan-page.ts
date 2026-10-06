'use client';

import { useCallback, useMemo, useState } from 'react';
import {
  filterManpowerTreeBySearch,
  filterManpowerTreeByStatus,
} from '../services/manpower-plan-flow.service';
import type { ManpowerPlanTreeItem } from '../types/manpower-planning';
import { useManpowerPlan } from './use-manpower-plan';

/**
 * Sentinel Select value for the "no status filter" option — Radix rejects an empty-string item
 * value, so the page maps it to the hook's `''` (filter off) state.
 */
export const MANPOWER_STATUS_FILTER_ALL_VALUE = 'all';

/** Leaf action emitted by ManpowerPlanTreeTable, mirrored here so the page stays declarative. */
export type ManpowerLeafRowAction = 'assign-leaf' | 'selesaikan-leaf' | 'view-leaf' | 'edit-leaf';

/** Leaf row action → dialog target factory (typed per action so the union stays exhaustively checked). */
const LEAF_TARGET_FACTORIES: Record<
  ManpowerLeafRowAction,
  (item: ManpowerPlanTreeItem) => ManpowerPlanDialogTarget
> = {
  'assign-leaf': (item) => ({ kind: 'leaf-assign', item }),
  'selesaikan-leaf': (item) => ({ kind: 'leaf-selesaikan', item }),
  'view-leaf': (item) => ({ kind: 'leaf-detail', item }),
  'edit-leaf': (item) => ({ kind: 'leaf-edit', item }),
};

/** Which page dialog is currently open — `null` means all dialogs are closed. */
export type ManpowerPlanDialogTarget =
  | { kind: 'parent-assign'; items: ManpowerPlanTreeItem[] }
  | { kind: 'parent-view'; item: ManpowerPlanTreeItem }
  | { kind: 'leaf-assign'; item: ManpowerPlanTreeItem }
  | { kind: 'leaf-selesaikan'; item: ManpowerPlanTreeItem }
  | { kind: 'leaf-detail'; item: ManpowerPlanTreeItem }
  | { kind: 'leaf-edit'; item: ManpowerPlanTreeItem };

/**
 * Page orchestration for the new Manpower Planning flow: search + status filter + row selection and
 * which dialog is open. Every callback is `useCallback`-stable (they are handed to
 * ManpowerPlanTreeTable, which emits selection from an effect — fresh identities would loop) and the
 * returned object itself is memoised (CLAUDE.md anti-pattern #3).
 */
export function useManpowerPlanPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState(''); // '' = no status filter
  const [selectedItems, setSelectedItems] = useState<ManpowerPlanTreeItem[]>([]);
  const [clearSelectionSignal, setClearSelectionSignal] = useState(0);
  const [dialogTarget, setDialogTarget] = useState<ManpowerPlanDialogTarget | null>(null);

  const { data, isLoading: isTreeLoading } = useManpowerPlan();

  const treeItems = useMemo(
    () =>
      filterManpowerTreeByStatus(
        filterManpowerTreeBySearch(data?.tree ?? [], search),
        statusFilter
      ),
    [data, search, statusFilter]
  );

  /** Selection is emitted from the table's effect — only swap state when the content changed. */
  const handleSelectedItemsChange = useCallback((items: ManpowerPlanTreeItem[]) => {
    setSelectedItems((prev) => (prev.length === items.length ? prev : items));
  }, []);

  /**
   * No argument opens the dialog over the checked parents ("Assign Terpilih"); a list opens it over
   * exactly that list — the parent row's "Assign" button passes `[item]` (plan: same dialog, 1 item).
   */
  const openParentAssign = useCallback(
    (items?: ManpowerPlanTreeItem[]) => {
      setDialogTarget({ kind: 'parent-assign', items: items ?? selectedItems });
    },
    [selectedItems]
  );

  const openParentView = useCallback((item: ManpowerPlanTreeItem) => {
    setDialogTarget({ kind: 'parent-view', item });
  }, []);

  const openLeafAction = useCallback(
    (item: ManpowerPlanTreeItem, action: ManpowerLeafRowAction) => {
      setDialogTarget(LEAF_TARGET_FACTORIES[action](item));
    },
    []
  );

  /** Removes one item from the open parent-assign dialog's list (functional update on the target). */
  const removeAssignItem = useCallback((id: string) => {
    setDialogTarget((prev) => {
      if (prev?.kind !== 'parent-assign') return prev;

      const items = prev.items.filter((item) => item.id !== id);
      return items.length === prev.items.length ? prev : { kind: 'parent-assign', items };
    });
  }, []);

  const closeDialogs = useCallback(() => setDialogTarget(null), []);

  /** Tells ManpowerPlanTreeTable to drop its checkboxes; the table then reports the empty selection. */
  const bumpClearSelection = useCallback(() => setClearSelectionSignal((count) => count + 1), []);

  return useMemo(
    () => ({
      search,
      setSearch,
      statusFilter,
      setStatusFilter,
      treeItems,
      isTreeLoading,
      selectedItems,
      handleSelectedItemsChange,
      clearSelectionSignal,
      dialogTarget,
      openParentAssign,
      openParentView,
      openLeafAction,
      removeAssignItem,
      closeDialogs,
      bumpClearSelection,
    }),
    // `setSearch`/`setStatusFilter` are useState setters — stable by contract, so not listed.
    [
      search,
      statusFilter,
      treeItems,
      isTreeLoading,
      selectedItems,
      handleSelectedItemsChange,
      clearSelectionSignal,
      dialogTarget,
      openParentAssign,
      openParentView,
      openLeafAction,
      removeAssignItem,
      closeDialogs,
      bumpClearSelection,
    ]
  );
}
