'use client';

import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { FileInput } from '@/components/molecules';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/shared/components/atoms';
import { getErrorMessage } from '@/shared/lib/api-error';
import { toast } from '@/shared/lib/toast';
import { cn } from '@/shared/lib/utils';
import { formatDate } from '@/shared/utils/format';
import { DEFAULT_TASK_STATUS_BADGE_CLASSNAME, TASK_STATUS_BADGE_CLASSNAMES } from '../constants';
import { useMarkProjectTaskDone } from '../hooks';
import type { TaskActionItem, TaskControlStatus } from '../types/manpower-planning';
import { EvidenceFileCard } from './EvidenceFileCard';
import type { TaskDoneDialogDetail } from './TaskDoneDialog';

interface QcTaskReviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: TaskActionItem | null;
  detail: TaskDoneDialogDetail | null;
  readOnly?: boolean;
  isLoading?: boolean;
}

const QC_REVIEW_SUBMITTABLE_STATUSES: TaskControlStatus[] = ['Created', 'In Progress', 'Reopened'];

function DetailField({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1.5">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="text-sm text-slate-950">{value || '-'}</p>
    </div>
  );
}

export function QcTaskReviewDialog({
  open,
  onOpenChange,
  item,
  detail,
  readOnly = false,
  isLoading = false,
}: QcTaskReviewDialogProps) {
  const [activityDescription, setActivityDescription] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const { mutate: markDone, isPending: isSubmitting } = useMarkProjectTaskDone();
  const status = item?.status ?? 'Created';

  useEffect(() => {
    if (!open) {
      return;
    }

    setActivityDescription(detail?.activityDescription ?? '');
    setFiles([]);
  }, [detail, open]);

  const canSubmitQcReview =
    !readOnly &&
    Boolean(
      item?.status && QC_REVIEW_SUBMITTABLE_STATUSES.includes(item.status as TaskControlStatus)
    );

  // An unclaimed QC task has nobody to attribute the review to — it must be claimed first.
  const isAssigned = Boolean(item?.assignee);

  const handleSubmit = (qcDecision: 'fail' | 'pass') => {
    if (!item || !isAssigned) return;

    if (files.length === 0) {
      toast.error({ title: 'Lampirkan minimal 1 file evidence' });
      return;
    }

    markDone(
      {
        taskId: item.taskId,
        payload: { note: activityDescription || undefined, files, qcDecision },
      },
      {
        onSuccess: () => {
          toast.success({
            title: qcDecision === 'pass' ? 'QC task berhasil di-pass' : 'QC task ditandai fail',
          });
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
      <DialogContent className="flex max-h-[92vh] w-full flex-col overflow-hidden p-0 max-w-5xl!">
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
            {item?.title ?? 'Task Detail'}
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center gap-2 py-12 text-sm text-slate-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            Memuat detail task...
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-6 pb-6">
              <div className="grid gap-6">
                <div className="grid gap-4 sm:grid-cols-4 sm:gap-x-10 sm:gap-y-6">
                  <DetailField label="Created by" value={detail?.createdBy ?? '-'} />
                  <DetailField label="Assignee" value={item?.assignee ?? '-'} />
                  <DetailField label="Done by" value={detail?.doneBy ?? '-'} />
                  <DetailField
                    label="Done at"
                    value={item?.doneAt ? formatDate(item.doneAt) : '-'}
                  />
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <section className="space-y-5 rounded-xl border border-slate-200 p-5">
                    <h3 className="text-base leading-tight font-semibold text-slate-950">
                      Detail Task
                    </h3>

                    <DetailField label="Uploaded by" value={detail?.createdBy ?? '-'} />
                    <DetailField label="Deskripsi" value={detail?.description ?? '-'} />

                    {(detail?.evidenceFiles ?? []).length > 0 && (
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-slate-950">Evidence</Label>
                        <div className="flex flex-col gap-3">
                          {detail?.evidenceFiles.map((file) => (
                            <EvidenceFileCard key={file.id} file={file} />
                          ))}
                        </div>
                      </div>
                    )}
                  </section>

                  <section className="space-y-5 rounded-xl border border-slate-200 p-5">
                    <h3 className="text-base leading-tight font-semibold text-slate-950">
                      QC Review
                    </h3>

                    <div className="space-y-2">
                      <Label
                        htmlFor="qc-review-activity"
                        className="text-sm font-medium text-slate-950"
                      >
                        Deskripsi Aktivitas
                      </Label>
                      <Textarea
                        id="qc-review-activity"
                        value={activityDescription}
                        onChange={(event) => setActivityDescription(event.target.value)}
                        readOnly={readOnly}
                        disabled={!canSubmitQcReview}
                        className="min-h-24 rounded-xl border-slate-300 px-4 py-3 text-base"
                        placeholder="Jelaskan aktivitas yang sudah dikerjakan"
                      />
                    </div>

                    {(detail?.qcEvidenceFiles ?? []).length > 0 && (
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-slate-950">QC Evidence</Label>
                        <div className="flex flex-col gap-3">
                          {detail?.qcEvidenceFiles.map((file) => (
                            <EvidenceFileCard key={file.id} file={file} />
                          ))}
                        </div>
                      </div>
                    )}

                    {canSubmitQcReview && (
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-slate-950">
                          Attach Evidence <span className="text-teal-600">*</span>
                        </Label>
                        <FileInput
                          value={files}
                          onChange={setFiles}
                          accept=".docx,.xls,.pdf,.jpeg,.jpg,.png"
                          maxFiles={5}
                          maxSize={5 * 1024 * 1024}
                          disabled={!isAssigned}
                        />
                      </div>
                    )}
                  </section>
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 flex justify-end gap-3 border-t border-slate-200 bg-popover px-6 py-4">
              <Button
                type="button"
                variant="outline"
                className="h-11 min-w-28 rounded-xl border-slate-300 px-5 text-sm"
                disabled={isSubmitting}
                onClick={() => onOpenChange(false)}
              >
                Batal
              </Button>
              {canSubmitQcReview && (
                <>
                  <Button
                    type="button"
                    className="h-11 min-w-28 rounded-xl bg-red-600 px-5 text-sm text-white hover:bg-red-700"
                    disabled={isSubmitting || !isAssigned}
                    title={isAssigned ? undefined : 'Task belum di-claim'}
                    onClick={() => handleSubmit('fail')}
                  >
                    {isSubmitting ? 'Menyimpan...' : 'Submit Fail'}
                  </Button>
                  <Button
                    type="button"
                    className="h-11 min-w-28 rounded-xl bg-teal-600 px-5 text-sm text-white hover:bg-teal-700"
                    disabled={isSubmitting || !isAssigned}
                    title={isAssigned ? undefined : 'Task belum di-claim'}
                    onClick={() => handleSubmit('pass')}
                  >
                    {isSubmitting ? 'Menyimpan...' : 'Submit Pass'}
                  </Button>
                </>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
