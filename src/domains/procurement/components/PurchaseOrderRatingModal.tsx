'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog';
import { getErrorMessage, getFieldErrors } from '@/shared/lib/api-error';
import { useSavePurchaseOrderRating } from '../hooks/use-save-purchase-order-rating';
import type { PurchaseOrderRatingFormValues } from '../schemas/purchase-order-rating';
import { createPurchaseOrderRatingSchema } from '../schemas/purchase-order-rating';
import type {
  PurchaseOrderRatingCategory,
  PurchaseOrderRatingRecord,
} from '../types/purchase-order-rating';
import { PurchaseOrderRatingForm } from './PurchaseOrderRatingForm';

interface PurchaseOrderRatingModalProps {
  open: boolean;
  purchaseOrderId: string;
  vendorId: string;
  vendorName: string;
  activeCategories: PurchaseOrderRatingCategory[];
  existingRating: PurchaseOrderRatingRecord | null;
  isBlockedByEmployee: boolean;
  onClose: () => void;
  onSaved?: () => void;
}

function buildDefaultValues(
  activeCategories: PurchaseOrderRatingCategory[],
  existingRating: PurchaseOrderRatingRecord | null
): PurchaseOrderRatingFormValues {
  const ratedAt = existingRating?.ratedAt
    ? existingRating.ratedAt.slice(0, 10)
    : format(new Date(), 'yyyy-MM-dd');
  const scoreByCategoryId = new Map(
    existingRating?.scores.map((score) => [score.categoryId, score.score]) ?? []
  );

  return {
    ratedAt,
    overallNote: existingRating?.note ?? null,
    categoryScores: activeCategories.map((category) => ({
      note: existingRating?.scores.find((score) => score.categoryId === category.id)?.note ?? null,
      categoryId: category.id,
      score: scoreByCategoryId.get(category.id) ?? 1,
    })),
  };
}

export function PurchaseOrderRatingModal({
  open,
  purchaseOrderId,
  vendorId,
  vendorName,
  activeCategories,
  existingRating,
  isBlockedByEmployee,
  onClose,
  onSaved,
}: PurchaseOrderRatingModalProps) {
  const [serverMessage, setServerMessage] = useState<string | null>(null);
  const schema = useMemo(
    () => createPurchaseOrderRatingSchema(activeCategories.map((category) => category.id)),
    [activeCategories]
  );

  const defaultValues = useMemo(
    () => buildDefaultValues(activeCategories, existingRating),
    [activeCategories, existingRating]
  );
  const savePurchaseOrderRatingMutation = useSavePurchaseOrderRating(purchaseOrderId, vendorId);

  const form = useForm<PurchaseOrderRatingFormValues>({
    resolver: zodResolver(schema) as any,
    defaultValues,
    mode: 'onSubmit',
  });

  useEffect(() => {
    if (!open) {
      setServerMessage(null);
      return;
    }
    form.reset(defaultValues);
    setServerMessage(null);
  }, [defaultValues, form, open]);

  const handleSubmit = async (values: PurchaseOrderRatingFormValues) => {
    try {
      setServerMessage(null);
      await savePurchaseOrderRatingMutation.mutateAsync(values);
      onSaved?.();
      onClose();
    } catch (error) {
      const fieldErrors = getFieldErrors(error);
      if (fieldErrors?.ratedAt?.length) {
        form.setError('ratedAt', {
          type: 'server',
          message: fieldErrors.ratedAt[0],
        });
      }

      const categoryMessage = fieldErrors?.categoryScores?.[0];
      const vendorMessage = fieldErrors?.vendor?.[0];
      const fallbackMessage = getErrorMessage(error);

      if (categoryMessage || vendorMessage) {
        setServerMessage(categoryMessage ?? vendorMessage ?? fallbackMessage);
        return;
      }

      setServerMessage(fallbackMessage);
    }
  };

  const title = existingRating ? 'Ubah Rating' : 'Beri Rating';

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <DialogContent className="flex max-h-[90vh] w-full flex-col overflow-hidden p-6 sm:max-w-3xl">
        <DialogHeader className="shrink-0 space-y-1">
          <DialogTitle className="text-lg font-semibold text-slate-950">{title}</DialogTitle>
          <p className="text-sm text-slate-500">{vendorName}</p>
        </DialogHeader>

        <PurchaseOrderRatingForm
          form={form}
          activeCategories={activeCategories}
          submitLabel={title}
          onCancel={onClose}
          onSubmit={handleSubmit}
          isSubmitting={form.formState.isSubmitting || savePurchaseOrderRatingMutation.isPending}
          isBlockedByEmployee={isBlockedByEmployee}
          blockedMessage={serverMessage}
        />
      </DialogContent>
    </Dialog>
  );
}

export type { PurchaseOrderRatingModalProps };
