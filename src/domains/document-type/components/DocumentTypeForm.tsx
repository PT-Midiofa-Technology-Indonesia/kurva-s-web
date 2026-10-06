'use client';

import { useMemo } from 'react';
import { useFormContext } from 'react-hook-form';
import { Button } from '@/components/atoms';
import { FormCard } from '@/components/molecules';
import { FormGenerator } from '@/components/organisms/FormGenerator';
import type { FormFieldConfig } from '@/shared/components/organisms/FormGenerator';
import { noWhitespace } from '@/shared/utils/masks';
import type { CreateDocumentTypePayload } from '../api/create-document-type';
import type { UpdateDocumentTypePayload } from '../api/update-document-type';
import {
  DOCUMENT_TYPE_LABELS,
  DOCUMENT_TYPE_PLACEHOLDERS,
  FILE_TYPE_OPTIONS,
  STATUS_OPTIONS,
} from '../constants';
import { createDocumentTypeSchema, editDocumentTypeSchema } from '../schemas';
import { buildFileTypeFlags, buildFileTypesString } from '../services/file-types';
import type { DocumentType } from '../types';

export interface DocumentTypeFormInput {
  code: string;
  name: string;
  description?: string;
  fileTypePdf?: boolean;
  fileTypeJpg?: boolean;
  fileTypeJpeg?: boolean;
  fileTypePng?: boolean;
  fileTypeDoc?: boolean;
  fileTypeDocx?: boolean;
  fileTypeXls?: boolean;
  fileTypeXlsx?: boolean;
  allowedFileSize?: number | null;
  allowedFileTypes?: string | null;
  isActive: string;
}

const FILE_TYPE_FIELD_NAME_MAP = {
  pdf: 'fileTypePdf',
  jpg: 'fileTypeJpg',
  jpeg: 'fileTypeJpeg',
  png: 'fileTypePng',
  doc: 'fileTypeDoc',
  docx: 'fileTypeDocx',
  xls: 'fileTypeXls',
  xlsx: 'fileTypeXlsx',
} as const;

const DOCUMENT_TYPE_FORM_FIELDS: FormFieldConfig<DocumentTypeFormInput>[] = [
  {
    name: 'code',
    type: 'text',
    label: DOCUMENT_TYPE_LABELS.CREATE.FIELDS.CODE,
    placeholder: DOCUMENT_TYPE_PLACEHOLDERS.CODE,
    required: true,
    colSpan: 4,
    mask: noWhitespace,
  },
  {
    name: 'name',
    type: 'text',
    label: DOCUMENT_TYPE_LABELS.CREATE.FIELDS.NAME,
    placeholder: DOCUMENT_TYPE_PLACEHOLDERS.NAME,
    required: true,
    colSpan: 4,
  },
  {
    name: 'isActive',
    type: 'select',
    label: DOCUMENT_TYPE_LABELS.CREATE.FIELDS.STATUS,
    required: true,
    options: STATUS_OPTIONS,
    placeholder: DOCUMENT_TYPE_PLACEHOLDERS.STATUS,
    colSpan: 4,
    isSearchable: false,
    isClearable: false,
  },
  {
    name: 'description',
    type: 'textarea',
    label: DOCUMENT_TYPE_LABELS.CREATE.FIELDS.DESCRIPTION,
    placeholder: DOCUMENT_TYPE_PLACEHOLDERS.DESCRIPTION,
    required: false,
    colSpan: 12,
    rows: 4,
  },
  {
    type: 'separator',
    colSpan: 12,
    className: 'my-2',
  },
  {
    name: 'allowedFileSize',
    type: 'number',
    label: DOCUMENT_TYPE_LABELS.CREATE.FIELDS.FILE_SIZE,
    placeholder: DOCUMENT_TYPE_PLACEHOLDERS.FILE_SIZE,
    required: true,
    colSpan: 4,
    decimalPlaces: 0,
    allowNegative: false,
  },
  {
    name: 'allowedFileTypes',
    type: 'checkbox-group',
    label: DOCUMENT_TYPE_LABELS.CREATE.FIELDS.FILE_TYPES,
    required: true,
    colSpan: 8,
    items: FILE_TYPE_OPTIONS.map((opt) => ({
      label: opt.label,
      name: FILE_TYPE_FIELD_NAME_MAP[opt.value],
    })),
  },
];

type FormMode = 'create' | 'edit';

function DocumentTypeFormActions({
  mode = 'create',
  isSubmitting,
  onCancel,
}: {
  mode: FormMode;
  isSubmitting?: boolean;
  onCancel?: () => void;
}) {
  const { formState } = useFormContext<DocumentTypeFormInput>();
  const labels = mode === 'edit' ? DOCUMENT_TYPE_LABELS.EDIT : DOCUMENT_TYPE_LABELS.CREATE;

  return (
    <div className="flex gap-2 justify-end">
      <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
        {labels.BUTTONS.CANCEL}
      </Button>
      <Button type="submit" form="document-type-form" disabled={!formState.isValid || isSubmitting}>
        {isSubmitting ? labels.BUTTONS.SAVING : labels.BUTTONS.SAVE}
      </Button>
    </div>
  );
}

interface DocumentTypeFormProps {
  mode?: FormMode;
  documentType?: DocumentType | null;
  onSubmit?: (payload: CreateDocumentTypePayload | UpdateDocumentTypePayload) => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
  serverErrors?: Record<string, string[]>;
}

export function DocumentTypeForm({
  mode = 'create',
  documentType,
  onSubmit,
  onCancel,
  isSubmitting,
  serverErrors,
}: DocumentTypeFormProps) {
  const isEdit = mode === 'edit';

  const defaultValues = useMemo((): DocumentTypeFormInput => {
    if (!documentType) {
      return {
        code: '',
        name: '',
        description: '',
        fileTypePdf: false,
        fileTypeJpg: false,
        fileTypeJpeg: false,
        fileTypePng: false,
        fileTypeDoc: false,
        fileTypeDocx: false,
        fileTypeXls: false,
        fileTypeXlsx: false,
        allowedFileSize: 0,
        isActive: 'true',
      };
    }
    const flags = buildFileTypeFlags(documentType.allowedFileTypes);
    return {
      code: documentType.code ?? '',
      name: documentType.name ?? '',
      description: documentType.description ?? '',
      fileTypePdf: flags.pdf,
      fileTypeJpg: flags.jpg,
      fileTypeJpeg: flags.jpeg,
      fileTypePng: flags.png,
      fileTypeDoc: flags.doc,
      fileTypeDocx: flags.docx,
      fileTypeXls: flags.xls,
      fileTypeXlsx: flags.xlsx,
      allowedFileSize: documentType.allowedFileSize ?? 0,
      isActive: documentType.isActive ? 'true' : 'false',
    };
  }, [documentType]);

  const isProtected = documentType?.isProtected;

  const fields = useMemo<FormFieldConfig<DocumentTypeFormInput>[]>(() => {
    if (!isEdit || !isProtected) return DOCUMENT_TYPE_FORM_FIELDS;
    return DOCUMENT_TYPE_FORM_FIELDS.map((field) => {
      if ('name' in field && (field.name === 'code' || field.name === 'isActive')) {
        return { ...field, disabled: true };
      }
      return field;
    });
  }, [isEdit, isProtected]);

  const handleFormSubmit = (formData: DocumentTypeFormInput) => {
    if (!onSubmit) return;

    const allowedFileTypes = buildFileTypesString({
      pdf: formData.fileTypePdf,
      jpg: formData.fileTypeJpg,
      jpeg: formData.fileTypeJpeg,
      png: formData.fileTypePng,
      doc: formData.fileTypeDoc,
      docx: formData.fileTypeDocx,
      xls: formData.fileTypeXls,
      xlsx: formData.fileTypeXlsx,
    });

    if (isEdit) {
      const payload: UpdateDocumentTypePayload = {
        code: formData.code,
        name: formData.name,
        description: formData.description || undefined,
        allowedFileTypes: allowedFileTypes || undefined,
        allowedFileSize: formData.allowedFileSize ?? undefined,
        isActive: formData.isActive === 'true',
      };
      onSubmit(payload);
    } else {
      const payload: CreateDocumentTypePayload = {
        code: formData.code,
        name: formData.name,
        description: formData.description || undefined,
        allowedFileTypes: allowedFileTypes || undefined,
        allowedFileSize: formData.allowedFileSize ?? undefined,
        isActive: formData.isActive === 'true',
      };
      onSubmit(payload);
    }
  };

  return (
    <FormCard>
      <FormGenerator<DocumentTypeFormInput>
        id="document-type-form"
        fields={fields}
        onSubmit={handleFormSubmit}
        schema={(isEdit ? editDocumentTypeSchema : createDocumentTypeSchema) as any}
        defaultValues={defaultValues}
        externalErrors={serverErrors}
        actions={
          <div className="flex gap-2 justify-end px-0 pb-0">
            <DocumentTypeFormActions
              mode={isEdit ? 'edit' : 'create'}
              isSubmitting={isSubmitting}
              onCancel={onCancel}
            />
          </div>
        }
      />
    </FormCard>
  );
}
