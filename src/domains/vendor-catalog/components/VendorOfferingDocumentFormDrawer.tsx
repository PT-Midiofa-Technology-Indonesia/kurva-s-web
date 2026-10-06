'use client';

import { X } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useWatch } from 'react-hook-form';
import { Button } from '@/components/atoms';
import type { FormFieldConfig } from '@/components/organisms/FormGenerator';
import { FormGenerator } from '@/components/organisms/FormGenerator';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/shared/components/ui/drawer';
import { COMMON_LABELS } from '@/shared/constants';
import { parseDateString } from '@/shared/utils/format';
import { noWhitespace } from '@/shared/utils/masks';
import { VENDOR_CATALOG_LABELS } from '../constants';
import { vendorOfferingDocumentSchema } from '../schemas';
import type { VendorOfferingDocument, VendorOfferingDocumentFormInput } from '../types';

function PeriodStartWatcher({
  onPeriodStartChange,
}: {
  onPeriodStartChange: (date: Date | undefined) => void;
}) {
  const periodStart = useWatch({ name: 'periodStart' });
  useEffect(() => {
    onPeriodStartChange(periodStart ? parseDateString(periodStart) : undefined);
  }, [periodStart, onPeriodStartChange]);
  return null;
}

export interface VendorOfferingDocumentFormDrawerProps {
  open: boolean;
  onClose: () => void;
  vendorId: string;
  vendorName: string;
  editItem?: VendorOfferingDocument | null;
  detailData?: VendorOfferingDocument | null;
  /** Comma-separated file extensions (e.g. "doc,xls,xlsx,pdf") from API offeringDocFileType */
  acceptFileTypes?: string;
  onSave: (payload: {
    vendorId: string;
    code: string;
    title: string;
    periodStart: string;
    periodEnd: string;
    description?: string;
    isActive: boolean;
    files: File[];
    existingIds: string[];
  }) => void;
  isSaving?: boolean;
  serverErrors?: Record<string, string[]>;
}

export function VendorOfferingDocumentFormDrawer({
  open,
  onClose,
  vendorId,
  vendorName,
  editItem,
  detailData,
  acceptFileTypes,
  onSave,
  isSaving,
  serverErrors,
}: VendorOfferingDocumentFormDrawerProps) {
  const isEdit = !!editItem;
  const currentItem = detailData ?? editItem ?? null;

  const [minEndDate, setMinEndDate] = useState<Date | undefined>(undefined);
  const onPeriodStartChange = useCallback((date: Date | undefined) => {
    setMinEndDate(date);
  }, []);

  const acceptExtensions = useMemo(() => {
    const raw = acceptFileTypes ?? currentItem?.mimeTypes;
    if (raw) {
      return raw
        .split(',')
        .map((ext) => `.${ext.trim()}`)
        .join(',');
    }
    return '.docx,.xls,.xlsx,.pdf,.jpeg,.jpg,.png';
  }, [acceptFileTypes, currentItem?.mimeTypes]);

  const fields: FormFieldConfig<VendorOfferingDocumentFormInput>[] = useMemo(
    () => [
      {
        type: 'custom',
        content: (
          <div className="rounded-lg bg-slate-50 p-3">
            <p className="text-sm font-medium text-slate-900">{vendorName}</p>
          </div>
        ),
        colSpan: 12,
      },
      {
        name: 'files',
        label: '',
        type: 'file-input',
        accept: acceptExtensions,
        maxFiles: 5,
        maxSize: 5 * 1024 * 1024,
        existingFiles: currentItem?.files?.map((file) => ({
          id: file.id,
          fileName: file.fileName,
          fileSize: file.fileSize,
          mimeType: file.mimeType,
          url: file.url,
        })),
        colSpan: 12,
      },
      {
        name: 'code',
        label: VENDOR_CATALOG_LABELS.OFFERING_DOCUMENT.DRAWER.FIELDS.CODE,
        type: 'text',
        placeholder: VENDOR_CATALOG_LABELS.OFFERING_DOCUMENT.DRAWER.PLACEHOLDERS.CODE,
        required: true,
        colSpan: 12,
        mask: noWhitespace,
      },
      {
        name: 'title',
        label: VENDOR_CATALOG_LABELS.OFFERING_DOCUMENT.DRAWER.FIELDS.TITLE,
        type: 'text',
        placeholder: VENDOR_CATALOG_LABELS.OFFERING_DOCUMENT.DRAWER.PLACEHOLDERS.TITLE,
        required: true,
        colSpan: 12,
      },
      {
        name: 'periodStart',
        label: VENDOR_CATALOG_LABELS.OFFERING_DOCUMENT.DRAWER.FIELDS.PERIOD_START,
        type: 'date',
        placeholder: VENDOR_CATALOG_LABELS.OFFERING_DOCUMENT.DRAWER.PLACEHOLDERS.PERIOD_START,
        required: true,
        colSpan: 6,
      },
      {
        name: 'periodEnd',
        label: VENDOR_CATALOG_LABELS.OFFERING_DOCUMENT.DRAWER.FIELDS.PERIOD_END,
        type: 'date',
        placeholder: VENDOR_CATALOG_LABELS.OFFERING_DOCUMENT.DRAWER.PLACEHOLDERS.PERIOD_END,
        required: true,
        colSpan: 6,
        minDate: minEndDate,
      },
      {
        name: 'description',
        label: VENDOR_CATALOG_LABELS.OFFERING_DOCUMENT.DRAWER.FIELDS.DESCRIPTION,
        type: 'textarea',
        placeholder: VENDOR_CATALOG_LABELS.OFFERING_DOCUMENT.DRAWER.PLACEHOLDERS.DESCRIPTION,
        rows: 3,
        colSpan: 12,
      },
      {
        name: 'isActive',
        label: VENDOR_CATALOG_LABELS.OFFERING_DOCUMENT.DRAWER.FIELDS.STATUS,
        type: 'switch',
        stateActiveLabel: COMMON_LABELS.STATUS.ACTIVE,
        stateInactiveLabel: COMMON_LABELS.STATUS.INACTIVE,
        required: true,
        colSpan: 12,
      },
      {
        type: 'custom',
        content: <PeriodStartWatcher onPeriodStartChange={onPeriodStartChange} />,
        colSpan: 12,
      },
    ],
    [vendorName, currentItem, minEndDate, onPeriodStartChange, acceptExtensions]
  );

  const handleSubmit = (data: VendorOfferingDocumentFormInput) => {
    onSave({
      vendorId,
      code: data.code,
      title: data.title,
      periodStart: data.periodStart,
      periodEnd: data.periodEnd,
      description: data.description || undefined,
      isActive: data.isActive,
      files: data.files,
      existingIds: data.files__existingIds,
    });
  };

  const handleCancel = () => {
    onClose();
  };

  const title = isEdit
    ? VENDOR_CATALOG_LABELS.OFFERING_DOCUMENT.DRAWER.EDIT_TITLE
    : VENDOR_CATALOG_LABELS.OFFERING_DOCUMENT.DRAWER.ADD_TITLE;

  const defaultValues: VendorOfferingDocumentFormInput = useMemo(
    () => ({
      files: [],
      files__existingIds: currentItem?.files?.map((file) => file.id) ?? [],
      code: currentItem?.code ?? '',
      title: currentItem?.title ?? '',
      periodStart: currentItem?.periodStart ?? '',
      periodEnd: currentItem?.periodEnd ?? '',
      description: currentItem?.description ?? '',
      isActive: currentItem?.isActive ?? true,
    }),
    [currentItem]
  );

  return (
    <Drawer open={open} onOpenChange={(v) => !v && handleCancel()} direction="right">
      <DrawerContent className="w-lg max-w-lg inset-y-0! right-0! left-auto! mt-0! rounded-l-xl! rounded-r-none! border-l! flex flex-col">
        <DrawerHeader className="pb-2">
          <div className="flex items-center justify-between">
            <DrawerTitle className="text-lg font-semibold text-[#0A0A0A]">{title}</DrawerTitle>
            <DrawerClose asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={handleCancel}
              >
                <X className="h-4 w-4" />
              </Button>
            </DrawerClose>
          </div>
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto px-4">
          <FormGenerator
            key={open ? (editItem?.id ?? 'new') : 'closed'}
            id="vendor-offering-document-form"
            schema={vendorOfferingDocumentSchema}
            fields={fields}
            onSubmit={handleSubmit}
            defaultValues={defaultValues}
            className="content-start"
            externalErrors={serverErrors}
          />
        </div>

        <DrawerFooter className="border-t px-4 py-4">
          <Button type="submit" form="vendor-offering-document-form" disabled={isSaving}>
            {isSaving
              ? VENDOR_CATALOG_LABELS.OFFERING_DOCUMENT.DRAWER.BUTTONS.SAVING
              : VENDOR_CATALOG_LABELS.OFFERING_DOCUMENT.DRAWER.BUTTONS.SAVE}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleCancel}
            disabled={isSaving}
          >
            {VENDOR_CATALOG_LABELS.OFFERING_DOCUMENT.DRAWER.BUTTONS.CANCEL}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
