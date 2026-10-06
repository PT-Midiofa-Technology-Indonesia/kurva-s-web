'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Trash2, Upload } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useMemo, useRef } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { AsyncSelect, Button, Input, InputCurrency } from '@/shared/components/atoms';
import { DatePicker } from '@/shared/components/molecules';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog';
import { Textarea } from '@/shared/components/ui/textarea';
import { formatCurrencyIDR, formatFileSize } from '@/shared/utils/format';

const FORM_ID = 'payment-execution-form';

const paymentExecutionFormSchema = z
  .object({
    paymentDate: z.date().optional(),
    amount: z.number().min(0, 'Amount tidak boleh kurang dari 0'),
    paymentMethod: z.string().min(1, 'Payment method wajib dipilih'),
    transferVia: z.string().optional(),
    checkNumber: z.string().optional(),
    checkIssueDate: z.date().optional(),
    checkEffectiveDate: z.date().optional(),
    notes: z.string().max(500, 'Maksimal 500 karakter').optional(),
  })
  .superRefine((values, ctx) => {
    if (values.paymentMethod === 'transfer' && !values.transferVia?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Transfer via wajib diisi',
        path: ['transferVia'],
      });
    }

    if (values.paymentMethod === 'giro') {
      if (!values.checkNumber?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Nomor giro/cek wajib diisi',
          path: ['checkNumber'],
        });
      }

      if (!values.checkIssueDate) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Tanggal terbit wajib diisi',
          path: ['checkIssueDate'],
        });
      }

      if (!values.checkEffectiveDate) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Tanggal efektif wajib diisi',
          path: ['checkEffectiveDate'],
        });
      }
    }
  });

export type PaymentExecutionFormValues = z.infer<typeof paymentExecutionFormSchema>;

export interface PaymentExecutionModalFile {
  key: string;
  name: string;
  size: number;
  url?: string;
}

export interface PaymentExecutionModalLabels {
  title: string;
  submit: string;
  processing: string;
  cancel: string;
  paymentDate: string;
  paymentMethod: string;
  paymentAmount: string;
  totalAmount: string;
  transferVia: string;
  transferViaPlaceholder: string;
  checkNumber: string;
  checkNumberPlaceholder: string;
  checkIssueDate: string;
  checkEffectiveDate: string;
  notes: string;
  notesPlaceholder: string;
  paymentProof: string;
  dragDrop: string;
  browseFiles: string;
  removeFile: string;
}

export interface PaymentExecutionModalProps {
  open: boolean;
  title?: string;
  sourceTypeLabel: string;
  sourceCode: string;
  amount: number;
  labels: PaymentExecutionModalLabels;
  paymentMethodOptions: Array<{ value: string; label: string }>;
  openAmountEditable?: boolean;
  requireProof?: boolean;
  uploadHint?: string;
  displayFiles?: PaymentExecutionModalFile[];
  isLoadingFiles?: boolean;
  isPending?: boolean;
  onClose: () => void;
  onFileSelect?: (file: File) => void;
  onRemoveFile?: (file: PaymentExecutionModalFile) => void;
  onSubmit: (values: PaymentExecutionFormValues) => Promise<void> | void;
}

function isPreviewableImage(fileName: string) {
  return /\.(png|jpe?g|webp|gif)$/i.test(fileName);
}

function FilePreview({ file }: { file: PaymentExecutionModalFile }) {
  if (file.url && isPreviewableImage(file.name)) {
    return (
      <div className="relative h-12 w-12 overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
        <Image src={file.url} alt={file.name} fill className="object-cover" unoptimized />
      </div>
    );
  }

  return (
    <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-500">
      <Upload className="h-4 w-4" />
    </div>
  );
}

export function PaymentExecutionModal({
  open,
  title,
  sourceTypeLabel,
  sourceCode,
  amount,
  labels,
  paymentMethodOptions,
  openAmountEditable = false,
  requireProof = false,
  uploadHint = 'docx, xls, pdf, jpeg, jpg, png (max 5 files, up to 5MB each)',
  displayFiles = [],
  isLoadingFiles = false,
  isPending = false,
  onClose,
  onFileSelect,
  onRemoveFile,
  onSubmit,
}: PaymentExecutionModalProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<PaymentExecutionFormValues>({
    resolver: zodResolver(paymentExecutionFormSchema),
    defaultValues: {
      paymentDate: new Date(),
      amount,
      paymentMethod: '',
      transferVia: '',
      checkNumber: '',
      checkIssueDate: undefined,
      checkEffectiveDate: undefined,
      notes: '',
    },
  });

  useEffect(() => {
    if (!open) return;

    reset({
      paymentDate: new Date(),
      amount,
      paymentMethod: '',
      transferVia: '',
      checkNumber: '',
      checkIssueDate: undefined,
      checkEffectiveDate: undefined,
      notes: '',
    });
  }, [open, amount, reset]);

  const paymentMethod = watch('paymentMethod');
  const isTransfer = paymentMethod === 'transfer';
  const isGiro = paymentMethod === 'giro' || paymentMethod === 'check';

  useEffect(() => {
    if (!isTransfer) {
      setValue('transferVia', '');
    }

    if (!isGiro) {
      setValue('checkNumber', '');
      setValue('checkIssueDate', undefined);
      setValue('checkEffectiveDate', undefined);
    }
  }, [isTransfer, isGiro, setValue]);

  const normalizedPaymentMethodOptions = useMemo(
    () =>
      paymentMethodOptions.map((option) => ({
        ...option,
        value: option.value === 'check' ? 'giro' : option.value,
      })),
    [paymentMethodOptions]
  );

  return (
    <Dialog open={open} onOpenChange={(value) => !value && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto border-0 p-0 sm:max-w-190">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle className="text-2xl font-semibold text-slate-950">
            {title ?? labels.title}
          </DialogTitle>
        </DialogHeader>

        <form id={FORM_ID} onSubmit={handleSubmit(onSubmit)} className="space-y-6 px-6 pb-6">
          <div className="grid gap-4 rounded-2xl border border-teal-200 bg-teal-50 p-5 sm:grid-cols-2">
            <div>
              <p className="text-sm text-slate-500">{sourceTypeLabel}</p>
              <p className="mt-1 text-lg font-semibold text-teal-600">{sourceCode}</p>
            </div>
            <div className="sm:text-right">
              <p className="text-sm text-slate-500">{labels.totalAmount}</p>
              <p className="mt-1 text-lg font-semibold text-teal-600">
                {formatCurrencyIDR(amount)}
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 after:ml-0.5 after:text-primary after:content-['*']">
                {labels.paymentDate}
              </label>
              <Controller
                control={control}
                name="paymentDate"
                render={({ field }) => (
                  <DatePicker
                    mode="single"
                    value={field.value ?? null}
                    onChange={(value) => field.onChange(value instanceof Date ? value : undefined)}
                    className="w-full rounded-xl border-slate-200"
                    showChevron={false}
                  />
                )}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 after:ml-0.5 after:text-primary after:content-['*']">
                {labels.paymentMethod}
              </label>
              <Controller
                control={control}
                name="paymentMethod"
                render={({ field }) => (
                  <AsyncSelect
                    className="w-full"
                    options={normalizedPaymentMethodOptions}
                    value={field.value || null}
                    onChange={(value) =>
                      field.onChange(Array.isArray(value) ? value[0] : value || '')
                    }
                    isSearchable={false}
                    isClearable={false}
                    placeholder={labels.paymentMethod}
                  />
                )}
              />
              {errors.paymentMethod && (
                <p className="text-sm text-red-500">{errors.paymentMethod.message}</p>
              )}
            </div>
          </div>

          {isTransfer && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 after:ml-0.5 after:text-primary after:content-['*']">
                {labels.transferVia}
              </label>
              <Controller
                control={control}
                name="transferVia"
                render={({ field }) => (
                  <Input
                    {...field}
                    value={field.value ?? ''}
                    placeholder={labels.transferViaPlaceholder}
                    className="rounded-xl"
                  />
                )}
              />
              {errors.transferVia && (
                <p className="text-sm text-red-500">{errors.transferVia.message}</p>
              )}
            </div>
          )}

          {isGiro && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <label className="text-sm font-medium text-slate-700 after:ml-0.5 after:text-primary after:content-['*']">
                  {labels.checkNumber}
                </label>
                <Controller
                  control={control}
                  name="checkNumber"
                  render={({ field }) => (
                    <Input
                      {...field}
                      value={field.value ?? ''}
                      placeholder={labels.checkNumberPlaceholder}
                      className="rounded-xl"
                    />
                  )}
                />
                {errors.checkNumber && (
                  <p className="text-sm text-red-500">{errors.checkNumber.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 after:ml-0.5 after:text-primary after:content-['*']">
                  {labels.checkIssueDate}
                </label>
                <Controller
                  control={control}
                  name="checkIssueDate"
                  render={({ field }) => (
                    <DatePicker
                      mode="single"
                      value={field.value ?? null}
                      onChange={(value) =>
                        field.onChange(value instanceof Date ? value : undefined)
                      }
                      className="w-full rounded-xl border-slate-200"
                      showChevron={false}
                    />
                  )}
                />
                {errors.checkIssueDate && (
                  <p className="text-sm text-red-500">{errors.checkIssueDate.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 after:ml-0.5 after:text-primary after:content-['*']">
                  {labels.checkEffectiveDate}
                </label>
                <Controller
                  control={control}
                  name="checkEffectiveDate"
                  render={({ field }) => (
                    <DatePicker
                      mode="single"
                      value={field.value ?? null}
                      onChange={(value) =>
                        field.onChange(value instanceof Date ? value : undefined)
                      }
                      className="w-full rounded-xl border-slate-200"
                      showChevron={false}
                    />
                  )}
                />
                {errors.checkEffectiveDate && (
                  <p className="text-sm text-red-500">{errors.checkEffectiveDate.message}</p>
                )}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 after:ml-0.5 after:text-primary after:content-['*']">
              {labels.paymentAmount}
            </label>
            <Controller
              control={control}
              name="amount"
              render={({ field }) => (
                <InputCurrency
                  value={field.value}
                  onChange={(value) => field.onChange(value ?? 0)}
                  currency="Rp"
                  prefix="Rp"
                  disabled={!openAmountEditable}
                  className="rounded-xl"
                />
              )}
            />
          </div>

          {requireProof && (
            <div className="space-y-3">
              <label className="text-sm font-medium text-slate-700 after:ml-0.5 after:text-primary after:content-['*']">
                {labels.paymentProof}
              </label>
              <button
                type="button"
                className="flex w-full cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-8 text-center hover:bg-slate-50"
                onClick={() => inputRef.current?.click()}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-600">
                  <Upload className="h-5 w-5" />
                </div>
                <p className="mt-4 text-sm font-medium text-slate-700">{labels.dragDrop}</p>
                <p className="mt-1 text-xs text-slate-400">{uploadHint}</p>
                <div className="mt-4 inline-flex h-9 items-center rounded-xl border border-input px-4 text-sm font-medium text-foreground opacity-50">
                  {labels.browseFiles}
                </div>
              </button>
              <input
                ref={inputRef}
                type="file"
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  event.target.value = '';
                  if (!file) return;
                  onFileSelect?.(file);
                }}
                aria-hidden
              />

              {isLoadingFiles ? (
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading document requirements...
                </div>
              ) : null}

              {displayFiles.map((file) => (
                <div key={file.key} className="rounded-2xl border border-slate-200 bg-white p-3">
                  <div className="flex items-center gap-3">
                    <FilePreview file={file} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-slate-700">{file.name}</p>
                      <p className="text-xs text-slate-400">{formatFileSize(file.size)}</p>
                    </div>
                    <button
                      type="button"
                      className="text-red-500 hover:text-red-600"
                      aria-label={labels.removeFile}
                      onClick={() => onRemoveFile?.(file)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">{labels.notes}</label>
            <Controller
              control={control}
              name="notes"
              render={({ field }) => (
                <Textarea
                  {...field}
                  value={field.value ?? ''}
                  placeholder={labels.notesPlaceholder}
                  className="min-h-28 rounded-xl"
                />
              )}
            />
            {errors.notes && <p className="text-sm text-red-500">{errors.notes.message}</p>}
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isPending}
              className="rounded-xl"
            >
              {labels.cancel}
            </Button>
            <Button
              type="submit"
              form={FORM_ID}
              disabled={isPending}
              className="rounded-xl bg-teal-600 text-white hover:bg-teal-700"
            >
              {isPending ? labels.processing : labels.submit}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
