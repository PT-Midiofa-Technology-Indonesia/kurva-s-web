'use client';

import { useState } from 'react';
import { Button } from '@/components/atoms';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { Input } from '@/shared/components/ui/input';
import { useSetBOQLimitBudget } from '../hooks/use-set-boq-limit-budget';

interface BOQLimitBudgetModalProps {
  open: boolean;
  onClose: () => void;
  projectId: string;
  estimatedValue: number;
  totalValue: number;
  onSuccess: () => void;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function BOQLimitBudgetModal({
  open,
  onClose,
  projectId,
  estimatedValue: _estimatedValue,
  totalValue,
  onSuccess,
}: BOQLimitBudgetModalProps) {
  const [limitBudgetPercentage, setLimitBudgetPercentage] = useState<string>('');
  const { mutateAsync: setLimitBudget, isPending } = useSetBOQLimitBudget();

  const handleSimpan = async () => {
    const value = parseFloat(limitBudgetPercentage);
    if (Number.isNaN(value) || value < 0 || value > 100) {
      return;
    }
    await setLimitBudget({
      projectId,
      payload: { limitBudgetPercentage: value },
    });
    onSuccess();
    handleClose();
  };

  const handleClose = () => {
    setLimitBudgetPercentage('');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent className="w-[430px] max-w-[430px] p-6 gap-4">
        <DialogHeader className="gap-2">
          <DialogTitle className="text-lg font-semibold text-slate-950">
            Set Limit Budget
          </DialogTitle>
          <DialogDescription className="text-sm font-normal text-slate-500">
            Atur persentase limit budget untuk project ini
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-slate-950">Limit Budget</label>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              min="0"
              max="100"
              step="0.01"
              value={limitBudgetPercentage}
              onChange={(e) => setLimitBudgetPercentage(e.target.value)}
              placeholder="0"
              className="flex-1"
            />
            <span className="text-sm font-medium text-slate-950">%</span>
            <span className="text-sm font-medium text-slate-950">
              dari {formatCurrency(totalValue)}
            </span>
          </div>
        </div>

        <DialogFooter className="gap-2 bg-white">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isPending}
            className="flex-1"
          >
            Batal
          </Button>
          <Button
            type="button"
            onClick={handleSimpan}
            disabled={isPending || !limitBudgetPercentage}
            className="flex-1"
          >
            Simpan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
