'use client';

import { useMemo } from 'react';
import { useFormContext } from 'react-hook-form';
import { Button } from '@/components/atoms';
import { FormCard } from '@/components/molecules';
import { FormGenerator } from '@/components/organisms/FormGenerator';
import type { FormFieldConfig } from '@/shared/components/organisms/FormGenerator';
import { COMMON_STATUS_OPTIONS } from '@/shared/constants';
import { useUomGroups } from '@/shared/hooks/use-enums';
import { noWhitespace } from '@/shared/utils/masks';
import type { CreateUomPayload } from '../api/create-uom';
import type { UpdateUomPayload } from '../api/update-uom';
import { PLACEHOLDERS, UOM_LABELS } from '../constants';
import { createUomSchema, editUomSchema } from '../schemas';
import type { Uom } from '../types';

interface UomFormInput {
  code: string;
  group: string;
  name: string;
  description?: string;
  isActive: string;
}

const BASE_FORM_FIELDS: FormFieldConfig<UomFormInput>[] = [
  {
    name: 'code',
    type: 'text',
    label: 'Kode UoM',
    placeholder: PLACEHOLDERS.CODE,
    required: true,
    colSpan: 3,
    mask: noWhitespace,
  },
  {
    name: 'group',
    type: 'select',
    label: 'UoM Group',
    placeholder: PLACEHOLDERS.GROUP,
    required: true,
    options: [],
    colSpan: 3,
    isSearchable: true,
  },
  {
    name: 'name',
    type: 'text',
    label: 'Nama UoM',
    placeholder: PLACEHOLDERS.NAME,
    required: true,
    colSpan: 3,
  },
  {
    name: 'isActive',
    type: 'select',
    label: 'Status',
    required: true,
    options: COMMON_STATUS_OPTIONS,
    placeholder: 'Pilih status',
    colSpan: 3,
    isSearchable: false,
    isClearable: false,
  },
  {
    name: 'description',
    type: 'textarea',
    label: 'Deskripsi',
    placeholder: PLACEHOLDERS.DESCRIPTION,
    required: false,
    colSpan: 12,
  },
];

type FormMode = 'create' | 'edit';

function UomFormActions({
  mode = 'create',
  isSubmitting,
  onCancel,
}: {
  mode: FormMode;
  isSubmitting?: boolean;
  onCancel?: () => void;
}) {
  const { formState } = useFormContext<UomFormInput>();
  const labels = mode === 'edit' ? UOM_LABELS.EDIT : UOM_LABELS.CREATE;

  return (
    <div className="flex gap-2 justify-end">
      <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
        {labels.BUTTONS.CANCEL}
      </Button>
      <Button type="submit" form="uom-form" disabled={!formState.isValid || isSubmitting}>
        {isSubmitting ? labels.BUTTONS.SAVING : labels.BUTTONS.SAVE}
      </Button>
    </div>
  );
}

interface UomFormProps {
  mode?: FormMode;
  uom?: Uom | null;
  onSubmit?: (payload: CreateUomPayload | UpdateUomPayload) => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
  serverErrors?: Record<string, string[]>;
}

export function UomForm({
  mode = 'create',
  uom,
  onSubmit,
  onCancel,
  isSubmitting,
  serverErrors,
}: UomFormProps) {
  const isEdit = mode === 'edit';
  const { data: uomGroupOptions = [] } = useUomGroups();

  const fields = useMemo<FormFieldConfig<UomFormInput>[]>(
    () =>
      BASE_FORM_FIELDS.map((f) =>
        'name' in f && f.name === 'group' ? { ...f, options: uomGroupOptions } : f
      ),
    [uomGroupOptions]
  );

  const defaultValues = useMemo((): UomFormInput => {
    if (!uom) {
      return {
        code: '',
        group: '',
        name: '',
        description: '',
        isActive: 'true',
      };
    }
    return {
      code: uom.code ?? '',
      group: uom.group ?? '',
      name: uom.name ?? '',
      description: uom.description ?? '',
      isActive: uom.isActive ? 'true' : 'false',
    };
  }, [uom]);

  const handleFormSubmit = (formData: UomFormInput) => {
    if (!onSubmit) return;

    if (isEdit) {
      const payload: UpdateUomPayload = {
        code: formData.code || undefined,
        group: formData.group || undefined,
        name: formData.name || null,
        description: formData.description || null,
        isActive: formData.isActive === 'true',
      };
      onSubmit(payload);
    } else {
      const payload: CreateUomPayload = {
        code: formData.code,
        group: formData.group,
        name: formData.name,
        description: formData.description,
        isActive: formData.isActive === 'true',
      };
      onSubmit(payload);
    }
  };

  return (
    <FormCard>
      <FormGenerator<UomFormInput>
        id="uom-form"
        fields={fields}
        onSubmit={handleFormSubmit}
        schema={(isEdit ? editUomSchema : createUomSchema) as any}
        defaultValues={defaultValues}
        externalErrors={serverErrors}
        actions={
          <div className="flex gap-2 justify-end px-0 pb-0">
            <UomFormActions
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
