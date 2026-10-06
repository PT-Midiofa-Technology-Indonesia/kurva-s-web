'use client';

import { SearchIcon } from 'lucide-react';
import { useCallback, useMemo } from 'react';
import { InformasiProjectCard } from '@/domains/project-control/components/InformasiProjectCard';
import { Button } from '@/shared/components/ui/button';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/shared/components/ui/input-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import {
  AssignItemsDialog,
  AssignPekerjaanDialog,
  ManpowerPlanTreeTable,
  ParentTaskDetailDialog,
  SelesaikanPekerjaanDialog,
} from '../../components';
import { MANPOWER_PLAN_LABELS } from '../../constants/manpower-plan';
import { NEW_TASK_INFORMATION_CARD_LABELS } from '../../constants/manpower-planning';
import {
  MANPOWER_STATUS_FILTER_ALL_VALUE,
  useManpowerPlanPage,
  useManpowerProject,
  useParentTaskDetail,
} from '../../hooks';
import type { ManpowerPlanTreeItem } from '../../types/manpower-planning';

export function ManpowerPlanningPage() {
  const {
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
  } = useManpowerPlanPage();

  const { data: project } = useManpowerProject();

  // ─── Row-action routing (page owns which dialog opens) ────────────────────────

  const handleParentAction = useCallback(
    (item: ManpowerPlanTreeItem, action: 'assign-parent' | 'view-parent') => {
      if (action === 'assign-parent') {
        // Plan rule: the parent row's Assign opens the same bulk dialog over exactly that row.
        openParentAssign([item]);
        return;
      }
      openParentView(item);
    },
    [openParentAssign, openParentView]
  );

  const handleLeafAction = useCallback(
    (
      item: ManpowerPlanTreeItem,
      action: 'assign-leaf' | 'selesaikan-leaf' | 'view-leaf' | 'edit-leaf'
    ) => {
      openLeafAction(item, action);
    },
    [openLeafAction]
  );

  /** Parent bulk/single assign closes + clears the table checkboxes; leaf dialogs clear on their own. */
  const handleParentAssigned = useCallback(() => {
    bumpClearSelection();
    closeDialogs();
  }, [bumpClearSelection, closeDialogs]);

  // ─── Derived dialog props ─────────────────────────────────────────────────────

  const isParentAssignOpen = dialogTarget?.kind === 'parent-assign';
  const assignItems = useMemo(
    () =>
      dialogTarget?.kind === 'parent-assign'
        ? dialogTarget.items.map((item) => ({
            boqItemId: item.id,
            boqCode: item.code,
            title: item.name,
          }))
        : [],
    [dialogTarget]
  );

  const parentViewItem = dialogTarget?.kind === 'parent-view' ? dialogTarget.item : null;

  // Disabled while null, so the parent detail is fetched only while the "Lihat" dialog is open.
  const { data: parentDetail } = useParentTaskDetail(parentViewItem?.id ?? null);

  const leafAssignItem =
    dialogTarget?.kind === 'leaf-assign' || dialogTarget?.kind === 'leaf-edit'
      ? dialogTarget.item
      : null;
  const isLeafEditMode = dialogTarget?.kind === 'leaf-edit';

  const isSelesaikanOpen =
    dialogTarget?.kind === 'leaf-selesaikan' || dialogTarget?.kind === 'leaf-detail';
  const selesaikanItem = isSelesaikanOpen ? dialogTarget.item : null;
  const selesaikanMode = dialogTarget?.kind === 'leaf-detail' ? 'detail' : 'selesaikan';

  return (
    <div className="flex min-h-[calc(100vh-3rem)] flex-col bg-white">
      {/* Informasi Project */}
      <div className="px-6 pb-7 pt-4">
        {project && (
          <InformasiProjectCard
            project={project}
            labels={NEW_TASK_INFORMATION_CARD_LABELS}
            hideEstimatedValue
          />
        )}
      </div>

      {/* Detail Item Project Section */}
      <div className="mx-6 mb-8 flex flex-1 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-200 p-6 md:flex-row md:items-center md:justify-between">
          <h2 className="text-base font-semibold text-slate-950">
            {MANPOWER_PLAN_LABELS.PAGE.DETAIL_CARD_TITLE}
          </h2>
          <div className="flex flex-col gap-4 sm:flex-row">
            <InputGroup className="h-10 w-full max-w-72.5 rounded-lg border-slate-300 bg-white shadow-xs">
              <InputGroupAddon>
                <SearchIcon />
              </InputGroupAddon>
              <InputGroupInput
                placeholder={MANPOWER_PLAN_LABELS.TABLE.SEARCH_PLACEHOLDER}
                className="text-sm"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </InputGroup>
            <Select
              value={statusFilter === '' ? MANPOWER_STATUS_FILTER_ALL_VALUE : statusFilter}
              onValueChange={(value) =>
                setStatusFilter(value === MANPOWER_STATUS_FILTER_ALL_VALUE ? '' : value)
              }
            >
              <SelectTrigger className="h-10 w-full max-w-45 rounded-lg border-slate-300 bg-white shadow-xs sm:w-45">
                <SelectValue placeholder={MANPOWER_PLAN_LABELS.TABLE.STATUS_FILTER_ALL} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={MANPOWER_STATUS_FILTER_ALL_VALUE}>
                  {MANPOWER_PLAN_LABELS.TABLE.STATUS_FILTER_ALL}
                </SelectItem>
                {MANPOWER_PLAN_LABELS.PAGE.STATUS_FILTER_OPTIONS.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              type="button"
              className="h-10 self-start bg-teal-600 px-4 text-white hover:bg-teal-700 sm:self-auto"
              disabled={selectedItems.length === 0}
              onClick={() => openParentAssign()}
            >
              {MANPOWER_PLAN_LABELS.TABLE.ASSIGN_TERPILIH}
            </Button>
          </div>
        </div>

        {/* Hierarchical Table */}
        <div className="flex-1 p-6">
          <ManpowerPlanTreeTable
            items={treeItems}
            search={search}
            isLoading={isTreeLoading}
            clearSelectionSignal={clearSelectionSignal}
            onSelectedItemsChange={handleSelectedItemsChange}
            onParentAction={handleParentAction}
            onLeafAction={handleLeafAction}
          />
        </div>
      </div>

      {/* Dialogs — every one is closed while `dialogTarget` is null */}
      <AssignItemsDialog
        open={isParentAssignOpen}
        onOpenChange={(open) => {
          if (!open) closeDialogs();
        }}
        items={assignItems}
        onRemoveItem={removeAssignItem}
        onAssigned={handleParentAssigned}
      />

      <ParentTaskDetailDialog
        open={dialogTarget?.kind === 'parent-view'}
        onOpenChange={(open) => {
          if (!open) closeDialogs();
        }}
        item={parentViewItem}
        detail={parentDetail ?? null}
      />

      <AssignPekerjaanDialog
        open={dialogTarget?.kind === 'leaf-assign' || dialogTarget?.kind === 'leaf-edit'}
        onOpenChange={(open) => {
          if (!open) closeDialogs();
        }}
        item={leafAssignItem}
        mode={isLeafEditMode ? 'edit' : 'assign'}
        onAssigned={bumpClearSelection}
      />

      <SelesaikanPekerjaanDialog
        open={isSelesaikanOpen}
        onOpenChange={(open) => {
          if (!open) closeDialogs();
        }}
        item={selesaikanItem}
        mode={selesaikanMode}
        onCompleted={bumpClearSelection}
      />
    </div>
  );
}
