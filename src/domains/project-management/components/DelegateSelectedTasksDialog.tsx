'use client';

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
import { useSubordinateEmployees } from '@/domains/project-control';
import { getErrorMessage } from '@/shared/lib/api-error';
import { toast } from '@/shared/lib/toast';
import { useDelegateProjectTask, useDelegateProjectTaskQc } from '../hooks';
import type { ProjectTaskCategory } from '../types/manpower-planning';

export interface DelegateTaskListItem {
  boqItemId: string;
  boqCode: string;
  title: string;
  taskId?: string;
}

interface DelegateSelectedTasksDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: DelegateTaskListItem[];
  taskCategory?: ProjectTaskCategory;
  onDelegated?: () => void;
}

export function DelegateSelectedTasksDialog({
  open,
  onOpenChange,
  items,
  taskCategory = 'control',
  onDelegated,
}: DelegateSelectedTasksDialogProps) {
  const isQc = taskCategory === 'qc';
  // Scope the subordinate-employee list to the task category the page is on
  // (work vs qc), matching the `taskCategory` query param on the BOQ endpoint.
  const employeeTaskCategory = isQc ? 'qc' : 'work';
  const [employeeId, setEmployeeId] = useState('');
  const { data: employees, isLoading: isLoadingEmployees } =
    useSubordinateEmployees(employeeTaskCategory);
  const { mutate: delegateTasks, isPending: isSubmittingWork } = useDelegateProjectTask();
  const { mutate: delegateQcTasks, isPending: isSubmittingQc } = useDelegateProjectTaskQc();
  const isSubmitting = isQc ? isSubmittingQc : isSubmittingWork;

  useEffect(() => {
    if (!open) return;
    setEmployeeId('');
  }, [open]);

  const handleSubmit = () => {
    if (!employeeId || items.length === 0) return;

    const onSuccess = () => {
      toast.success({ title: 'Task berhasil didelegasikan' });
      onOpenChange(false);
      onDelegated?.();
    };
    const onError = (error: unknown) => {
      toast.error({ title: getErrorMessage(error) });
    };

    if (isQc) {
      const missingTaskItem = items.find((item) => !item.taskId);
      if (missingTaskItem) {
        toast.error({ title: `Task "${missingTaskItem.title}" belum tersedia untuk QC` });
        return;
      }

      delegateQcTasks(
        {
          tasks: items.map((item) => ({
            projectTaskId: item.taskId!,
            employeeId,
          })),
        },
        { onSuccess, onError }
      );
      return;
    }

    delegateTasks(
      {
        tasks: items.map((item) => ({
          boqItemId: item.boqItemId,
          employeeId,
        })),
      },
      { onSuccess, onError }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] w-full max-w-md flex-col gap-0 overflow-hidden p-0 sm:max-w-md">
        <DialogHeader className="shrink-0 gap-1 border-b border-slate-200 p-5 pt-8">
          <DialogTitle className="text-lg leading-none font-semibold text-slate-950">
            Delegate Task
          </DialogTitle>
          <p className="text-sm text-slate-600">{items.length} task dipilih</p>
        </DialogHeader>

        <div className="flex-1 space-y-4 overflow-y-auto p-5">
          <div className="space-y-2">
            {items.map((item) => (
              <div
                key={item.boqItemId}
                className="flex items-center gap-2 rounded-xl border border-slate-200 p-3"
              >
                <Badge
                  variant="secondary"
                  className="w-fit shrink-0 rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700"
                >
                  {item.boqCode}
                </Badge>
                <span className="truncate text-sm text-slate-950">{item.title}</span>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <Label htmlFor="delegate-employee" className="text-sm leading-none font-medium">
              Employee <span className="text-teal-600">*</span>
            </Label>
            <Select
              value={employeeId}
              onValueChange={setEmployeeId}
              disabled={isLoadingEmployees || isSubmitting}
            >
              <SelectTrigger
                id="delegate-employee"
                className="h-11! w-full rounded-xl bg-white text-sm"
              >
                <SelectValue
                  placeholder={isLoadingEmployees ? 'Memuat employee...' : 'Pilih Employee'}
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
        </div>

        <div className="grid shrink-0 grid-cols-2 gap-4 border-t border-slate-200 p-5">
          <Button
            type="button"
            variant="outline"
            className="h-11 rounded-xl border-slate-300 text-sm"
            disabled={isSubmitting}
            onClick={() => onOpenChange(false)}
          >
            Batal
          </Button>
          <Button
            type="button"
            className="h-11 rounded-xl bg-teal-600 text-sm text-white hover:bg-teal-700"
            disabled={!employeeId || items.length === 0 || isSubmitting}
            onClick={handleSubmit}
          >
            {isSubmitting ? 'Menyimpan...' : `Delegate (${items.length})`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
