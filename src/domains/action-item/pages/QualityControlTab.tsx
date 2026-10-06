'use client';

import { SearchIcon } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useEmployeesInfinite } from '@/domains/manpower';
import { useDebounce } from '@/hooks/use-debounce';
import { useQueryParams } from '@/hooks/use-query-params';
import { AsyncSelect } from '@/shared/components/atoms';
import { DataTablePagination } from '@/shared/components/molecules';
import { Button } from '@/shared/components/ui/button';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/shared/components/ui/input-group';
import type { BaseQueryParams } from '@/types/query-params';
import { ActionItemQcReviewDialog } from '../components/ActionItemQcReviewDialog';
import { ActionItemQcTable } from '../components/ActionItemQcTable';
import { DelegateActionItemsDialog } from '../components/DelegateActionItemsDialog';
import {
  ACTION_ITEM_LABELS,
  MEETING_TASK_STATUS_OPTIONS,
  QC_DECISION_OPTIONS,
  resolveMeetingTaskStatus,
  resolveQcDecision,
} from '../constants';
import { useDelegateMeetingTasks } from '../hooks/use-delegate-meeting-tasks';
import { useQualityControlPage } from '../hooks/use-quality-control-page';
import { useReviewQcTask } from '../hooks/use-review-qc-task';

const labels = ACTION_ITEM_LABELS.QUALITY_CONTROL;

interface QualityControlUrlParams extends BaseQueryParams {
  momId?: string;
  status?: string;
  qcDecision?: string;
}

interface QualityControlTabProps {
  companyId: string;
}

export function QualityControlTab({ companyId }: QualityControlTabProps) {
  const { queryParams, setQueryParams } = useQueryParams<QualityControlUrlParams>();
  const currentParams = queryParams;
  const [detailTaskId, setDetailTaskId] = useState<string | null>(null);
  const [isDelegateOpen, setIsDelegateOpen] = useState(false);
  const [searchInput, setSearchInput] = useState(currentParams.search ?? '');
  const debouncedSearch = useDebounce(searchInput, 300);
  const prevDebouncedSearch = useRef(debouncedSearch);

  // The shared Delegate dialog uses a plain (non-searchable) Select, so the
  // employee list is fetched in one large page rather than search-as-you-type.
  const employees = useEmployeesInfinite({ companyId, perPage: 100 });
  const delegateMutation = useDelegateMeetingTasks();
  const reviewMutation = useReviewQcTask();

  const params = useMemo(
    () => ({
      companyId,
      momId: currentParams.momId,
      status: resolveMeetingTaskStatus(currentParams.status),
      qcDecision: resolveQcDecision(currentParams.qcDecision),
      search: currentParams.search,
      page: Number(currentParams.page ?? 1),
      perPage: Number(currentParams.perPage ?? 8),
    }),
    [companyId, currentParams]
  );

  const pageOptions = useMemo(
    () => ({ params, onSetQueryParams: setQueryParams }),
    [params, setQueryParams]
  );

  const {
    momOptions,
    isMomLoading,
    selectedMomTitle,
    rows,
    isLoading,
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
    handleDecisionChange,
    handleSearchChange,
    handlePaginationChange,
  } = useQualityControlPage(pageOptions);

  // The Delegate dialog takes EmployeeOption[] ({ id, name }); the shared
  // infinite hook yields SelectOption[] ({ value, label }).
  const employeeOptions = useMemo(
    () => employees.options.map((option) => ({ id: option.value, name: option.label })),
    [employees.options]
  );

  useEffect(() => {
    if (debouncedSearch !== prevDebouncedSearch.current) {
      prevDebouncedSearch.current = debouncedSearch;
      handleSearchChange(debouncedSearch || undefined);
    }
  }, [debouncedSearch, handleSearchChange]);

  const momSelect = (className: string) => (
    <AsyncSelect
      className={className}
      options={momOptions}
      isLoading={isMomLoading}
      value={params.momId}
      placeholder={labels.MOM_PLACEHOLDER}
      isSearchable={false}
      isClearable={false}
      onChange={handleMomChange}
    />
  );

  return (
    <div className="flex flex-col gap-4">
      {params.momId && (
        <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-6 md:flex-row md:items-center md:justify-between">
          <InputGroup className="h-10 w-full max-w-72.5 rounded-lg border-slate-300 bg-white shadow-xs">
            <InputGroupAddon>
              <SearchIcon />
            </InputGroupAddon>
            <InputGroupInput
              placeholder={labels.SEARCH_PLACEHOLDER}
              className="text-sm"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </InputGroup>

          <div className="flex flex-wrap items-center gap-3">
            {momSelect('w-56')}
            <AsyncSelect
              className="w-44"
              options={MEETING_TASK_STATUS_OPTIONS}
              value={params.status}
              placeholder={labels.STATUS_PLACEHOLDER}
              isSearchable={false}
              isClearable
              onChange={handleStatusChange}
            />
            <AsyncSelect
              className="w-36"
              options={QC_DECISION_OPTIONS}
              value={params.qcDecision}
              placeholder={labels.DECISION_PLACEHOLDER}
              isSearchable={false}
              isClearable
              onChange={handleDecisionChange}
            />
            <Button
              type="button"
              className="h-10 bg-teal-600 px-4 text-white hover:bg-teal-700"
              disabled={selectedTasks.length === 0}
              onClick={() => setIsDelegateOpen(true)}
            >
              {labels.DELEGATE_BUTTON}
            </Button>
          </div>
        </div>
      )}

      {!params.momId ? (
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          {momSelect('w-56 mb-4 ml-auto')}
          <div className="flex items-center justify-center rounded-lg border border-slate-200 py-16 text-sm font-medium text-slate-950">
            {labels.EMPTY_MOM_DESCRIPTION}
          </div>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="p-6">
            <ActionItemQcTable
              rows={rows}
              isLoading={isLoading}
              selectedIds={selectedIds}
              onToggleSelection={toggleSelection}
              onToggleAll={toggleAll}
              pageSelectableIds={pageSelectableIds}
              onOpenDetail={(row) => setDetailTaskId(row.id)}
            />
          </div>
          <DataTablePagination
            currentPage={params.page}
            totalPages={totalPages}
            pageSize={params.perPage}
            totalItems={totalItems}
            pageSizeOptions={[8, 20, 30, 50]}
            onPageChange={(page) => handlePaginationChange(page, params.perPage)}
            onPageSizeChange={(size) => handlePaginationChange(1, size)}
          />
        </div>
      )}

      <DelegateActionItemsDialog
        open={isDelegateOpen}
        onOpenChange={setIsDelegateOpen}
        tasks={selectedTasks}
        codesById={codesById}
        employees={employeeOptions}
        onDelegate={(employee) => {
          delegateMutation.mutate(
            {
              ids: selectedTasks.map((task) => task.id),
              employeeId: employee.id,
              companyId,
            },
            { onSuccess: () => clearSelection() }
          );
        }}
      />

      <ActionItemQcReviewDialog
        open={detailTaskId != null}
        onOpenChange={(open) => {
          if (!open) setDetailTaskId(null);
        }}
        taskId={detailTaskId}
        companyId={companyId}
        momTitle={selectedMomTitle}
        isSubmitting={reviewMutation.isPending}
        onSubmitDecision={(taskId, decision, note, files) => {
          reviewMutation.mutate(
            { id: taskId, companyId, qcDecision: decision, qcNote: note, files },
            { onSuccess: () => setDetailTaskId(null) }
          );
        }}
      />
    </div>
  );
}
