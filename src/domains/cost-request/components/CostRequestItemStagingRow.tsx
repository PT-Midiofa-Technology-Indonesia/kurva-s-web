'use client';

import { useState } from 'react';
import { Button, Input } from '@/shared/components/atoms';
import { FileInput } from '@/shared/components/molecules/FileInput/FileInput';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { Label } from '@/shared/components/ui/label';
import { formatIDR } from '@/shared/utils/currency';
import {
  COST_REQUEST_ITEM_PROOF_MAX_FILES,
  COST_REQUEST_ITEM_PROOF_MAX_SIZE,
  COST_REQUEST_LABELS,
} from '../constants';
import type { CostRequestItemFormValues } from '../schemas';

interface CostRequestItemStagingRowProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (draft: CostRequestItemFormValues) => void;
}

function blankDraft(): CostRequestItemFormValues {
  return {
    description: '',
    receiptNumber: '',
    amount: 0,
    notes: '',
    proofFiles: [],
    existingProofs: [],
  };
}

export function CostRequestItemStagingRow({
  open,
  onOpenChange,
  onAdd,
}: CostRequestItemStagingRowProps) {
  const [draft, setDraft] = useState<CostRequestItemFormValues>(blankDraft());
  const [error, setError] = useState<string | null>(null);

  const handleAdd = () => {
    if (!draft.description.trim()) {
      setError('Deskripsi item wajib diisi');
      return;
    }
    if (!draft.amount || draft.amount <= 0) {
      setError(COST_REQUEST_LABELS.VALIDATION.AMOUNT_POSITIVE);
      return;
    }
    onAdd(draft);
    setDraft(blankDraft());
    setError(null);
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setDraft(blankDraft());
      setError(null);
    }
    onOpenChange(nextOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg! p-0">
        <DialogHeader className="border-b border-slate-100 px-6 py-4">
          <DialogTitle>{COST_REQUEST_LABELS.CREATE.ITEM_SECTION_TITLE}</DialogTitle>
        </DialogHeader>

        <div className="space-y-3 px-6 py-4">
          <Label className="text-sm font-medium text-slate-700">
            {COST_REQUEST_LABELS.CREATE.ITEM_SECTION_TITLE}
          </Label>

          <Input
            placeholder={COST_REQUEST_LABELS.CREATE.ITEM_DESCRIPTION}
            value={draft.description}
            onChange={(event) => setDraft((prev) => ({ ...prev, description: event.target.value }))}
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              placeholder={COST_REQUEST_LABELS.CREATE.RECEIPT_NUMBER}
              value={draft.receiptNumber}
              onChange={(event) =>
                setDraft((prev) => ({
                  ...prev,
                  receiptNumber: event.target.value,
                }))
              }
            />
            <Input
              type="text"
              inputMode="numeric"
              placeholder={COST_REQUEST_LABELS.CREATE.AMOUNT}
              value={draft.amount ? formatIDR(draft.amount) : ''}
              onChange={(event) => {
                const digitsOnly = event.target.value.replace(/\D/g, '');
                setDraft((prev) => ({
                  ...prev,
                  amount: Number(digitsOnly) || 0,
                }));
              }}
            />
          </div>

          <FileInput
            value={draft.proofFiles}
            onChange={(files) => setDraft((prev) => ({ ...prev, proofFiles: files }))}
            maxFiles={COST_REQUEST_ITEM_PROOF_MAX_FILES}
            maxSize={COST_REQUEST_ITEM_PROOF_MAX_SIZE}
          />

          {error && <p className="text-xs text-destructive">{error}</p>}
        </div>

        <DialogFooter className="px-6 py-4 mb-0">
          <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
            {COST_REQUEST_LABELS.CREATE.CANCEL_BUTTON}
          </Button>
          <Button type="button" onClick={handleAdd}>
            {COST_REQUEST_LABELS.CREATE.ADD_ITEM}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
