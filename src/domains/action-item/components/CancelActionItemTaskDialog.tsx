'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/shared/components/atoms';
// import { FileInput } from '@/shared/components/molecules'; // Evidence upload — requirement not confirmed yet, re-enable once clarified.
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { ACTION_ITEM_LABELS } from '../constants';

const labels = ACTION_ITEM_LABELS.CANCEL_TASK_DIALOG;

/** Matches the API contract: required, max 1000 characters. */
const REASON_MAX_LENGTH = 1000;

export interface CancelActionItemTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isLoading?: boolean;
  onConfirm: (reason: string, files: File[]) => void;
}

export function CancelActionItemTaskDialog({
  open,
  onOpenChange,
  isLoading,
  onConfirm,
}: CancelActionItemTaskDialogProps) {
  const [reason, setReason] = useState('');
  // Evidence upload is hidden for now — backend accepts cancel with or without
  // evidence and the requirement isn't confirmed, so `files` stays empty.
  // const [files, setFiles] = useState<File[]>([]);
  const files: File[] = [];

  useEffect(() => {
    if (!open) {
      setReason('');
      // setFiles([]);
    }
  }, [open]);

  const trimmedReason = reason.trim();
  const isOverLimit = trimmedReason.length > REASON_MAX_LENGTH;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{labels.TITLE}</DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Label htmlFor="cancel-task-reason">{labels.REASON_LABEL}</Label>
          <Textarea
            id="cancel-task-reason"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder={labels.REASON_PLACEHOLDER}
            className="min-h-24"
            maxLength={REASON_MAX_LENGTH}
          />
          {isOverLimit && <p className="text-sm text-red-600">{labels.REASON_MAX_LENGTH_ERROR}</p>}
        </div>
        {/* Evidence upload — requirement not confirmed yet, re-enable once clarified.
        <div className="space-y-2">
          <Label>{labels.EVIDENCE_LABEL}</Label>
          <FileInput
            value={files}
            onChange={setFiles}
            accept=".docx,.xls,.pdf,.jpeg,.jpg,.png"
            maxFiles={5}
            maxSize={5 * 1024 * 1024}
            disabled={isLoading}
          />
        </div>
        */}
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            {labels.CANCEL}
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={!trimmedReason || isOverLimit || isLoading}
            onClick={() => onConfirm(trimmedReason, files)}
          >
            {isLoading ? labels.SUBMITTING : labels.CONFIRM}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
