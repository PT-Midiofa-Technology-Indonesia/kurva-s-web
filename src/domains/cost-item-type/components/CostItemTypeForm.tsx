'use client';

import { useMemo } from 'react';
import { useFormContext } from 'react-hook-form';
import { Button } from '@/components/atoms';
import { FormCard } from '@/components/molecules';
import { FormGenerator } from '@/components/organisms/FormGenerator';
import type { FormFieldConfig } from '@/shared/components/organisms/FormGenerator';
import { noWhitespace } from '@/shared/utils/masks';
import type { CreateCostItemTypePayload } from '../api/create-cost-item-type';
import type { UpdateCostItemTypePayload } from '../api/update-cost-item-type';
import { COST_ITEM_TYPE_LABELS, PLACEHOLDERS, STATUS_OPTIONS } from '../constants';
import { createCostItemTypeSchema, editCostItemTypeSchema } from '../schemas';
import type { CostItemType } from '../types';

interface CostItemTypeFormInput {
  code: string;
  name: string;
  description?: string;
  isActive: string;
}

const COST_ITEM_TYPE_FORM_FIELDS: FormFieldConfig<CostItemTypeFormInput>[] = [
  {
    name: 'code',
    type: 'text',
    label: COST_ITEM_TYPE_LABELS.CREATE.FIELDS.CODE,
    placeholder: PLACEHOLDERS.CODE,
    required: true,
    colSpan: 4,
    mask: noWhitespace,
  },
  {
    name: 'name',
    type: 'text',
    label: COST_ITEM_TYPE_LABELS.CREATE.FIELDS.NAME,
    placeholder: PLACEHOLDERS.NAME,
    required: true,
    colSpan: 4,
  },
  {
    name: 'isActive',
    type: 'select',
    label: COST_ITEM_TYPE_LABELS.CREATE.FIELDS.STATUS,
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
    label: COST_ITEM_TYPE_LABELS.CREATE.FIELDS.DESCRIPTION,
    placeholder: PLACEHOLDERS.DESCRIPTION,
    required: false,
    colSpan: 12,
  },
];

type FormMode = 'create' | 'edit';

function CostItemTypeFormActions({
  mode = 'create',
  isSubmitting,
  onCancel,
}: {
  mode: FormMode;
  isSubmitting?: boolean;
  onCancel?: () => void;
}) {
  const { formState } = useFormContext<CostItemTypeFormInput>();
  const labels = mode === 'edit' ? COST_ITEM_TYPE_LABELS.EDIT : COST_ITEM_TYPE_LABELS.CREATE;

  return (
    <div className="flex gap-2 justify-end">
      <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
        {labels.BUTTONS.CANCEL}
      </Button>
      <Button
        type="submit"
        form="cost-item-type-form"
        disabled={!formState.isValid || isSubmitting}
      >
        {isSubmitting ? labels.BUTTONS.SAVING : labels.BUTTONS.SAVE}
      </Button>
    </div>
  );
}

interface CostItemTypeFormProps {
  mode?: FormMode;
  costItemType?: CostItemType | null;
  onSubmit?: (payload: CreateCostItemTypePayload | UpdateCostItemTypePayload) => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
  serverErrors?: Record<string, string[]>;
}

export function CostItemTypeForm({
  mode = 'create',
  costItemType,
  onSubmit,
  onCancel,
  isSubmitting,
  serverErrors,
}: CostItemTypeFormProps) {
  const isEdit = mode === 'edit';

  const defaultValues = useMemo((): CostItemTypeFormInput => {
    if (!costItemType) {
      return {
        code: '',
        name: '',
        description: '',
        isActive: 'true',
      };
    }
    return {
      code: costItemType.code ?? '',
      name: costItemType.name ?? '',
      description: costItemType.description ?? '',
      isActive: costItemType.isActive ? 'true' : 'false',
    };
  }, [costItemType]);

  const handleFormSubmit = (formData: CostItemTypeFormInput) => {
    if (!onSubmit) return;

    if (isEdit) {
      const payload: UpdateCostItemTypePayload = {
        code: formData.code,
        name: formData.name || null,
        description: formData.description || null,
        isActive: formData.isActive === 'true',
      };
      onSubmit(payload);
    } else {
      const payload: CreateCostItemTypePayload = {
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
      <FormGenerator<CostItemTypeFormInput>
        id="cost-item-type-form"
        fields={COST_ITEM_TYPE_FORM_FIELDS}
        onSubmit={handleFormSubmit}
        schema={(isEdit ? editCostItemTypeSchema : createCostItemTypeSchema) as any}
        defaultValues={defaultValues}
        externalErrors={serverErrors}
        actions={
          <div className="flex gap-2 justify-end px-0 pb-0">
            <CostItemTypeFormActions
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
