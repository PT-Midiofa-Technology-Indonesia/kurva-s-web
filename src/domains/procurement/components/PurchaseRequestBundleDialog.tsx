'use client';

import { useState } from 'react';
import { Button } from '@/components/atoms/Button';
import { Checkbox } from '@/components/atoms/Checkbox';
import { Input } from '@/components/atoms/Input';
import { Switch } from '@/components/atoms/Switch';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useCreatePurchaseRequestBundle } from '../hooks/use-create-purchase-request-bundle';

type PurchaseRequestCostCategory = 'material' | 'equipment' | 'manpower';

const CATEGORY_OPTIONS: { value: PurchaseRequestCostCategory; label: string }[] = [
  { value: 'material', label: 'Material' },
  { value: 'equipment', label: 'Jasa Penyewaan' },
  { value: 'manpower', label: 'Jasa Pengerjaan' },
];

type CategoryState = Record<PurchaseRequestCostCategory, boolean>;

const EMPTY_CATEGORIES: CategoryState = { material: false, equipment: false, manpower: false };

export interface PurchaseRequestBundleDialogProps {
  boqItemId: string | null;
  projectId: string;
  companyId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: () => void;
}

export function PurchaseRequestBundleDialog({
  boqItemId,
  projectId,
  companyId,
  open,
  onOpenChange,
  onCreated,
}: PurchaseRequestBundleDialogProps) {
  const { mutateAsync, isPending } = useCreatePurchaseRequestBundle();
  const [dateRequired, setDateRequired] = useState('');
  const [categories, setCategories] = useState<CategoryState>(EMPTY_CATEGORIES);

  const allChecked = CATEGORY_OPTIONS.every((c) => categories[c.value]);
  const someChecked = CATEGORY_OPTIONS.some((c) => categories[c.value]);
  const canSubmit = !!boqItemId && dateRequired.trim().length > 0 && someChecked;

  const handleClose = () => {
    setDateRequired('');
    setCategories(EMPTY_CATEGORIES);
    onOpenChange(false);
  };

  const handleToggleAll = (checked: boolean) => {
    setCategories({ material: checked, equipment: checked, manpower: checked });
  };

  const handleSubmit = async () => {
    if (!canSubmit || !boqItemId) return;
    const selectedCategories = CATEGORY_OPTIONS.filter((c) => categories[c.value]).map(
      (c) => c.value
    );
    await mutateAsync({
      companyId,
      projectId,
      boqItemId,
      categories: selectedCategories,
      dateRequired,
    });
    onCreated?.();
    handleClose();
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent className="w-130 max-w-130 p-6 gap-4">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-slate-950">
            Create Bundle PR
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-slate-950" htmlFor="bundle-pr-date">
            Date Required
          </label>
          <Input
            id="bundle-pr-date"
            type="date"
            value={dateRequired}
            onChange={(e) => setDateRequired(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-end">
            <Switch
              checked={allChecked}
              onCheckedChange={handleToggleAll}
              label="Pilih semua"
              labelPosition="right"
            />
          </div>
          <div className="flex items-center gap-6">
            {CATEGORY_OPTIONS.map((c) => (
              <Checkbox
                key={c.value}
                label={c.label}
                checked={categories[c.value]}
                onCheckedChange={(checked) =>
                  setCategories((prev) => ({ ...prev, [c.value]: !!checked }))
                }
              />
            ))}
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
            onClick={handleSubmit}
            disabled={!canSubmit || isPending}
            className="flex-1"
          >
            {isPending ? 'Menyimpan...' : 'Submit'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default PurchaseRequestBundleDialog;
