'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { Controller, useForm } from 'react-hook-form';

import { AsyncSelect, Button } from '@/shared/components/atoms';
import { DatePicker } from '@/shared/components/molecules';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { Textarea } from '@/shared/components/ui/textarea';
import { getFieldErrors } from '@/shared/lib/api-error';
import { parseDateString } from '@/shared/utils/format';
import { PAYROLL_DRAFT_LABELS, PERIOD_TYPE_OPTIONS } from '../constants';
import { type CreatePayrollDraftFormValues, createPayrollDraftSchema } from '../schemas';
import type { PayrollDraftSummary, PeriodeType } from '../types';

interface CreateDraftModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreatePayrollDraftFormValues) => Promise<PayrollDraftSummary | null>;
  isSubmitting?: boolean;
}

const DEFAULT_VALUES: CreatePayrollDraftFormValues = {
  periodType: 'monthly',
  periodStart: '',
  periodEnd: '',
  notes: '',
};

export function CreateDraftModal({ open, onClose, onSubmit, isSubmitting }: CreateDraftModalProps) {
  const form = useForm<CreatePayrollDraftFormValues>({
    resolver: zodResolver(createPayrollDraftSchema),
    defaultValues: DEFAULT_VALUES,
    mode: 'onChange',
  });
  const submitting = isSubmitting || form.formState.isSubmitting;

  const resetAndClose = () => {
    form.reset(DEFAULT_VALUES);
    onClose();
  };

  const handleSubmit = form.handleSubmit(async (data) => {
    try {
      const createdDraft = await onSubmit({
        ...data,
        notes: data.notes?.trim() || undefined,
      });
      if (!createdDraft) return;

      resetAndClose();
    } catch (error) {
      const fieldErrors = getFieldErrors(error);
      const fieldMap = {
        period_type: 'periodType',
        period_start: 'periodStart',
        period_end: 'periodEnd',
        notes: 'notes',
      } as const;

      for (const [apiField, formField] of Object.entries(fieldMap)) {
        const message = fieldErrors?.[apiField]?.[0];
        if (message) form.setError(formField, { type: 'server', message });
      }
    }
  });

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen && !submitting) resetAndClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{PAYROLL_DRAFT_LABELS.MODAL.TITLE}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="flex flex-col gap-4 py-4">
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1.5 block">
                {PAYROLL_DRAFT_LABELS.MODAL.FIELDS.PERIOD_TYPE}
              </label>
              <Controller
                name="periodType"
                control={form.control}
                render={({ field, fieldState }) => (
                  <>
                    <AsyncSelect
                      options={PERIOD_TYPE_OPTIONS}
                      value={field.value}
                      onChange={(value) => field.onChange(value as PeriodeType)}
                      isDisabled={submitting}
                    />
                    {fieldState.error?.message && (
                      <p className="mt-1 text-sm text-destructive">{fieldState.error.message}</p>
                    )}
                  </>
                )}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 mb-1.5 block">
                {PAYROLL_DRAFT_LABELS.MODAL.FIELDS.PERIOD_START}
              </label>
              <Controller
                name="periodStart"
                control={form.control}
                render={({ field, fieldState }) => (
                  <>
                    <DatePicker
                      placeholder={PAYROLL_DRAFT_LABELS.MODAL.FIELDS.PERIOD_START}
                      value={field.value ? parseDateString(field.value) : null}
                      onChange={(value) => {
                        const date = value && !('from' in value) ? value : null;
                        field.onChange(date ? format(date, 'yyyy-MM-dd') : '');
                      }}
                      disabledState={submitting}
                    />
                    {fieldState.error?.message && (
                      <p className="mt-1 text-sm text-destructive">{fieldState.error.message}</p>
                    )}
                  </>
                )}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 mb-1.5 block">
                {PAYROLL_DRAFT_LABELS.MODAL.FIELDS.PERIOD_END}
              </label>
              <Controller
                name="periodEnd"
                control={form.control}
                render={({ field, fieldState }) => (
                  <>
                    <DatePicker
                      placeholder={PAYROLL_DRAFT_LABELS.MODAL.FIELDS.PERIOD_END}
                      value={field.value ? parseDateString(field.value) : null}
                      onChange={(value) => {
                        const date = value && !('from' in value) ? value : null;
                        field.onChange(date ? format(date, 'yyyy-MM-dd') : '');
                      }}
                      disabledState={submitting}
                    />
                    {fieldState.error?.message && (
                      <p className="mt-1 text-sm text-destructive">{fieldState.error.message}</p>
                    )}
                  </>
                )}
              />
            </div>

            <div>
              <label
                htmlFor="payroll-draft-notes"
                className="text-sm font-medium text-slate-700 mb-1.5 block"
              >
                {PAYROLL_DRAFT_LABELS.MODAL.FIELDS.NOTES}
              </label>
              <Textarea
                id="payroll-draft-notes"
                {...form.register('notes')}
                rows={3}
                placeholder={PAYROLL_DRAFT_LABELS.MODAL.FIELDS.NOTES}
                disabled={submitting}
              />
              {form.formState.errors.notes?.message && (
                <p className="mt-1 text-sm text-destructive">
                  {form.formState.errors.notes.message}
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={resetAndClose} disabled={submitting}>
              {PAYROLL_DRAFT_LABELS.MODAL.CANCEL}
            </Button>
            <Button type="submit" disabled={!form.formState.isValid || submitting}>
              {PAYROLL_DRAFT_LABELS.MODAL.SUBMIT}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
