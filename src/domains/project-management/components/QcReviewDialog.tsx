'use client';

import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { FileInput } from '@/components/molecules';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { getErrorMessage } from '@/shared/lib/api-error';
import { toast } from '@/shared/lib/toast';
import { cn } from '@/shared/lib/utils';
import { formatDate } from '@/shared/utils/format';
import { MANPOWER_PLAN_LABELS } from '../constants/manpower-plan';
import { useQcReportDetail, useSubmitQcReview } from '../hooks';
import type { QcReportDetail, QcReportRow } from '../types/manpower-planning';
import { ManpowerTimeline } from './ManpowerTimeline';

const labels = MANPOWER_PLAN_LABELS.QC_PAGE;

type QcReviewDialogMode = 'review' | 'detail';

type QcReviewDecision = 'pass' | 'fail';

interface QcReviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  row: QcReportRow | null;
  /** `detail` renders the read-only "Detail Pekerjaan" variant — no inputs, single Tutup footer. */
  mode: QcReviewDialogMode;
  /** Called after a successful decision — the page queries are invalidated by the hook itself. */
  onDecided?: () => void;
}

/** Shared metadata strip — one row of three fields on a light-grey card (both dialog variants). */
function QcMetadataCard({ detail }: { detail: QcReportDetail }) {
  const reviewLabels = labels.QC_REVIEW;

  return (
    <div className="grid grid-cols-3 gap-4 rounded-xl bg-slate-50 p-4">
      <div>
        <p className="text-xs text-slate-500">{reviewLabels.CREATED_BY}</p>
        <p className="text-sm font-medium text-slate-950">{detail.createdBy}</p>
      </div>
      <div>
        <p className="text-xs text-slate-500">{reviewLabels.ASSIGNEE_QC}</p>
        <p className="text-sm font-medium text-slate-950">
          {detail.assigneeQc ?? reviewLabels.EMPTY}
        </p>
      </div>
      <div>
        <p className="text-xs text-slate-500">{reviewLabels.LAST_UPDATE}</p>
        <p className="text-sm font-medium text-slate-950">
          {detail.lastUpdate ? formatDate(detail.lastUpdate) : reviewLabels.EMPTY}
        </p>
      </div>
    </div>
  );
}

/**
 * Manpower identity card — light-grey card with label-over-value pairs, single column in the
 * design's reading order: identity, Job/Item, Capaian dan Target, Catatan. Both dialog variants
 * (review's narrow panel and detail's full width) share the stack.
 */
function QcManpowerCard({ detail }: { detail: QcReportDetail }) {
  const reviewLabels = labels.QC_REVIEW;
  const helperNames = detail.manpower.helpers.join(', ');

  return (
    <div className="space-y-3 rounded-xl bg-slate-50 p-4">
      <div className="space-y-1">
        <p className="text-sm font-semibold text-slate-950">{detail.manpower.fullName}</p>
        {helperNames && (
          <p className="text-sm text-slate-600">{reviewLabels.HELPER_LINE(helperNames)}</p>
        )}
      </div>
      <div className="space-y-0.5">
        <p className="text-xs text-slate-500">{reviewLabels.JOB_ITEM_LABEL}</p>
        <p className="text-sm font-semibold text-slate-950">
          {detail.code} {detail.jobItem}
        </p>
      </div>
      {/* Two separate sections (design update): the backend-composed capaian/target line, then the note. */}
      <div className="space-y-0.5">
        <p className="text-xs font-semibold text-slate-950">{reviewLabels.CAPAIAN_TARGET_LABEL}</p>
        <p className="text-sm text-slate-600">{detail.targetDescription}</p>
      </div>
      <div className="space-y-0.5">
        <p className="text-xs font-semibold text-slate-950">{reviewLabels.MANPOWER_NOTE_LABEL}</p>
        <p className="text-sm text-slate-600">{detail.manpowerNote || reviewLabels.EMPTY}</p>
      </div>
    </div>
  );
}

export function QcReviewDialog({ open, onOpenChange, row, mode, onDecided }: QcReviewDialogProps) {
  const isReadOnly = mode === 'detail';
  const reviewLabels = labels.QC_REVIEW;

  const [note, setNote] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  /** Which of the two decisions is in flight — only that button swaps to `SUBMITTING`. */
  const [pendingDecision, setPendingDecision] = useState<QcReviewDecision | null>(null);

  const { mutate: submitReview, isPending: isSubmitting } = useSubmitQcReview();

  const reportId = open && row ? row.id : null;
  const { data: detail, isLoading: isLoadingDetail } = useQcReportDetail(reportId);

  // One clean slate per open session — a note typed for one row must never leak into the next.
  useEffect(() => {
    if (open) return;
    setNote('');
    setFiles([]);
    setPendingDecision(null);
  }, [open]);

  const handleDecide = (decision: QcReviewDecision) => {
    if (!row || !detail) return;

    setPendingDecision(decision);
    submitReview(
      {
        reportId: row.id,
        decision,
        note: note.trim(),
        files: files.length > 0 ? files : undefined,
      },
      {
        onSuccess: () => {
          toast.success({
            title:
              decision === 'pass' ? labels.TOASTS.REVIEW_ACCEPTED : labels.TOASTS.REVIEW_REJECTED,
          });
          onOpenChange(false);
          onDecided?.();
        },
        onError: (error) => {
          toast.error({ title: getErrorMessage(error) });
        },
        onSettled: () => setPendingDecision(null),
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          'flex max-h-[90vh] w-full max-w-xl flex-col gap-0 overflow-hidden p-0',
          isReadOnly ? 'sm:max-w-3xl' : 'sm:max-w-5xl'
        )}
      >
        <DialogHeader className="shrink-0 gap-1 p-5 pt-8">
          <DialogTitle className="text-lg leading-none font-semibold text-slate-950">
            {isReadOnly ? labels.DETAIL.TITLE : reviewLabels.TITLE}
          </DialogTitle>
          <p className="text-sm text-slate-600">
            {row ? reviewLabels.SUBTITLE(row.code, row.jobItem) : reviewLabels.EMPTY}
          </p>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-5">
          {isLoadingDetail ? (
            <div className="flex items-center justify-center gap-2 py-8 text-sm text-slate-500">
              <Loader2 className="size-4 animate-spin" />
              {reviewLabels.LOADING}
            </div>
          ) : !detail ? (
            <p className="py-8 text-center text-sm text-slate-500">{reviewLabels.EMPTY}</p>
          ) : isReadOnly ? (
            // Detail variant — single stacked column: QC Review strip, Manpower card, full-width timeline.
            <div className="space-y-5">
              <section className="space-y-3">
                <h3 className="text-sm font-semibold text-slate-950">
                  {reviewLabels.QC_PANEL_TITLE}
                </h3>
                <QcMetadataCard detail={detail} />
              </section>

              <section className="space-y-3">
                <h3 className="text-sm font-semibold text-slate-950">
                  {reviewLabels.MANPOWER_PANEL_TITLE}
                </h3>
                <QcManpowerCard detail={detail} />
              </section>

              <ManpowerTimeline entries={detail.timeline} />
            </div>
          ) : (
            // Review variant — two columns split by a divider: Manpower + timeline | QC Review form.
            <div className="grid gap-5 md:grid-cols-2 md:gap-0 md:divide-x md:divide-slate-200">
              <section className="space-y-3 md:pr-5">
                <h3 className="text-sm font-semibold text-slate-950">
                  {reviewLabels.MANPOWER_PANEL_TITLE}
                </h3>
                <QcManpowerCard detail={detail} />
                <ManpowerTimeline entries={detail.timeline} />
              </section>

              <section className="space-y-4 md:pl-5">
                <h3 className="text-sm font-semibold text-slate-950">
                  {reviewLabels.QC_PANEL_TITLE}
                </h3>
                <QcMetadataCard detail={detail} />

                <div className="space-y-2">
                  <Label htmlFor="qc-review-note" className="text-sm leading-none font-medium">
                    {reviewLabels.NOTE_LABEL}
                  </Label>
                  <Textarea
                    id="qc-review-note"
                    value={note}
                    onChange={(event) => setNote(event.target.value)}
                    disabled={isSubmitting}
                    placeholder={reviewLabels.NOTE_PLACEHOLDER}
                    className="min-h-24 resize-none rounded-xl border-slate-300 px-4 py-3 text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm leading-none font-medium">
                    {reviewLabels.EVIDENCE_LABEL}
                  </Label>
                  <FileInput
                    value={files}
                    onChange={setFiles}
                    accept={reviewLabels.EVIDENCE_ACCEPT}
                    maxFiles={reviewLabels.EVIDENCE_MAX_FILES}
                    maxSize={reviewLabels.EVIDENCE_MAX_SIZE_BYTES}
                    disabled={isSubmitting}
                  />
                </div>
              </section>
            </div>
          )}
        </div>

        <div className="flex shrink-0 items-center justify-end gap-4 border-t border-slate-200 p-5">
          {isReadOnly ? (
            <Button
              type="button"
              variant="outline"
              className="ml-auto h-11 rounded-xl border-slate-300 px-8 text-sm"
              onClick={() => onOpenChange(false)}
            >
              {labels.DETAIL.CLOSE}
            </Button>
          ) : (
            <>
              <Button
                type="button"
                variant="outline"
                className="h-11 min-w-28 rounded-xl border-slate-300 text-sm"
                disabled={isSubmitting}
                onClick={() => onOpenChange(false)}
              >
                {reviewLabels.CANCEL}
              </Button>
              <Button
                type="button"
                className="h-11 min-w-28 rounded-xl bg-red-600 text-sm text-white hover:bg-red-700"
                disabled={!detail || isLoadingDetail || isSubmitting}
                onClick={() => handleDecide('fail')}
              >
                {pendingDecision === 'fail' ? reviewLabels.SUBMITTING : reviewLabels.REJECT}
              </Button>
              <Button
                type="button"
                className="h-11 min-w-28 rounded-xl bg-teal-600 text-sm text-white hover:bg-teal-700"
                disabled={!detail || isLoadingDetail || isSubmitting}
                onClick={() => handleDecide('pass')}
              >
                {pendingDecision === 'pass' ? reviewLabels.SUBMITTING : reviewLabels.APPROVE}
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
