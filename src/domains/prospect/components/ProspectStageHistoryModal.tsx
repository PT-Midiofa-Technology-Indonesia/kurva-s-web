'use client';

import { ArrowLeft, CheckCircle2, CircleDot, Download, FileText } from 'lucide-react';
import { VisuallyHidden } from 'radix-ui';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/shared/components/ui/accordion';

import { formatDateTimeLong, formatFileSize } from '@/shared/utils/format';

import { PROSPECT_LABELS, PROSPECT_READONLY_STAGES } from '../constants';
import type { StageHistoryEntry } from '../types';

const labels = PROSPECT_LABELS.DETAIL.STAGE_HISTORY;

function StageFileRow({ name, size, url }: { name: string; size: number; url: string }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-500">
        <FileText size={16} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-slate-700">{name}</p>
        <p className="text-xs text-slate-400">{formatFileSize(size)}</p>
      </div>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="shrink-0 text-cyan-500 hover:text-cyan-600"
        aria-label={`Download ${name}`}
      >
        <Download size={16} />
      </a>
    </div>
  );
}

function StageTimelineIndicator({ isCompleted }: { isCompleted: boolean }) {
  if (isCompleted) {
    return <CheckCircle2 size={24} strokeWidth={2} className="text-green-500" />;
  }
  return <CircleDot size={24} strokeWidth={2} className="text-slate-500" />;
}

function StageHistoryEntryCard({ entry, isLast }: { entry: StageHistoryEntry; isLast: boolean }) {
  const isCompleted = !isLast || PROSPECT_READONLY_STAGES.has(entry.stage);
  const hasDocuments = entry.documents.length > 0;
  const hasActivity =
    entry.activity !== null && (entry.activity.description || entry.activity.documents.length > 0);

  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <StageTimelineIndicator isCompleted={isCompleted} />
        {!isLast && <div className="mt-1 w-0.5 flex-1 bg-slate-200" />}
      </div>

      <div className="min-w-0 flex-1 pb-6">
        <div className="mb-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-semibold text-slate-800">{entry.stageName}</span>
          </div>
          {entry.enteredAt && (
            <span className="shrink-0 text-xs text-cyan-600">
              {formatDateTimeLong(entry.enteredAt)}
            </span>
          )}
        </div>

        <Accordion type="multiple" className="space-y-2">
          {hasDocuments && (
            <AccordionItem value="document" className="rounded-lg border border-slate-200 px-3">
              <AccordionTrigger className="text-sm font-medium text-slate-600 hover:no-underline">
                {labels.DOCUMENT_SECTION}
              </AccordionTrigger>
              <AccordionContent className="pb-3">
                <div className="space-y-3">
                  {entry.documents.map((doc) => {
                    const uploadedFiles = doc.uploadedDocuments ?? [];
                    if (uploadedFiles.length === 0) return null;
                    return (
                      <div key={doc.documentType.id} className="space-y-1.5">
                        <p className="text-xs font-medium text-slate-700">
                          {doc.documentType.name}
                        </p>
                        {uploadedFiles.map((file) => (
                          <StageFileRow
                            key={file.id}
                            name={file.fileName}
                            size={file.fileSize}
                            url={file.url}
                          />
                        ))}
                      </div>
                    );
                  })}
                </div>
              </AccordionContent>
            </AccordionItem>
          )}

          {hasActivity && (
            <AccordionItem value="aktivitas" className="rounded-lg border border-slate-200 px-3">
              <AccordionTrigger className="text-sm font-medium text-slate-600 hover:no-underline">
                {labels.AKTIVITAS_SECTION}
              </AccordionTrigger>
              <AccordionContent className="pb-3">
                <div className="space-y-3">
                  {entry.activity?.description && (
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-slate-700">
                        {labels.DESCRIPTION_LABEL}
                        <span className="text-primary"> *</span>
                      </p>
                      <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
                        {entry.activity.description}
                      </div>
                    </div>
                  )}

                  {entry.activity?.documents && entry.activity.documents.length > 0 && (
                    <div className="space-y-1.5">
                      <p className="text-xs font-medium text-slate-700">
                        {labels.ATTACHMENT_LABEL}
                        <span className="text-primary"> *</span>
                      </p>
                      <div className="space-y-2">
                        {entry.activity.documents.map((doc) => (
                          <StageFileRow
                            key={doc.id}
                            name={doc.fileName}
                            size={doc.fileSize}
                            url={doc.url}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          )}
        </Accordion>
      </div>
    </div>
  );
}

interface ProspectStageHistoryModalProps {
  open: boolean;
  onClose: () => void;
  entries: StageHistoryEntry[];
}

export function ProspectStageHistoryModal({
  open,
  onClose,
  entries,
}: ProspectStageHistoryModalProps) {
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent
        showCloseButton
        className="flex max-h-[90vh] w-full max-w-150 flex-col gap-0 p-0 sm:max-w-150"
      >
        <VisuallyHidden.Root>
          <DialogTitle>{labels.TITLE}</DialogTitle>
        </VisuallyHidden.Root>

        <div className="flex items-center gap-3 border-b border-slate-200 px-6 py-4">
          <button
            type="button"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-slate-600 hover:bg-slate-100"
            onClick={onClose}
            aria-label="Kembali"
          >
            <ArrowLeft size={18} />
          </button>
          <span className="text-base font-semibold text-slate-900">{labels.TITLE}</span>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
          {entries.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-400">{labels.EMPTY}</p>
          ) : (
            <div>
              {entries.map((entry, idx) => (
                <StageHistoryEntryCard
                  key={entry.stage}
                  entry={entry}
                  isLast={idx === entries.length - 1}
                />
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
