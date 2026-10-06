'use client';

import { useMemo } from 'react';
import { useFormContext } from 'react-hook-form';
import { Button } from '@/components/atoms';
import { FormCard } from '@/components/molecules';
import { FormGenerator } from '@/components/organisms/FormGenerator';
import type { FormFieldConfig } from '@/shared/components/organisms/FormGenerator';
import { noWhitespace } from '@/shared/utils/masks';
import type { CreateJobItemTypePayload } from '../api/create-job-item-type';
import type { UpdateJobItemTypePayload } from '../api/update-job-item-type';
import { JOB_ITEM_TYPE_LABELS, PLACEHOLDERS, STATUS_OPTIONS } from '../constants';
import { createJobItemTypeSchema, editJobItemTypeSchema } from '../schemas';
import type { JobItemType } from '../types';

interface JobItemTypeFormInput {
  code: string;
  name: string;
  description?: string;
  isActive: string;
}

const JOB_ITEM_TYPE_FORM_FIELDS: FormFieldConfig<JobItemTypeFormInput>[] = [
  {
    name: 'code',
    type: 'text',
    label: JOB_ITEM_TYPE_LABELS.CREATE.FIELDS.CODE,
    placeholder: PLACEHOLDERS.CODE,
    required: true,
    colSpan: 4,
    mask: noWhitespace,
  },
  {
    name: 'name',
    type: 'text',
    label: JOB_ITEM_TYPE_LABELS.CREATE.FIELDS.NAME,
    placeholder: PLACEHOLDERS.NAME,
    required: true,
    colSpan: 4,
  },
  {
    name: 'isActive',
    type: 'select',
    label: JOB_ITEM_TYPE_LABELS.CREATE.FIELDS.STATUS,
    required: true,
    options: STATUS_OPTIONS,
    placeholder: PLACEHOLDERS.STATUS,
    colSpan: 4,
    isSearchable: false,
    isClearable: false,
  },
  {
    name: 'description',
    type: 'textarea',
    label: JOB_ITEM_TYPE_LABELS.CREATE.FIELDS.DESCRIPTION,
    placeholder: PLACEHOLDERS.DESCRIPTION,
    required: false,
    colSpan: 12,
  },
];

type FormMode = 'create' | 'edit';

function JobItemTypeFormActions({
  mode = 'create',
  isSubmitting,
  onCancel,
}: {
  mode: FormMode;
  isSubmitting?: boolean;
  onCancel?: () => void;
}) {
  const { formState } = useFormContext<JobItemTypeFormInput>();
  const labels = mode === 'edit' ? JOB_ITEM_TYPE_LABELS.EDIT : JOB_ITEM_TYPE_LABELS.CREATE;

  return (
    <div className="flex gap-2 justify-end">
      <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
        {labels.BUTTONS.CANCEL}
      </Button>
      <Button type="submit" form="job-item-type-form" disabled={!formState.isValid || isSubmitting}>
        {isSubmitting ? labels.BUTTONS.SAVING : labels.BUTTONS.SAVE}
      </Button>
    </div>
  );
}

interface JobItemTypeFormProps {
  mode?: FormMode;
  jobItemType?: JobItemType | null;
  onSubmit?: (payload: CreateJobItemTypePayload | UpdateJobItemTypePayload) => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
  serverErrors?: Record<string, string[]>;
}

export function JobItemTypeForm({
  mode = 'create',
  jobItemType,
  onSubmit,
  onCancel,
  isSubmitting,
  serverErrors,
}: JobItemTypeFormProps) {
  const isEdit = mode === 'edit';

  const defaultValues = useMemo((): JobItemTypeFormInput => {
    if (!jobItemType) {
      return {
        code: '',
        name: '',
        description: '',
        isActive: 'true',
      };
    }
    return {
      code: jobItemType.code ?? '',
      name: jobItemType.name ?? '',
      description: jobItemType.description ?? '',
      isActive: jobItemType.isActive ? 'true' : 'false',
    };
  }, [jobItemType]);

  const handleFormSubmit = (formData: JobItemTypeFormInput) => {
    if (!onSubmit) return;

    if (isEdit) {
      const payload: UpdateJobItemTypePayload = {
        code: formData.code,
        name: formData.name || null,
        description: formData.description || null,
        isActive: formData.isActive === 'true',
      };
      onSubmit(payload);
    } else {
      const payload: CreateJobItemTypePayload = {
        code: formData.code,
        name: formData.name,
        description: formData.description,
        isActive: formData.isActive === 'true',
      };
      onSubmit(payload);
    }
  };

  return (
    <FormCard>
      <FormGenerator<JobItemTypeFormInput>
        id="job-item-type-form"
        fields={JOB_ITEM_TYPE_FORM_FIELDS}
        onSubmit={handleFormSubmit}
        schema={(isEdit ? editJobItemTypeSchema : createJobItemTypeSchema) as any}
        defaultValues={defaultValues}
        externalErrors={serverErrors}
        actions={
          <div className="flex gap-2 justify-end px-0 pb-0">
            <JobItemTypeFormActions
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
