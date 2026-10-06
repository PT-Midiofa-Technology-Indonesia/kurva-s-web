'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/shared/components/atoms';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { DETAIL_MOM_LABELS } from '../constants';

const labels = DETAIL_MOM_LABELS.CANCEL_DIALOG;

export interface CancelMomDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isLoading?: boolean;
  onConfirm: (reason: string) => void;
}

export function CancelMomDialog({
  open,
  onOpenChange,
  isLoading,
  onConfirm,
}: CancelMomDialogProps) {
  const [reason, setReason] = useState('');

  useEffect(() => {
    if (!open) setReason('');
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{labels.TITLE}</DialogTitle>
          <DialogDescription>{labels.DESCRIPTION}</DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Label htmlFor="cancel-mom-reason">{labels.REASON_LABEL}</Label>
          <Textarea
            id="cancel-mom-reason"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder={labels.REASON_PLACEHOLDER}
            className="min-h-24"
          />
        </div>
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
            disabled={!reason.trim() || isLoading}
            onClick={() => onConfirm(reason.trim())}
          >
            {isLoading ? labels.SUBMITTING : labels.CONFIRM}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
