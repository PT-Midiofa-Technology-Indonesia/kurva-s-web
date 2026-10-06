'use client';

import { X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useSubordinateEmployees } from '@/domains/project-control';
import { getErrorMessage } from '@/shared/lib/api-error';
import { toast } from '@/shared/lib/toast';
import { MANPOWER_PLAN_LABELS } from '../constants/manpower-plan';
import { useAssignParentItems, useAssignQcReports } from '../hooks';
import type { ProjectTaskCategory } from '../types/manpower-planning';
import type { DelegateTaskListItem } from './DelegateSelectedTasksDialog';

/**
 * Delegate list item plus the optional QC-context second line rendered under the title. `id` is a
 * stable row identity for the remove button — the QC page passes the report id (two reports can
 * share a `boqItemId`), while the manpower page omits it and falls back to `boqItemId`.
 */
export type AssignItemListItem = DelegateTaskListItem & { id?: string; subtitle?: string };

interface AssignItemsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: AssignItemListItem[];
  /** Deselects the item upstream so it leaves the selection (and this list). */
  onRemoveItem: (id: string) => void;
  /** `qc` submits through the real QC delegate endpoint and scopes the employee list to QC manpower. */
  taskCategory?: ProjectTaskCategory;
  onAssigned?: () => void;
}

export function AssignItemsDialog({
  open,
  onOpenChange,
  items,
  onRemoveItem,
  taskCategory = 'control',
  onAssigned,
}: AssignItemsDialogProps) {
  const isQc = taskCategory === 'qc';
  const [employeeId, setEmployeeId] = useState('');
  // Sent with the delegate payload; an empty note is dropped (`null` on the wire).
  const [note, setNote] = useState('');
  // Scope the subordinate-employee list to the task category the page is on
  // (work vs qc), matching the `taskCategory` query param on the BOQ endpoint.
  const { data: employees, isLoading: isLoadingEmployees } = useSubordinateEmployees(
    isQc ? 'qc' : 'work'
  );
  // Both branches post to real endpoints: the work branch to `project-tasks/delegate/non-final`,
  // the QC branch to `quality-control/delegate`.
  const { mutate: assignParentItems, isPending: isSubmittingWork } = useAssignParentItems();
  const { mutate: assignQcTasks, isPending: isSubmittingQc } = useAssignQcReports();
  const isSubmitting = isQc ? isSubmittingQc : isSubmittingWork;

  useEffect(() => {
    if (!open) return;
    setEmployeeId('');
    setNote('');
  }, [open]);

  const handleSubmit = () => {
    if (!employeeId || items.length === 0) return;

    const onSuccess = () => {
      toast.success({
        title: isQc
          ? MANPOWER_PLAN_LABELS.QC_PAGE.TOASTS.ASSIGN_SUCCESS
          : MANPOWER_PLAN_LABELS.ASSIGN_ITEMS.SUCCESS_TOAST,
      });
      onOpenChange(false);
      onAssigned?.();
    };
    const onError = (error: unknown) => {
      toast.error({ title: getErrorMessage(error) });
    };

    if (isQc) {
      const missingTaskItem = items.find((item) => !item.taskId);
      if (missingTaskItem) {
        toast.error({
          title: MANPOWER_PLAN_LABELS.ASSIGN_ITEMS.QC_TASK_UNAVAILABLE(missingTaskItem.title),
        });
        return;
      }

      assignQcTasks(
        {
          projectTaskIds: items.map((item) => item.taskId!),
          employeeId,
          note: note.trim() || undefined,
        },
        { onSuccess, onError }
      );
      return;
    }

    assignParentItems(
      {
        boqItemIds: items.map((item) => item.boqItemId),
        employeeId,
        note: note.trim() || undefined,
      },
      { onSuccess, onError }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] w-full max-w-md flex-col gap-0 overflow-hidden p-0 sm:max-w-md">
        <DialogHeader className="shrink-0 gap-1 border-b border-slate-200 p-5 pt-8">
          <DialogTitle className="text-lg leading-none font-semibold text-slate-950">
            {MANPOWER_PLAN_LABELS.ASSIGN_ITEMS.TITLE(items.length)}
          </DialogTitle>
          <p className="text-sm text-slate-600">
            {MANPOWER_PLAN_LABELS.ASSIGN_ITEMS.SELECTED_COUNT(items.length)}
          </p>
        </DialogHeader>

        <div className="flex-1 space-y-4 overflow-y-auto p-5">
          <div className="space-y-2">
            {items.map((item) => (
              <div
                key={item.id ?? item.boqItemId}
                className="flex items-center gap-2 rounded-xl border border-slate-200 p-3"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="secondary"
                      className="w-fit shrink-0 rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700"
                    >
                      {item.boqCode}
                    </Badge>
                    <span className="truncate text-sm text-slate-950">{item.title}</span>
                  </div>
                  {item.subtitle && (
                    <p className="truncate text-xs text-slate-500">{item.subtitle}</p>
                  )}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="shrink-0 text-slate-400 hover:text-slate-950"
                  aria-label={MANPOWER_PLAN_LABELS.ASSIGN_ITEMS.REMOVE_ITEM}
                  disabled={isSubmitting}
                  onClick={() => onRemoveItem(item.id ?? item.boqItemId)}
                >
                  <X />
                </Button>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <Label htmlFor="assign-employee" className="text-sm leading-none font-medium">
              {MANPOWER_PLAN_LABELS.ASSIGN_ITEMS.EMPLOYEE_LABEL}{' '}
              <span className="text-teal-600">
                {MANPOWER_PLAN_LABELS.ASSIGN_ITEMS.REQUIRED_MARK}
              </span>
            </Label>
            <Select
              value={employeeId}
              onValueChange={setEmployeeId}
              disabled={isLoadingEmployees || isSubmitting}
            >
              <SelectTrigger
                id="assign-employee"
                className="h-11! w-full rounded-xl bg-white text-sm"
              >
                <SelectValue
                  placeholder={
                    isLoadingEmployees
                      ? MANPOWER_PLAN_LABELS.ASSIGN_ITEMS.EMPLOYEE_LOADING_PLACEHOLDER
                      : MANPOWER_PLAN_LABELS.ASSIGN_ITEMS.EMPLOYEE_PLACEHOLDER
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {(employees ?? []).map((employee) => (
                  <SelectItem key={employee.id} value={employee.id}>
                    {employee.fullName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="assign-note" className="text-sm leading-none font-medium">
              {MANPOWER_PLAN_LABELS.ASSIGN_ITEMS.NOTE_LABEL}
            </Label>
            <Textarea
              id="assign-note"
              value={note}
              onChange={(event) => setNote(event.target.value)}
              disabled={isSubmitting}
              placeholder={MANPOWER_PLAN_LABELS.ASSIGN_ITEMS.NOTE_PLACEHOLDER}
              className="min-h-24 rounded-xl border-slate-300 px-4 py-3 text-sm"
            />
          </div>
        </div>

        <div className="grid shrink-0 grid-cols-2 gap-4 border-t border-slate-200 p-5">
          <Button
            type="button"
            variant="outline"
            className="h-11 rounded-xl border-slate-300 text-sm"
            disabled={isSubmitting}
            onClick={() => onOpenChange(false)}
          >
            {MANPOWER_PLAN_LABELS.ASSIGN_ITEMS.CANCEL}
          </Button>
          <Button
            type="button"
            className="h-11 rounded-xl bg-teal-600 text-sm text-white hover:bg-teal-700"
            disabled={!employeeId || items.length === 0 || isSubmitting}
            onClick={handleSubmit}
          >
            {isSubmitting
              ? MANPOWER_PLAN_LABELS.ASSIGN_ITEMS.SUBMITTING
              : MANPOWER_PLAN_LABELS.ASSIGN_ITEMS.SUBMIT(items.length)}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
