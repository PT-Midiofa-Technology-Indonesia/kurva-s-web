import type { FormFieldConfig } from '@/shared/components/organisms/FormGenerator/types';
import { SPK_UPLOAD_LABELS } from '../constants';

export interface SPKUploadFormValues {
  spkNumber: string;
  files?: File[];
}

import type { ExistingFile } from '@/shared/components/organisms/FormGenerator/types';

export interface GetSpkUploadFieldsOptions {
  maxFiles?: number;
  maxSizeKB?: number;
  accept?: string;
  existingFiles?: ExistingFile[];
}

export function getSpkUploadFields({
  maxFiles = 5,
  maxSizeKB = 10240,
  accept = '',
  existingFiles = [],
}: GetSpkUploadFieldsOptions = {}): FormFieldConfig<SPKUploadFormValues>[] {
  const maxSizeBytes = (maxSizeKB || 10240) * 1024;
  return [
    {
      name: 'spkNumber',
      label: SPK_UPLOAD_LABELS.SPK_NUMBER_LABEL,
      type: 'text',
      required: true,
      placeholder: SPK_UPLOAD_LABELS.SPK_NUMBER_PLACEHOLDER,
    },
    {
      name: 'files',
      label: SPK_UPLOAD_LABELS.DOCUMENTS_LABEL,
      type: 'file-input',
      accept,
      maxFiles,
      maxSize: maxSizeBytes,
      existingFiles,
    },
  ];
}
