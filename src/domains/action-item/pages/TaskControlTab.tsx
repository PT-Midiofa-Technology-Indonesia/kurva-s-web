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
import { ActionItemTaskDetailDialog } from '../components/ActionItemTaskDetailDialog';
import { ActionItemTaskTable } from '../components/ActionItemTaskTable';
import { DelegateActionItemsDialog } from '../components/DelegateActionItemsDialog';
import {
  ACTION_ITEM_LABELS,
  MEETING_TASK_STATUS_OPTIONS,
  resolveMeetingTaskStatus,
} from '../constants';
import { useCancelMeetingTask } from '../hooks/use-cancel-meeting-task';
import { useDelegateMeetingTasks } from '../hooks/use-delegate-meeting-tasks';
import { useDoneMeetingTask } from '../hooks/use-done-meeting-task';
import { useTaskControlPage } from '../hooks/use-task-control-page';

const labels = ACTION_ITEM_LABELS.TASK_CONTROL;

interface TaskControlUrlParams extends BaseQueryParams {
  momId?: string;
  status?: string;
}

interface TaskControlTabProps {
  companyId: string;
}

export function TaskControlTab({ companyId }: TaskControlTabProps) {
  const { queryParams, setQueryParams } = useQueryParams<TaskControlUrlParams>();
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
  const doneMutation = useDoneMeetingTask();
  const cancelMutation = useCancelMeetingTask();

  const params = useMemo(
    () => ({
      companyId,
      momId: currentParams.momId,
      status: resolveMeetingTaskStatus(currentParams.status),
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
    handleSearchChange,
    handlePaginationChange,
  } = useTaskControlPage(pageOptions);

  // The Delegate dialog takes EmployeeOption[] ({ id, name }); the shared
  // infinite hook yields SelectOption[] ({ value, label }).
  const employeeOptions = useMemo(
    () => employees.options.map((option) => ({ id: option.value, name: option.label })),
    [employees.options]
  );

  // Debounce URL writes: only push the search query param after the user
  // pauses typing, instead of on every keystroke.
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
            <ActionItemTaskTable
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

      <ActionItemTaskDetailDialog
        open={detailTaskId != null}
        onOpenChange={(open) => {
          if (!open) setDetailTaskId(null);
        }}
        taskId={detailTaskId}
        companyId={companyId}
        momTitle={selectedMomTitle}
        isSubmitting={doneMutation.isPending}
        isCancelling={cancelMutation.isPending}
        onCompleteTask={(taskId, files) => {
          doneMutation.mutate(
            { id: taskId, companyId, files },
            { onSuccess: () => setDetailTaskId(null) }
          );
        }}
        onCancelTask={(taskId, reason, files) => {
          cancelMutation.mutate(
            { id: taskId, companyId, reason, files },
            { onSuccess: () => setDetailTaskId(null) }
          );
        }}
      />
    </div>
  );
}
