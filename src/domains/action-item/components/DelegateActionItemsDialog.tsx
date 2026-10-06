'use client';

import { useEffect, useState } from 'react';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog';
import { Label } from '@/shared/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { ACTION_ITEM_LABELS } from '../constants';
import type { EmployeeOption } from '../types';

const labels = ACTION_ITEM_LABELS.DELEGATE_DIALOG;

export interface DelegateTaskListItem {
  id: string;
  task: string;
}

interface DelegateActionItemsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tasks: DelegateTaskListItem[];
  codesById: Map<string, string>;
  employees: EmployeeOption[];
  onDelegate: (employee: EmployeeOption) => void;
}

export function DelegateActionItemsDialog({
  open,
  onOpenChange,
  tasks,
  codesById,
  employees,
  onDelegate,
}: DelegateActionItemsDialogProps) {
  const [employeeId, setEmployeeId] = useState('');

  useEffect(() => {
    if (!open) return;
    setEmployeeId('');
  }, [open]);

  const handleSubmit = () => {
    const employee = employees.find((e) => e.id === employeeId);
    if (!employee || tasks.length === 0) return;
    onDelegate(employee);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] w-full max-w-md flex-col gap-0 overflow-hidden p-0 sm:max-w-md">
        <DialogHeader className="shrink-0 gap-1 border-b border-slate-200 p-5 pt-8">
          <DialogTitle className="text-lg leading-none font-semibold text-slate-950">
            {labels.TITLE}
          </DialogTitle>
          <p className="text-sm text-slate-600">{labels.SELECTED_LABEL(tasks.length)}</p>
        </DialogHeader>

        <div className="flex-1 space-y-4 overflow-y-auto p-5">
          <div className="space-y-2">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center gap-2 rounded-xl border border-slate-200 p-3"
              >
                <Badge
                  variant="secondary"
                  className="w-fit shrink-0 rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700"
                >
                  {codesById.get(task.id) ?? '-'}
                </Badge>
                <span className="truncate text-sm text-slate-950">{task.task}</span>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <Label htmlFor="delegate-employee" className="text-sm leading-none font-medium">
              {labels.EMPLOYEE_LABEL} <span className="text-teal-600">*</span>
            </Label>
            <Select value={employeeId} onValueChange={setEmployeeId}>
              <SelectTrigger
                id="delegate-employee"
                className="h-11! w-full rounded-xl bg-white text-sm"
              >
                <SelectValue placeholder={labels.EMPLOYEE_PLACEHOLDER} />
              </SelectTrigger>
              <SelectContent>
                {employees.map((employee) => (
                  <SelectItem key={employee.id} value={employee.id}>
                    {employee.name}
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
            onClick={() => onOpenChange(false)}
          >
            {labels.CANCEL}
          </Button>
          <Button
            type="button"
            className="h-11 rounded-xl bg-teal-600 text-sm text-white hover:bg-teal-700"
            disabled={!employeeId || tasks.length === 0}
            onClick={handleSubmit}
          >
            {labels.SUBMIT(tasks.length)}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
