'use client';

import { FileText, Upload, X } from 'lucide-react';
import { useMemo, useRef } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { Button } from '@/shared/components/atoms';
import type { FormFieldConfig } from '@/shared/components/organisms/FormGenerator';
import { FormGenerator } from '@/shared/components/organisms/FormGenerator';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/shared/components/ui/drawer';
import { useTaxInvoiceStatuses } from '@/shared/hooks/use-enums';
import { formatFileSize } from '@/shared/utils/format';
import { PROCUREMENT_LABELS } from '../constants';
import { purchaseOrderInvoiceSchema } from '../schemas/purchase-order-invoice';
import type { PurchaseOrderDetail } from '../types/purchase-order-detail';
import type {
  PurchaseOrderInvoiceDocumentFile,
  PurchaseOrderInvoiceDocumentRequirement,
  PurchaseOrderInvoiceFormValues,
} from '../types/purchase-order-invoice';

interface PurchaseOrderInvoiceDrawerProps {
  open: boolean;
  onClose: () => void;
  detail: PurchaseOrderDetail;
  isSaving?: boolean;
  serverErrors?: Record<string, string[]>;
  onSubmit: (values: PurchaseOrderInvoiceFormValues) => void;
}

const FORM_ID = 'purchase-order-invoice-form';
const FILE_ACCEPT = '.pdf,.jpg,.jpeg,.png';
const MAX_FILE_SIZE = 5 * 1024 * 1024;

interface DocumentUploadFieldProps {
  label: string;
  required?: boolean;
  helperText: string;
  value: File[];
  onChange: (files: File[]) => void;
  existingFiles: {
    id: string;
    fileName: string;
    fileSize?: number | null;
    filePath: string;
  }[];
  onExistingFilesChange: (ids: string[]) => void;
  error?: string;
}

function DocumentUploadField({
  label,
  required,
  helperText,
  value,
  onChange,
  existingFiles,
  onExistingFilesChange,
  error,
}: DocumentUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    if (files.length > 0) {
      onChange([...value, ...files].slice(0, 5));
    }
    event.target.value = '';
  };

  const handleRemoveNewFile = (index: number) => {
    onChange(value.filter((_, fileIndex) => fileIndex !== index));
  };

  const handleRemoveExistingFile = (id: string) => {
    onExistingFilesChange(existingFiles.filter((file) => file.id !== id).map((file) => file.id));
  };

  return (
    <div className="border-t border-slate-200 py-4 first:border-t-0 first:pt-0 last:pb-0">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-700">
            {label}
            {required ? <span className="text-primary"> *</span> : null}
          </p>
          <p className="mt-0.5 text-xs text-slate-400">{helperText}</p>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          leftIcon={<Upload size={14} />}
          onClick={() => inputRef.current?.click()}
        >
          Browse file
        </Button>
      </div>

      <input
        ref={inputRef}
        type="file"
        multiple
        accept={FILE_ACCEPT}
        className="hidden"
        onChange={handleInputChange}
      />

      {[
        ...existingFiles.map((file) => ({ type: 'existing' as const, file })),
        ...value.map((file, index) => ({ type: 'new' as const, file, index })),
      ].map((entry) => (
        <div
          key={
            entry.type === 'existing'
              ? entry.file.id
              : `${entry.file.name}-${entry.index}-${entry.file.size}`
          }
          className="mt-2 rounded-lg border border-slate-200 bg-white p-3"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-500">
              <FileText size={20} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-slate-700">
                {entry.type === 'existing' ? entry.file.fileName : entry.file.name}
              </p>
              <p className="text-xs text-slate-400">
                {formatFileSize(
                  entry.type === 'existing' ? (entry.file.fileSize ?? undefined) : entry.file.size
                )}
              </p>
            </div>
            {entry.type === 'existing' ? (
              <button
                type="button"
                className="shrink-0 text-slate-400 hover:text-slate-600"
                aria-label={`Remove ${entry.file.fileName}`}
                onClick={() => handleRemoveExistingFile(entry.file.id)}
              >
                <X size={18} />
              </button>
            ) : (
              <button
                type="button"
                className="shrink-0 text-slate-400 hover:text-slate-600"
                aria-label={`Remove ${entry.file.name}`}
                onClick={() => handleRemoveNewFile(entry.index)}
              >
                <X size={18} />
              </button>
            )}
          </div>
        </div>
      ))}

      {error ? <p className="mt-2 text-sm text-destructive">{error}</p> : null}
    </div>
  );
}

function InvoiceDocumentsSection({
  documentRequirements,
  serverErrors,
}: {
  documentRequirements: PurchaseOrderInvoiceDocumentRequirement[];
  serverErrors?: Record<string, string[]>;
}) {
  const {
    control,
    setValue,
    formState: { errors },
  } = useFormContext<PurchaseOrderInvoiceFormValues>();
  const labels = PROCUREMENT_LABELS.PURCHASE_ORDER_DETAIL.INVOICE_DRAWER;

  if (documentRequirements.length === 0) return null;

  return (
    <section className="space-y-4 pt-2">
      <h3 className="text-base font-semibold text-slate-950">{labels.SECTIONS.DOCUMENTS}</h3>

      {documentRequirements.map((req, index) => {
        const uploadedFiles = req.uploadedDocuments ?? [];
        const fieldError =
          (errors.documents as any)?.[index]?.files?.message ||
          serverErrors?.[`documents.${index}`]?.[0] ||
          serverErrors?.[`documents.${index}.files`]?.[0];

        return (
          <Controller
            key={req.id || req.code || index}
            control={control}
            name={`documents.${index}.files`}
            render={({ field }) => (
              <DocumentUploadField
                label={req.name}
                required
                helperText={`${FILE_ACCEPT.replace(/\./g, '')} | Max ${formatFileSize(MAX_FILE_SIZE)}`}
                value={field.value ?? []}
                onChange={field.onChange}
                existingFiles={uploadedFiles.map((file: PurchaseOrderInvoiceDocumentFile) => ({
                  id: file.id,
                  fileName: file.fileName,
                  fileSize: file.fileSize,
                  filePath: file.filePath,
                }))}
                onExistingFilesChange={(ids) => {
                  setValue(`documents.${index}.existingIds`, ids, { shouldDirty: true });
                }}
                error={fieldError}
              />
            )}
          />
        );
      })}
    </section>
  );
}

export function PurchaseOrderInvoiceDrawer({
  open,
  onClose,
  detail,
  isSaving,
  serverErrors,
  onSubmit,
}: PurchaseOrderInvoiceDrawerProps) {
  const labels = PROCUREMENT_LABELS.PURCHASE_ORDER_DETAIL.INVOICE_DRAWER;
  const invoice = detail.invoice;
  const hasInvoice = invoice != null;

  const documentRequirements = useMemo(() => {
    const raw =
      detail.documentRequirements && detail.documentRequirements.length > 0
        ? detail.documentRequirements
        : invoice?.documentRequirements && invoice.documentRequirements.length > 0
          ? invoice.documentRequirements
          : [];

    return raw;
  }, [detail.documentRequirements, invoice?.documentRequirements]);

  const { data: taxInvoiceStatusOptions = [] } = useTaxInvoiceStatuses();

  const defaultValues = useMemo<PurchaseOrderInvoiceFormValues>(() => {
    const documents = documentRequirements.map((req) => ({
      documentTypeId: req.id,
      files: [],
      existingIds: (req.uploadedDocuments ?? []).map(
        (file: PurchaseOrderInvoiceDocumentFile) => file.id
      ),
    }));

    return {
      invoiceNumber: invoice?.invoiceNumber ?? '',
      invoiceDate: invoice?.invoiceDate ?? '',
      invoiceDueDate: invoice?.invoiceDueDate ?? '',
      invoiceAmount: invoice?.invoiceAmount ?? detail.grandTotal ?? detail.totalAmount ?? 0,
      taxInvoiceNumber: invoice?.taxInvoiceNumber ?? '',
      taxInvoiceDate: invoice?.taxInvoiceDate ?? '',
      taxInvoiceStatus: invoice?.taxInvoiceStatus ?? '',
      taxpayerNpwp: invoice?.taxpayerNpwp ?? '',
      taxes: (invoice?.taxes ?? []).map((tax) => ({ taxTypeId: tax.taxTypeId, rate: tax.rate })),
      documents,
    };
  }, [detail.grandTotal, detail.totalAmount, documentRequirements, invoice]);

  const fields = useMemo<FormFieldConfig<PurchaseOrderInvoiceFormValues>[]>(() => {
    return [
      {
        type: 'custom',
        colSpan: 12,
        content: (
          <h3 className="text-base font-semibold text-slate-950">{labels.SECTIONS.INVOICE}</h3>
        ),
      },
      {
        type: 'text',
        name: 'invoiceNumber',
        label: labels.FIELDS.INVOICE_NUMBER,
        placeholder: labels.PLACEHOLDERS.INVOICE_NUMBER,
        required: true,
        colSpan: 12,
      },
      {
        type: 'date',
        name: 'invoiceDate',
        label: labels.FIELDS.INVOICE_DATE,
        placeholder: labels.PLACEHOLDERS.INVOICE_DATE,
        required: true,
        colSpan: { base: 12, sm: 6 },
      },
      {
        type: 'date',
        name: 'invoiceDueDate',
        label: labels.FIELDS.INVOICE_DUE_DATE,
        placeholder: labels.PLACEHOLDERS.INVOICE_DUE_DATE,
        required: true,
        colSpan: { base: 12, sm: 6 },
      },
      {
        type: 'custom',
        colSpan: 12,
        content: (
          <h3 className="text-base font-semibold text-slate-950 pt-2">{labels.SECTIONS.TAX}</h3>
        ),
      },
      {
        type: 'text',
        name: 'taxInvoiceNumber',
        label: labels.FIELDS.TAX_INVOICE_NUMBER,
        placeholder: labels.PLACEHOLDERS.TAX_INVOICE_NUMBER,
        colSpan: 12,
      },
      {
        type: 'date',
        name: 'taxInvoiceDate',
        label: labels.FIELDS.TAX_INVOICE_DATE,
        placeholder: labels.PLACEHOLDERS.TAX_INVOICE_DATE,
        colSpan: 12,
      },
      {
        type: 'select',
        name: 'taxInvoiceStatus',
        label: labels.FIELDS.TAX_INVOICE_STATUS,
        placeholder: labels.PLACEHOLDERS.TAX_INVOICE_STATUS,
        options: taxInvoiceStatusOptions,
        colSpan: 12,
      },
      {
        type: 'text',
        name: 'taxpayerNpwp',
        label: labels.FIELDS.TAXPAYER_NPWP,
        placeholder: labels.PLACEHOLDERS.TAXPAYER_NPWP,
        colSpan: 12,
      },
      ...(documentRequirements.length > 0
        ? [
            {
              type: 'custom' as const,
              colSpan: 12 as const,
              content: (
                <InvoiceDocumentsSection
                  documentRequirements={documentRequirements}
                  serverErrors={serverErrors}
                />
              ),
            },
          ]
        : []),
    ];
  }, [documentRequirements, labels, serverErrors, taxInvoiceStatusOptions]);

  return (
    <Drawer open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()} direction="right">
      <DrawerContent className="inset-y-0! left-auto! right-0! mt-0! flex w-full max-w-lg flex-col rounded-l-xl! rounded-r-none! border-l! bg-white">
        <DrawerHeader className="border-b px-5 py-4">
          <div className="flex items-center justify-between gap-3">
            <DrawerTitle className="text-lg font-semibold text-slate-950">
              {hasInvoice ? labels.TITLE_EDIT : labels.TITLE_CREATE}
            </DrawerTitle>
            <DrawerClose asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={onClose}
              >
                <X className="h-4 w-4" />
              </Button>
            </DrawerClose>
          </div>
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto px-5 py-5">
          <FormGenerator<PurchaseOrderInvoiceFormValues>
            key={`${detail.id}-${open ? 'open' : 'closed'}`}
            id={FORM_ID}
            schema={purchaseOrderInvoiceSchema}
            fields={fields}
            defaultValues={defaultValues}
            onSubmit={onSubmit}
            externalErrors={serverErrors}
            mode="onChange"
          />
        </div>

        <DrawerFooter className="border-t px-5 py-4">
          <div className="flex w-full items-center justify-between gap-3">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSaving}>
              {labels.BUTTONS.CANCEL}
            </Button>
            <Button form={FORM_ID} type="submit" disabled={isSaving}>
              {isSaving
                ? labels.BUTTONS.SAVING
                : hasInvoice
                  ? labels.BUTTONS.SAVE
                  : labels.BUTTONS.CREATE}
            </Button>
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
