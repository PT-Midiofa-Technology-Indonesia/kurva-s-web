'use client';

import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { FileInput } from '@/components/molecules';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/shared/components/atoms';
import type { ExistingFile } from '@/shared/components/organisms/FormGenerator/types';
import { getErrorMessage } from '@/shared/lib/api-error';
import { toast } from '@/shared/lib/toast';
import { cn } from '@/shared/lib/utils';
import { formatDate } from '@/shared/utils/format';
import {
  DEFAULT_TASK_STATUS_BADGE_CLASSNAME,
  TASK_DONE_DIALOG_LABELS,
  TASK_STATUS_BADGE_CLASSNAMES,
} from '../constants';
import { useMarkProjectTaskDone } from '../hooks';
import type { TaskActionItem } from '../types/manpower-planning';
import { EvidenceFileCard } from './EvidenceFileCard';

const labels = TASK_DONE_DIALOG_LABELS;

/** Latest QC cycle recorded against the task — read-only, mirrors the QC review dialog. */
export interface TaskDoneDialogQcDetail {
  delegator: string;
  assignee: string;
  qcAt: string | null;
  decision: string;
  note: string;
  evidenceFiles: ExistingFile[];
}

export interface TaskDoneDialogDetail {
  createdBy: string;
  doneBy: string;
  description: string;
  activityDescription: string;
  evidenceFiles: ExistingFile[];
  /** Evidence uploaded during the QC review cycles — rendered in the QC Review section. */
  qcEvidenceFiles: ExistingFile[];
  /** `null` when the task has never been through QC. */
  qc: TaskDoneDialogQcDetail | null;
}

interface TaskDoneDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: TaskActionItem | null;
  detail: TaskDoneDialogDetail | null;
  /** View-only mode — no editing, no submit, evidence rendered as a static list. */
  readOnly?: boolean;
  /** Shows a loading placeholder while the task detail is being fetched. */
  isLoading?: boolean;
}

function DetailField({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1.5">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="text-sm text-slate-950">{value || '-'}</p>
    </div>
  );
}

function EvidenceList({ files, emptyMessage }: { files: ExistingFile[]; emptyMessage: string }) {
  if (files.length === 0) {
    return <p className="text-sm text-slate-500">{emptyMessage}</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      {files.map((file) => (
        <EvidenceFileCard key={file.id} file={file} />
      ))}
    </div>
  );
}

/** Rendered only when the task has been through QC — see `hasQc` in TaskDoneDialog. */
function QcSection({ qc }: { qc: TaskDoneDialogQcDetail }) {
  const qcLabels = labels.QC_SECTION;

  return (
    <section className="space-y-5 rounded-xl border border-slate-200 p-5">
      <h3 className="text-base leading-tight font-semibold text-slate-950">{qcLabels.TITLE}</h3>

      <div className="grid gap-4 sm:grid-cols-2 sm:gap-x-10 sm:gap-y-6">
        <DetailField label={qcLabels.DELEGATOR} value={qc.delegator} />
        <DetailField label={qcLabels.ASSIGNEE} value={qc.assignee} />
        <DetailField label={qcLabels.QC_AT} value={qc.qcAt ? formatDate(qc.qcAt) : '-'} />
        <DetailField label={qcLabels.DECISION} value={qc.decision} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="task-done-qc-note" className="text-sm font-medium text-slate-950">
          {qcLabels.NOTE}
        </Label>
        <Textarea
          id="task-done-qc-note"
          value={qc.note}
          readOnly
          className="min-h-24 rounded-xl border-slate-300 px-4 py-3 text-base"
          placeholder={qcLabels.NO_NOTE}
        />
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium text-slate-950">{qcLabels.EVIDENCE}</Label>
        <EvidenceList files={qc.evidenceFiles} emptyMessage={qcLabels.NO_EVIDENCE} />
      </div>
    </section>
  );
}

export function TaskDoneDialog({
  open,
  onOpenChange,
  item,
  detail,
  readOnly = false,
  isLoading = false,
}: TaskDoneDialogProps) {
  const [activityDescription, setActivityDescription] = useState('');
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [existingFiles, setExistingFiles] = useState<ExistingFile[]>([]);
  const { mutate: markDone, isPending: isSubmitting } = useMarkProjectTaskDone();
  const taskLabels = labels.TASK_SECTION;
  const status = item?.status ?? labels.FALLBACK_STATUS;
  // No QC yet — drop the section entirely and let the task detail use the full width.
  const qc = detail?.qc ?? null;

  useEffect(() => {
    if (!open) {
      return;
    }

    setActivityDescription(detail?.activityDescription ?? '');
    setExistingFiles(detail?.evidenceFiles ?? []);
    setNewFiles([]);
  }, [detail, open]);

  const handleSubmit = () => {
    if (!item) return;

    if (newFiles.length === 0) {
      toast.error({ title: labels.TOAST.EVIDENCE_REQUIRED });
      return;
    }

    markDone(
      {
        taskId: item.taskId,
        payload: { note: activityDescription || undefined, files: newFiles },
      },
      {
        onSuccess: () => {
          toast.success({ title: labels.TOAST.SUBMIT_SUCCESS });
          onOpenChange(false);
        },
        onError: (error) => {
          toast.error({ title: getErrorMessage(error) });
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          'flex max-h-[92vh] w-full flex-col overflow-hidden p-0',
          qc ? 'max-w-5xl!' : 'max-w-xl!'
        )}
      >
        <DialogHeader className="sticky top-0 gap-4 bg-popover px-6 pt-6 pb-4 pr-10">
          <div className="flex items-center gap-2">
            <Badge
              variant="secondary"
              className="rounded-md border-0 bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700"
            >
              {item?.boqCode ?? '-'}
            </Badge>
            <Badge
              variant="secondary"
              className={cn(
                'rounded-md border-0 px-2 py-0.5 text-xs font-medium',
                TASK_STATUS_BADGE_CLASSNAMES[status] ?? DEFAULT_TASK_STATUS_BADGE_CLASSNAME
              )}
            >
              {status}
            </Badge>
          </div>
          <DialogTitle className="leading-tight font-semibold text-slate-950">
            {item?.title ?? labels.FALLBACK_TITLE}
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center gap-2 py-12 text-sm text-slate-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            {labels.LOADING}
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-6 pb-6">
              <div className={cn('grid gap-6', qc && 'md:grid-cols-2')}>
                <section className="space-y-5 rounded-xl border border-slate-200 p-5">
                  <h3 className="text-base leading-tight font-semibold text-slate-950">
                    {taskLabels.TITLE}
                  </h3>

                  <div className="grid gap-4 sm:grid-cols-2 sm:gap-x-10 sm:gap-y-6">
                    <DetailField label={taskLabels.CREATED_BY} value={detail?.createdBy ?? '-'} />
                    <DetailField label={taskLabels.ASSIGNEE} value={item?.assignee ?? '-'} />
                    <DetailField label={taskLabels.DONE_BY} value={detail?.doneBy ?? '-'} />
                    <DetailField
                      label={taskLabels.DONE_AT}
                      value={item?.doneAt ? formatDate(item.doneAt) : '-'}
                    />
                  </div>

                  <Separator className="bg-slate-200" />

                  <DetailField label={taskLabels.DESCRIPTION} value={detail?.description ?? '-'} />

                  <div className="space-y-2">
                    <Label
                      htmlFor="task-done-activity"
                      className="text-sm font-medium text-slate-950"
                    >
                      {taskLabels.ACTIVITY_DESCRIPTION}
                    </Label>
                    <Textarea
                      id="task-done-activity"
                      value={activityDescription}
                      onChange={(event) => setActivityDescription(event.target.value)}
                      readOnly={readOnly}
                      className="min-h-24 rounded-xl border-slate-300 px-4 py-3 text-base"
                      placeholder={taskLabels.ACTIVITY_PLACEHOLDER}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-950">
                      {readOnly ? (
                        taskLabels.EVIDENCE
                      ) : (
                        <>
                          {taskLabels.ATTACH_EVIDENCE} <span className="text-teal-600">*</span>
                        </>
                      )}
                    </Label>
                    {readOnly ? (
                      <EvidenceList files={existingFiles} emptyMessage={taskLabels.NO_EVIDENCE} />
                    ) : (
                      <FileInput
                        value={newFiles}
                        onChange={setNewFiles}
                        existingFiles={existingFiles}
                        onExistingFilesChange={setExistingFiles}
                        accept=".docx,.xls,.pdf,.jpeg,.jpg,.png"
                        maxFiles={5}
                        maxSize={5 * 1024 * 1024}
                      />
                    )}
                  </div>
                </section>

                {qc && <QcSection qc={qc} />}
              </div>
            </div>

            {!readOnly && (
              <div className="sticky bottom-0 flex justify-end gap-3 border-t border-slate-200 bg-popover px-6 py-4">
                <Button
                  type="button"
                  variant="outline"
                  className="h-11 min-w-28 rounded-xl border-slate-300 px-5 text-sm"
                  disabled={isSubmitting}
                  onClick={() => onOpenChange(false)}
                >
                  {labels.FOOTER.CANCEL}
                </Button>
                <Button
                  type="button"
                  className="h-11 min-w-28 rounded-xl bg-teal-600 px-5 text-sm text-white hover:bg-teal-700"
                  disabled={isSubmitting}
                  onClick={handleSubmit}
                >
                  {isSubmitting ? labels.FOOTER.SUBMITTING : labels.FOOTER.SUBMIT}
                </Button>
              </div>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
