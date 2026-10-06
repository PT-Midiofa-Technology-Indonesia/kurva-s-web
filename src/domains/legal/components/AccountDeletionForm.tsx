'use client';

import { useFormContext } from 'react-hook-form';
import { Button } from '@/components/atoms';
import { FormCard } from '@/components/molecules';
import { FormGenerator } from '@/components/organisms/FormGenerator';
import type { FormFieldConfig } from '@/shared/components/organisms/FormGenerator';
import { maskPhone, noWhitespace } from '@/shared/utils/masks';
import { DELETE_ACCOUNT_LABELS } from '../constants';
import { deleteAccountRequestSchema } from '../schemas';

const LABELS = DELETE_ACCOUNT_LABELS;

interface AccountDeletionFormInput {
  fullName: string;
  email: string;
  phone: string;
  reason?: string;
  confirmation: boolean;
}

const ACCOUNT_DELETION_FORM_FIELDS: FormFieldConfig<AccountDeletionFormInput>[] = [
  {
    name: 'fullName',
    type: 'text',
    label: LABELS.FIELDS.FULL_NAME,
    placeholder: LABELS.PLACEHOLDERS.FULL_NAME,
    required: true,
    colSpan: 12,
  },
  {
    name: 'email',
    type: 'text',
    label: LABELS.FIELDS.EMAIL,
    placeholder: LABELS.PLACEHOLDERS.EMAIL,
    required: true,
    colSpan: { base: 12, md: 6 },
    mask: noWhitespace,
  },
  {
    name: 'phone',
    type: 'text',
    label: LABELS.FIELDS.PHONE,
    placeholder: LABELS.PLACEHOLDERS.PHONE,
    required: true,
    colSpan: { base: 12, md: 6 },
    mask: maskPhone,
    prefix: '+62',
  },
  {
    name: 'reason',
    type: 'textarea',
    label: LABELS.FIELDS.REASON,
    placeholder: LABELS.PLACEHOLDERS.REASON,
    required: false,
    colSpan: 12,
    rows: 4,
  },
  {
    name: 'confirmation',
    type: 'checkbox',
    label: LABELS.FIELDS.CONFIRMATION,
    required: true,
    colSpan: 12,
  },
];

const DEFAULT_VALUES: AccountDeletionFormInput = {
  fullName: '',
  email: '',
  phone: '',
  reason: '',
  confirmation: false,
};

function AccountDeletionFormActions({ isSubmitting }: { isSubmitting?: boolean }) {
  const { formState } = useFormContext<AccountDeletionFormInput>();

  return (
    <div className="flex justify-end">
      <Button
        type="submit"
        form="account-deletion-form"
        disabled={!formState.isValid || isSubmitting}
      >
        {isSubmitting ? LABELS.BUTTONS.SUBMITTING : LABELS.BUTTONS.SUBMIT}
      </Button>
    </div>
  );
}

export interface AccountDeletionFormProps {
  onSubmit: (values: AccountDeletionFormInput) => void;
  isSubmitting?: boolean;
}

export function AccountDeletionForm({ onSubmit, isSubmitting }: AccountDeletionFormProps) {
  return (
    <FormCard>
      <FormGenerator<AccountDeletionFormInput>
        id="account-deletion-form"
        fields={ACCOUNT_DELETION_FORM_FIELDS}
        schema={deleteAccountRequestSchema as any}
        defaultValues={DEFAULT_VALUES}
        onSubmit={onSubmit}
        actions={<AccountDeletionFormActions isSubmitting={isSubmitting} />}
      />
    </FormCard>
  );
}
