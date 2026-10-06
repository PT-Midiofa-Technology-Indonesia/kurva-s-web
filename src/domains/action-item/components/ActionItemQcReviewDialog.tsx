'use client';

import { Download, FileText } from 'lucide-react';
import { useEffect, useState } from 'react';
import { FileInput } from '@/shared/components/molecules';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog';
import { Label } from '@/shared/components/ui/label';
import { Separator } from '@/shared/components/ui/separator';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { Textarea } from '@/shared/components/ui/textarea';
import { toast } from '@/shared/lib/toast';
import { cn } from '@/shared/lib/utils';
import { formatDate, formatFileSize } from '@/shared/utils/format';
import {
  ACTION_ITEM_LABELS,
  MEETING_TASK_STATUS_BADGE_CLASSNAMES,
  QC_DECISION_LABELS,
  QC_TERMINAL_STATUSES,
} from '../constants';
import { useQcTask } from '../hooks/use-qc-task';
import type { EvidenceFile } from '../types';
import type { QcDecisionApi } from '../types/api';

const labels = ACTION_ITEM_LABELS.QC_REVIEW_DIALOG;

function DetailField({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1.5">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="text-sm text-slate-950">{value || '-'}</p>
    </div>
  );
}

function TaskEvidenceCard({ file }: { file: EvidenceFile }) {
  const isImage = file.mimeType.startsWith('image/');
  return (
    <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-3">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-200">
        {isImage ? (
          // biome-ignore lint/performance/noImgElement: remote evidence file preview
          <img src={file.url} alt={file.fileName} className="h-full w-full object-cover" />
        ) : (
          <FileText className="h-5 w-5 text-slate-950" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-slate-950">{file.fileName}</p>
        <p className="text-xs text-slate-500">{formatFileSize(file.fileSize)}</p>
      </div>
      <a
        href={file.url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Download ${file.fileName}`}
        className="shrink-0 text-slate-500 hover:text-slate-950"
      >
        <Download className="h-4 w-4" />
      </a>
    </div>
  );
}

interface ActionItemQcReviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  taskId: string | null;
  companyId: string;
  /** Fallback title while the detail request is still loading. */
  momTitle: string;
  isSubmitting: boolean;
  onSubmitDecision: (taskId: string, decision: QcDecisionApi, note: string, files: File[]) => void;
}

export function ActionItemQcReviewDialog({
  open,
  onOpenChange,
  taskId,
  companyId,
  momTitle,
  isSubmitting,
  onSubmitDecision,
}: ActionItemQcReviewDialogProps) {
  const [qcNote, setQcNote] = useState('');
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const { data: task, isLoading, isError } = useQcTask({ id: taskId ?? undefined, companyId });

  useEffect(() => {
    if (!open) return;
    setNewFiles([]);
  }, [open]);

  // Seed the note from the server once the detail lands (a re-review starts
  // from the previous note).
  useEffect(() => {
    if (open && task) setQcNote(task.qcNote);
  }, [open, task]);

  const isSubmittable = task ? !QC_TERMINAL_STATUSES.includes(task.status) : false;

  const handleSubmit = (decision: QcDecisionApi) => {
    if (!task) return;
    if (!qcNote.trim()) {
      toast.error({ title: labels.NOTE_REQUIRED });
      return;
    }
    if (newFiles.length === 0) {
      toast.error({ title: labels.EVIDENCE_REQUIRED });
      return;
    }
    onSubmitDecision(task.id, decision, qcNote, newFiles);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[92vh] w-full flex-col overflow-hidden p-0 max-w-5xl!">
        <DialogHeader className="sticky top-0 gap-2 bg-popover px-6 pt-6 pb-4 pr-10">
          {task ? (
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant="secondary"
                className="rounded-md border-0 bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700"
              >
                {task.code}
              </Badge>
              <DialogTitle className="text-base leading-tight font-semibold text-slate-950">
                {task.task}
              </DialogTitle>
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
          ) : (
            <DialogTitle className="text-base leading-tight font-semibold text-slate-950">
              {isError ? labels.LOAD_ERROR : <Skeleton className="h-5 w-64" />}
            </DialogTitle>
          )}
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 pb-6">
          {isLoading || !task ? (
            <div className="grid gap-6">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-56 w-full" />
            </div>
          ) : (
            <div className="grid gap-6">
              <DetailField label={labels.MOM_LABEL} value={task.momTitle || momTitle} />
              <DetailField label={labels.PROJECT_LABEL} value={task.projectName} />

              <div className="grid gap-4 md:grid-cols-2">
                <section className="space-y-5 rounded-xl border border-slate-200 p-5">
                  <div className="grid grid-cols-2 gap-4 gap-y-6">
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

                  <div className="space-y-2">
                    <p className="text-sm font-medium text-slate-950">
                      {labels.TASK_EVIDENCE_LABEL}
                    </p>
                    {task.taskEvidenceFiles.length === 0 ? (
                      <p className="text-sm text-slate-500">{labels.NO_TASK_EVIDENCE}</p>
                    ) : (
                      <div className="flex flex-col gap-3">
                        {task.taskEvidenceFiles.map((file) => (
                          <TaskEvidenceCard key={file.id} file={file} />
                        ))}
                      </div>
                    )}
                  </div>
                </section>

                <section className="space-y-5 rounded-xl border border-slate-200 p-5">
                  <div className="grid grid-cols-2 gap-4 gap-y-6">
                    <DetailField
                      label={labels.QC_DELEGATOR_LABEL}
                      value={task.qcDelegator ?? '-'}
                    />
                    <DetailField label={labels.QC_ASSIGNEE_LABEL} value={task.qcAssignee ?? '-'} />
                    <DetailField
                      label={labels.QC_AT_LABEL}
                      value={task.qcAt ? formatDate(task.qcAt) : '-'}
                    />
                    <DetailField
                      label={labels.DECISION_LABEL}
                      value={task.decision ? QC_DECISION_LABELS[task.decision] : '-'}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="qc-note" className="text-sm font-medium text-slate-950">
                      {labels.QC_NOTE_LABEL} <span className="text-teal-600">*</span>
                    </Label>
                    <Textarea
                      id="qc-note"
                      value={qcNote}
                      onChange={(event) => setQcNote(event.target.value)}
                      className="min-h-24 rounded-xl border-slate-300 px-4 py-3 text-base"
                      placeholder={labels.QC_NOTE_PLACEHOLDER}
                      disabled={!isSubmittable || isSubmitting}
                    />
                  </div>

                  {isSubmittable && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-slate-950">
                        {labels.QC_EVIDENCE_LABEL} <span className="text-teal-600">*</span>
                      </p>
                      <FileInput
                        value={newFiles}
                        onChange={setNewFiles}
                        accept=".docx,.xls,.pdf,.jpeg,.jpg,.png"
                        maxFiles={5}
                        maxSize={5 * 1024 * 1024}
                        disabled={!isSubmittable || isSubmitting}
                      />
                    </div>
                  )}
                </section>
              </div>
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
          {isSubmittable && (
            <>
              <Button
                type="button"
                variant="destructive"
                className="h-11 min-w-28 rounded-xl px-5 text-sm"
                disabled={isSubmitting}
                onClick={() => handleSubmit('fail')}
              >
                {labels.SUBMIT_FAIL}
              </Button>
              <Button
                type="button"
                className="h-11 min-w-28 rounded-xl bg-teal-600 px-5 text-sm text-white hover:bg-teal-700"
                disabled={isSubmitting}
                onClick={() => handleSubmit('pass')}
              >
                {labels.SUBMIT_PASS}
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
