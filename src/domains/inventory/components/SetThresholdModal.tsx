'use client';

import { TriangleAlert } from 'lucide-react';
import { useMemo } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { Button } from '@/components/atoms';
import type { FormFieldConfig } from '@/components/organisms/FormGenerator';
import { FormGenerator } from '@/components/organisms/FormGenerator';
import { Badge } from '@/shared/components/ui';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog';
import { STOCK_MONITORING_LABELS } from '../constants';
import { useUpdateStockThreshold } from '../hooks/use-update-stock-threshold';
import type { SetThresholdInput } from '../schemas';
import { setThresholdSchema } from '../schemas';
import type { StockMaterialListItem } from '../types';

/**
 * Live soft validation — min > max is allowed to be saved, so this warns
 * rather than blocking. Lives inside the form so it can watch both fields.
 */
function ThresholdWarning() {
  const { control } = useFormContext();
  const [min, max] = useWatch({ control, name: ['minThreshold', 'maxThreshold'] });

  const isInconsistent =
    typeof min === 'number' &&
    typeof max === 'number' &&
    !Number.isNaN(min) &&
    !Number.isNaN(max) &&
    min > max;

  if (!isInconsistent) return null;

  return (
    <div className="flex gap-2 rounded-lg bg-yellow-50 p-3 text-yellow-800">
      <TriangleAlert className="h-4 w-4 shrink-0 mt-0.5" />
      <p className="text-xs">{STOCK_MONITORING_LABELS.THRESHOLD.WARNING_INCONSISTENT}</p>
    </div>
  );
}

interface SetThresholdModalProps {
  open: boolean;
  onClose: () => void;
  item: StockMaterialListItem | null;
  companyId?: string;
}

export function SetThresholdModal({ open, onClose, item, companyId }: SetThresholdModalProps) {
  const { mutate: updateThreshold, isPending } = useUpdateStockThreshold(companyId);

  const fields: FormFieldConfig<SetThresholdInput>[] = useMemo(
    () => [
      {
        name: 'minThreshold',
        label: STOCK_MONITORING_LABELS.THRESHOLD.FIELDS.MIN,
        type: 'number',
        placeholder: STOCK_MONITORING_LABELS.THRESHOLD.PLACEHOLDERS.MIN,
        colSpan: 6,
      },
      {
        name: 'maxThreshold',
        label: STOCK_MONITORING_LABELS.THRESHOLD.FIELDS.MAX,
        type: 'number',
        placeholder: STOCK_MONITORING_LABELS.THRESHOLD.PLACEHOLDERS.MAX,
        colSpan: 6,
      },
      {
        type: 'custom',
        content: <ThresholdWarning />,
        colSpan: 12,
      },
    ],
    []
  );

  const handleSubmit = (data: SetThresholdInput) => {
    if (!item) return;
    const parsed = setThresholdSchema.parse(data);
    updateThreshold(
      { id: item.id, payload: parsed },
      {
        onSuccess: () => onClose(),
      }
    );
  };

  return (
    <Dialog key={item?.id ?? 'closed'} open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader className="gap-1.5">
          <div className="flex items-center gap-2">
            {item && <Badge variant="secondary">{item.code}</Badge>}
            <span className="text-sm font-medium text-slate-700">{item?.name}</span>
          </div>
          <DialogTitle className="text-base font-semibold">
            {STOCK_MONITORING_LABELS.THRESHOLD.TITLE}
          </DialogTitle>
        </DialogHeader>

        <FormGenerator
          id="set-threshold-form"
          schema={setThresholdSchema}
          fields={fields}
          onSubmit={handleSubmit}
          defaultValues={{
            minThreshold: item?.minThreshold ?? null,
            maxThreshold: item?.maxThreshold ?? null,
          }}
          className="content-start"
        />

        <div className="flex items-center gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={onClose}
            disabled={isPending}
          >
            {STOCK_MONITORING_LABELS.THRESHOLD.BUTTONS.CANCEL}
          </Button>
          <Button type="submit" form="set-threshold-form" className="flex-1" disabled={isPending}>
            {isPending
              ? STOCK_MONITORING_LABELS.THRESHOLD.BUTTONS.SAVING
              : STOCK_MONITORING_LABELS.THRESHOLD.BUTTONS.SAVE}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
