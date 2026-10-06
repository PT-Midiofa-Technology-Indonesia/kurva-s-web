'use client';

import { SearchIcon } from 'lucide-react';
import { useCallback, useMemo } from 'react';
import { DataTablePagination } from '@/components/molecules';
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
import { AssignItemsDialog, QcReportTable, QcReviewDialog } from '../../components';
import { MANPOWER_PLAN_LABELS } from '../../constants/manpower-plan';
import { NEW_TASK_INFORMATION_CARD_LABELS } from '../../constants/manpower-planning';
import { QC_STATUS_FILTER_ALL_VALUE, useManpowerProject, useQcReportsPage } from '../../hooks';
import type { QcReportStatus } from '../../types/manpower-planning';

const { PAGE, TABLE, PER_PAGE: QC_PER_PAGE } = MANPOWER_PLAN_LABELS.QC_PAGE;

/**
 * The molecule's per-page selector is required but the QC list fixes its page size — wire a no-op
 * so the Select renders disabled-by-behaviour (choosing a size never changes the request).
 */
const handlePageSizeChange = () => undefined;

export function QualityControlPage() {
  const {
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    rows,
    isRowsLoading,
    totalItems,
    totalPages,
    currentPage,
    setPage,
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
  } = useQcReportsPage();

  // InformasiProjectCard slice of the manpower planning list — same query key as the tree.
  const { data: project } = useManpowerProject();

  // ─── Row-action routing (page owns which dialog opens) ────────────────────────

  /**
   * The review dialog's decision already invalidates the manpower namespace (useSubmitQcReview), so
   * completing it only needs to close the dialogs and clear the table checkboxes. The assign dialog
   * gets `handleAssignCompleted` from the hook instead — its QC mutation invalidates the report list
   * only through this page-side belt-and-braces call, on top of the hook's root invalidation.
   */
  const handleDialogCompleted = useCallback(() => {
    bumpClearSelection();
    closeDialogs();
  }, [bumpClearSelection, closeDialogs]);

  // ─── Derived dialog props ─────────────────────────────────────────────────────

  const isQcAssignOpen = dialogTarget?.kind === 'qc-assign';
  const assignItems = useMemo(
    () =>
      dialogTarget?.kind === 'qc-assign'
        ? dialogTarget.rows.map((row) => ({
            id: row.id,
            boqItemId: row.boqItemId,
            boqCode: row.code,
            title: row.jobItem,
            taskId: row.id, // the report id doubles as the QC task id
            subtitle: TABLE.ASSIGN_ITEM_SUBTITLE(row.manpower.fullName, row.reportSummary),
          }))
        : [],
    [dialogTarget]
  );

  const isQcDetailOpen = dialogTarget?.kind === 'qc-detail';
  const isQcReviewOpen = dialogTarget?.kind === 'qc-review';
  const reviewRow =
    dialogTarget?.kind === 'qc-review' || dialogTarget?.kind === 'qc-detail'
      ? dialogTarget.row
      : null;

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
          <h2 className="text-base font-semibold text-slate-950">{PAGE.DETAIL_CARD_TITLE}</h2>
          <div className="flex flex-col gap-4 sm:flex-row">
            <InputGroup className="h-10 w-full max-w-72.5 rounded-lg border-slate-300 bg-white shadow-xs">
              <InputGroupAddon>
                <SearchIcon />
              </InputGroupAddon>
              <InputGroupInput
                placeholder={TABLE.SEARCH_PLACEHOLDER}
                className="text-sm"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </InputGroup>
            <Select
              value={statusFilter === '' ? QC_STATUS_FILTER_ALL_VALUE : statusFilter}
              onValueChange={(value) =>
                // Radix emits untyped strings — the Select's items only ever offer QC statuses.
                setStatusFilter(
                  value === QC_STATUS_FILTER_ALL_VALUE ? '' : (value as QcReportStatus)
                )
              }
            >
              <SelectTrigger className="h-10 w-full max-w-45 rounded-lg border-slate-300 bg-white shadow-xs sm:w-45">
                <SelectValue placeholder={TABLE.STATUS_FILTER_ALL} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={QC_STATUS_FILTER_ALL_VALUE}>
                  {TABLE.STATUS_FILTER_ALL}
                </SelectItem>
                {PAGE.STATUS_FILTER_OPTIONS.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              type="button"
              className="h-10 self-start bg-teal-600 px-4 text-white hover:bg-teal-700 sm:self-auto"
              disabled={selectedRows.length === 0}
              onClick={openQcAssign}
            >
              {TABLE.ASSIGN_TERPILIH}
            </Button>
          </div>
        </div>

        {/* Flat QC report table */}
        <div className="flex-1 p-6">
          <QcReportTable
            rows={rows}
            isLoading={isRowsLoading}
            clearSelectionSignal={clearSelectionSignal}
            onSelectedRowsChange={handleSelectedRowsChange}
            onClaim={handleClaim}
            onReview={openQcReview}
            onView={openQcDetail}
          />
          <DataTablePagination
            currentPage={currentPage}
            totalPages={totalPages}
            pageSize={QC_PER_PAGE}
            pageSizeOptions={[QC_PER_PAGE]}
            totalItems={totalItems}
            onPageChange={setPage}
            onPageSizeChange={handlePageSizeChange}
          />
        </div>
      </div>

      {/* Dialogs — every one is closed while `dialogTarget` is null */}
      <AssignItemsDialog
        open={isQcAssignOpen}
        onOpenChange={(open) => {
          if (!open) closeDialogs();
        }}
        items={assignItems}
        onRemoveItem={removeAssignRow}
        taskCategory="qc"
        onAssigned={handleAssignCompleted}
      />

      <QcReviewDialog
        open={isQcReviewOpen || isQcDetailOpen}
        onOpenChange={(open) => {
          if (!open) closeDialogs();
        }}
        row={reviewRow}
        mode={isQcDetailOpen ? 'detail' : 'review'}
        onDecided={handleDialogCompleted}
      />
    </div>
  );
}
