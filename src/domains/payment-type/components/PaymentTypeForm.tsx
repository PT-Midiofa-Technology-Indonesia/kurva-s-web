'use client';

import { useMemo } from 'react';
import { useFormContext } from 'react-hook-form';
import { Button } from '@/components/atoms';
import { FormCard } from '@/components/molecules';
import { FormGenerator } from '@/components/organisms/FormGenerator';
import type { FormFieldConfig } from '@/shared/components/organisms/FormGenerator';
import { noWhitespace } from '@/shared/utils/masks';
import type { CreatePaymentTypePayload } from '../api/create-payment-type';
import type { UpdatePaymentTypePayload } from '../api/update-payment-type';
import { PAYMENT_TYPE_LABELS, PLACEHOLDERS, STATUS_OPTIONS } from '../constants';
import { createPaymentTypeSchema, editPaymentTypeSchema } from '../schemas';
import type { PaymentType } from '../types';

interface PaymentTypeFormInput {
  code: string;
  name: string;
  description?: string;
  isActive: string;
}

const PAYMENT_TYPE_FORM_FIELDS: FormFieldConfig<PaymentTypeFormInput>[] = [
  {
    name: 'code',
    type: 'text',
    label: PAYMENT_TYPE_LABELS.CREATE.FIELDS.CODE,
    placeholder: PLACEHOLDERS.CODE,
    required: true,
    colSpan: 4,
    mask: noWhitespace,
  },
  {
    name: 'name',
    type: 'text',
    label: PAYMENT_TYPE_LABELS.CREATE.FIELDS.NAME,
    placeholder: PLACEHOLDERS.NAME,
    required: true,
    colSpan: 4,
  },
  {
    name: 'isActive',
    type: 'select',
    label: PAYMENT_TYPE_LABELS.CREATE.FIELDS.STATUS,
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
    label: PAYMENT_TYPE_LABELS.CREATE.FIELDS.DESCRIPTION,
    placeholder: PLACEHOLDERS.DESCRIPTION,
    required: false,
    colSpan: 12,
  },
];

type FormMode = 'create' | 'edit';

function PaymentTypeFormActions({
  mode = 'create',
  isSubmitting,
  onCancel,
}: {
  mode: FormMode;
  isSubmitting?: boolean;
  onCancel?: () => void;
}) {
  const { formState } = useFormContext<PaymentTypeFormInput>();
  const labels = mode === 'edit' ? PAYMENT_TYPE_LABELS.EDIT : PAYMENT_TYPE_LABELS.CREATE;

  return (
    <div className="flex gap-2 justify-end">
      <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
        {labels.BUTTONS.CANCEL}
      </Button>
      <Button type="submit" form="payment-type-form" disabled={!formState.isValid || isSubmitting}>
        {isSubmitting ? labels.BUTTONS.SAVING : labels.BUTTONS.SAVE}
      </Button>
    </div>
  );
}

interface PaymentTypeFormProps {
  mode?: FormMode;
  paymentType?: PaymentType | null;
  onSubmit?: (payload: CreatePaymentTypePayload | UpdatePaymentTypePayload) => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
  serverErrors?: Record<string, string[]>;
}

export function PaymentTypeForm({
  mode = 'create',
  paymentType,
  onSubmit,
  onCancel,
  isSubmitting,
  serverErrors,
}: PaymentTypeFormProps) {
  const isEdit = mode === 'edit';

  const defaultValues = useMemo((): PaymentTypeFormInput => {
    if (!paymentType) {
      return {
        code: '',
        name: '',
        description: '',
        isActive: 'true',
      };
    }
    return {
      code: paymentType.code ?? '',
      name: paymentType.name ?? '',
      description: paymentType.description ?? '',
      isActive: paymentType.isActive ? 'true' : 'false',
    };
  }, [paymentType]);

  const handleFormSubmit = (formData: PaymentTypeFormInput) => {
    if (!onSubmit) return;

    if (isEdit) {
      const payload: UpdatePaymentTypePayload = {
        code: formData.code,
        name: formData.name || null,
        description: formData.description || null,
        isActive: formData.isActive === 'true',
      };
      onSubmit(payload);
    } else {
      const payload: CreatePaymentTypePayload = {
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
      <FormGenerator<PaymentTypeFormInput>
        id="payment-type-form"
        fields={PAYMENT_TYPE_FORM_FIELDS}
        onSubmit={handleFormSubmit}
        schema={(isEdit ? editPaymentTypeSchema : createPaymentTypeSchema) as any}
        defaultValues={defaultValues}
        externalErrors={serverErrors}
        actions={
          <div className="flex gap-2 justify-end px-0 pb-0">
            <PaymentTypeFormActions
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
