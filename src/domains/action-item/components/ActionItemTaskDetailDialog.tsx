'use client';

import { useEffect, useState } from 'react';
import { FileInput } from '@/shared/components/molecules';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog';
import { Separator } from '@/shared/components/ui/separator';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { toast } from '@/shared/lib/toast';
import { cn } from '@/shared/lib/utils';
import { formatDate } from '@/shared/utils/format';
import { ACTION_ITEM_LABELS, MEETING_TASK_STATUS_BADGE_CLASSNAMES } from '../constants';
import { useMeetingTask } from '../hooks/use-meeting-task';
import type { MeetingTaskApiStatus } from '../types/api';
import { CancelActionItemTaskDialog } from './CancelActionItemTaskDialog';

const labels = ACTION_ITEM_LABELS.DETAIL_DIALOG;

/** Statuses past the point where new evidence can be submitted. */
const TERMINAL_STATUSES: MeetingTaskApiStatus[] = ['done', 'qc_passed', 'cancelled'];

function DetailField({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1.5">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="text-sm text-slate-950">{value || '-'}</p>
    </div>
  );
}

interface ActionItemTaskDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  taskId: string | null;
  companyId: string;
  /** Fallback title while the detail request is still loading. */
  momTitle: string;
  isSubmitting: boolean;
  isCancelling: boolean;
  onCompleteTask: (taskId: string, files: File[]) => void;
  onCancelTask: (taskId: string, reason: string, files: File[]) => void;
}

export function ActionItemTaskDetailDialog({
  open,
  onOpenChange,
  taskId,
  companyId,
  momTitle,
  isSubmitting,
  isCancelling,
  onCompleteTask,
  onCancelTask,
}: ActionItemTaskDetailDialogProps) {
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const { data: task, isLoading, isError } = useMeetingTask({ id: taskId ?? undefined, companyId });

  useEffect(() => {
    if (open) {
      setNewFiles([]);
    } else {
      // Also covers the success path: TaskControlTab closes the outer dialog
      // (open -> false) once cancellation succeeds, so the nested reason
      // dialog must close along with it instead of staying stuck open.
      setIsCancelDialogOpen(false);
    }
  }, [open]);

  const isTerminal = task ? TERMINAL_STATUSES.includes(task.status) : true;

  const handleDoneTask = () => {
    if (!task) return;
    if (newFiles.length === 0) {
      toast.error({ title: labels.EVIDENCE_REQUIRED });
      return;
    }
    onCompleteTask(task.id, newFiles);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[92vh] w-full flex-col overflow-hidden p-0 max-w-xl!">
        <DialogHeader className="sticky top-0 gap-4 bg-popover px-6 pt-6 pb-4 pr-10">
          {task ? (
            <>
              <div className="flex items-center gap-2">
                <Badge
                  variant="secondary"
                  className="rounded-md border-0 bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700"
                >
                  {task.code}
                </Badge>
                <Badge
                  variant="secondary"
                  className={cn(
                    'rounded-md border-0 px-2 py-0.5 text-xs font-medium',
                    MEETING_TASK_STATUS_BADGE_CLASSNAMES[task.status]
                  )}
                >
                  {task.statusLabel}
                </Badge>
              </div>
              <DialogTitle className="leading-tight font-semibold text-slate-950">
                {task.task}
              </DialogTitle>
            </>
          ) : (
            <DialogTitle className="leading-tight font-semibold text-slate-950">
              {isError ? labels.LOAD_ERROR : <Skeleton className="h-5 w-64" />}
            </DialogTitle>
          )}
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 pb-6">
          {isLoading || !task ? (
            <div className="grid gap-6">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : (
            <div className="grid gap-6">
              <DetailField label={labels.MOM_LABEL} value={task.momTitle || momTitle} />
              <DetailField label={labels.PROJECT_LABEL} value={task.projectName} />

              <div className="grid gap-4 sm:grid-cols-2 sm:gap-x-10 sm:gap-y-6">
                <DetailField label={labels.CREATED_BY_LABEL} value={task.createdBy} />
                <DetailField label={labels.ASSIGNEE_LABEL} value={task.assignee ?? '-'} />
                <DetailField
                  label={labels.CREATED_AT_LABEL}
                  value={task.createdAt ? formatDate(task.createdAt) : '-'}
                />
                <DetailField
                  label={labels.DONE_AT_LABEL}
                  value={task.doneAt ? formatDate(task.doneAt) : '-'}
                />
              </div>

              <Separator className="bg-slate-200" />

              {task.evidenceFiles.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-slate-950">{labels.EVIDENCE_TASK_LABEL}</p>
                  <div className="space-y-2">
                    {task.evidenceFiles.map((file) => (
                      <a
                        key={file.id}
                        href={file.url}
                        target="_blank"
                        rel="noreferrer"
                        className="block truncate rounded-xl border border-slate-200 p-3 text-sm text-slate-950 hover:bg-slate-50"
                      >
                        {file.fileName}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {!isTerminal && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-slate-950">
                    {labels.EVIDENCE_LABEL} <span className="text-teal-600">*</span>
                  </p>
                  <FileInput
                    value={newFiles}
                    onChange={setNewFiles}
                    accept=".docx,.xls,.pdf,.jpeg,.jpg,.png"
                    maxFiles={5}
                    maxSize={5 * 1024 * 1024}
                    disabled={isSubmitting}
                  />
                </div>
              )}
            </div>
          )}
        </div>

        <div className="sticky bottom-0 flex justify-end gap-3 border-t border-slate-200 bg-popover px-6 py-4">
          <Button
            type="button"
            variant="outline"
            className="h-11 min-w-28 rounded-xl border-slate-300 px-5 text-sm"
            onClick={() => onOpenChange(false)}
          >
            {labels.CANCEL}
          </Button>
          {!isTerminal && (
            <>
              <Button
                type="button"
                variant="destructive"
                className="h-11 min-w-28 rounded-xl px-5 text-sm"
                disabled={!task || isSubmitting}
                onClick={() => setIsCancelDialogOpen(true)}
              >
                {labels.CANCEL_TASK}
              </Button>
              <Button
                type="button"
                className="h-11 min-w-28 rounded-xl bg-teal-600 px-5 text-sm text-white hover:bg-teal-700"
                disabled={!task || isSubmitting}
                onClick={handleDoneTask}
              >
                {labels.DONE_TASK}
              </Button>
            </>
          )}
        </div>
      </DialogContent>

      <CancelActionItemTaskDialog
        open={isCancelDialogOpen}
        onOpenChange={setIsCancelDialogOpen}
        isLoading={isCancelling}
        onConfirm={(reason, cancelFiles) => {
          if (!task) return;
          onCancelTask(task.id, reason, cancelFiles);
        }}
      />
    </Dialog>
  );
}
