'use client';

import { format, parseISO } from 'date-fns';
import { Controller, type UseFormReturn } from 'react-hook-form';
import { Button } from '@/shared/components/atoms';
import { DatePicker } from '@/shared/components/molecules/DatePicker';
import { Label } from '@/shared/components/ui/label';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import type { PurchaseOrderRatingFormValues } from '../schemas/purchase-order-rating';
import type { PurchaseOrderRatingCategory } from '../types/purchase-order-rating';

const SCORE_OPTIONS = [
  { label: '1', value: '1' },
  { label: '2', value: '2' },
  { label: '3', value: '3' },
  { label: '4', value: '4' },
  { label: '5', value: '5' },
] as const;

interface PurchaseOrderRatingFormProps {
  form: UseFormReturn<PurchaseOrderRatingFormValues, any, any>;
  activeCategories: PurchaseOrderRatingCategory[];
  submitLabel: string;
  onCancel: () => void;
  onSubmit: (values: PurchaseOrderRatingFormValues) => void | Promise<void>;
  isSubmitting: boolean;
  isBlockedByEmployee: boolean;
  blockedMessage?: string | null;
}

function getCategoryScoreError(
  errors: PurchaseOrderRatingFormValues extends never ? never : unknown,
  index: number
) {
  const categoryErrors = (errors as { categoryScores?: Array<{ score?: { message?: string } }> })
    .categoryScores;
  return categoryErrors?.[index]?.score?.message;
}

export function PurchaseOrderRatingForm({
  form,
  activeCategories,
  submitLabel,
  onCancel,
  onSubmit,
  isSubmitting,
  isBlockedByEmployee,
  blockedMessage,
}: PurchaseOrderRatingFormProps) {
  const ratedAtError = form.formState.errors.ratedAt?.message;
  const categoryScoreBanner = (
    form.formState.errors.categoryScores as { message?: string } | undefined
  )?.message;
  const canSubmit = !isSubmitting && !isBlockedByEmployee && activeCategories.length > 0;

  return (
    <form className="flex h-full min-h-0 flex-col gap-5" onSubmit={form.handleSubmit(onSubmit)}>
      {(blockedMessage || isBlockedByEmployee) && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          {blockedMessage ?? 'Akun belum tertaut ke data employee.'}
        </div>
      )}

      {/* modal rating categories */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-slate-700">Tanggal rating</Label>
        <Controller
          control={form.control}
          name="ratedAt"
          render={({ field }) => (
            <DatePicker
              value={field.value ? parseISO(field.value) : null}
              onChange={(value) => {
                if (value instanceof Date) {
                  field.onChange(format(value, 'yyyy-MM-dd'));
                  return;
                }
                field.onChange('');
              }}
              maxDate={new Date()}
              clearable={false}
              showChevron
              disabledState={isBlockedByEmployee}
              placeholder="Pilih tanggal rating"
            />
          )}
        />
        {ratedAtError && <p className="text-xs text-red-600">{ratedAtError}</p>}
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h3 className="text-sm font-semibold text-slate-900">Kategori Rating</h3>
            <p className="text-xs text-slate-500">Pilih skor 1 sampai 5 untuk setiap kategori.</p>
          </div>
        </div>

        {categoryScoreBanner && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
            {categoryScoreBanner}
          </div>
        )}

        {activeCategories.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-200 px-4 py-6 text-sm text-slate-500">
            Belum ada kategori rating aktif.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 overflow-y-auto pr-1">
            {activeCategories.map((category, index) => {
              const scoreError = getCategoryScoreError(form.formState.errors, index);

              return (
                <div
                  key={category.id}
                  className="rounded-xl border border-slate-200 bg-slate-50 p-4"
                >
                  <div className="space-y-1.5">
                    <div className="space-y-0.5">
                      <p className="text-sm font-medium text-slate-900">{category.name}</p>
                      {category.description && (
                        <p className="text-xs text-slate-500">{category.description}</p>
                      )}
                    </div>

                    <Controller
                      control={form.control}
                      name={`categoryScores.${index}.score`}
                      render={({ field }) => (
                        <Select
                          value={String(field.value)}
                          onValueChange={(value) => field.onChange(Number(value))}
                          disabled={isBlockedByEmployee}
                        >
                          <SelectTrigger
                            aria-label={`${category.name} score`}
                            className="w-full bg-white"
                          >
                            <SelectValue placeholder="Pilih skor" />
                          </SelectTrigger>
                          <SelectContent position="popper" align="start" sideOffset={4}>
                            <SelectGroup>
                              {SCORE_OPTIONS.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      )}
                    />

                    {scoreError && <p className="text-xs text-red-600">{scoreError}</p>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="flex items-center justify-end gap-2 border-t pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Batal
        </Button>
        <Button type="submit" disabled={!canSubmit}>
          {isSubmitting ? 'Menyimpan...' : submitLabel}
        </Button>
      </div>
    </form>
  );
}
