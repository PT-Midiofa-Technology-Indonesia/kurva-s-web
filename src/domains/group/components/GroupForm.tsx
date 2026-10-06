'use client';

import { useMemo } from 'react';
import { useFormContext } from 'react-hook-form';
import { Button } from '@/components/atoms';
import { FormCard } from '@/components/molecules';
import { FormGenerator } from '@/components/organisms/FormGenerator';
import type { FormFieldConfig } from '@/shared/components/organisms/FormGenerator';
import { noWhitespace } from '@/shared/utils/masks';
import type { UpdateGroupPayload } from '../api/update-group';
import { GROUP_LABELS, PLACEHOLDERS, STATUS_OPTIONS } from '../constants';
import { editGroupSchema } from '../schemas';
import type { Group } from '../types';

interface GroupFormInput {
  code: string;
  name: string;
  description?: string;
  isActive: string;
}

const GROUP_FORM_FIELDS: FormFieldConfig<GroupFormInput>[] = [
  {
    name: 'code',
    type: 'text',
    label: GROUP_LABELS.EDIT.FIELDS.CODE,
    placeholder: PLACEHOLDERS.CODE,
    required: true,
    colSpan: 4,
    mask: noWhitespace,
  },
  {
    name: 'name',
    type: 'text',
    label: GROUP_LABELS.EDIT.FIELDS.NAME,
    placeholder: PLACEHOLDERS.NAME,
    required: true,
    colSpan: 4,
  },
  {
    name: 'isActive',
    type: 'select',
    label: GROUP_LABELS.EDIT.FIELDS.STATUS,
    required: true,
    options: STATUS_OPTIONS,
    placeholder: PLACEHOLDERS.STATUS,
    colSpan: 4,
    isSearchable: false,
  },
  {
    name: 'description',
    type: 'textarea',
    label: GROUP_LABELS.EDIT.FIELDS.DESCRIPTION,
    placeholder: PLACEHOLDERS.DESCRIPTION,
    required: false,
    colSpan: 12,
  },
];

function GroupFormActions({
  isSubmitting,
  onCancel,
}: {
  isSubmitting?: boolean;
  onCancel?: () => void;
}) {
  const { formState } = useFormContext<GroupFormInput>();

  return (
    <div className="flex gap-2 justify-end">
      <Button variant="outline" onClick={onCancel} disabled={isSubmitting}>
        {GROUP_LABELS.EDIT.BUTTONS.CANCEL}
      </Button>
      <Button type="submit" form="group-form" disabled={!formState.isValid || isSubmitting}>
        {isSubmitting ? GROUP_LABELS.EDIT.BUTTONS.SAVING : GROUP_LABELS.EDIT.BUTTONS.SAVE}
      </Button>
    </div>
  );
}

interface GroupFormProps {
  group?: Group | null;
  onSubmit?: (payload: UpdateGroupPayload) => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
  serverErrors?: Record<string, string[]>;
}

export function GroupForm({
  group,
  onSubmit,
  onCancel,
  isSubmitting,
  serverErrors,
}: GroupFormProps) {
  const defaultValues = useMemo((): GroupFormInput => {
    if (!group) {
      return {
        code: '',
        name: '',
        description: '',
        isActive: 'true',
      };
    }
    return {
      code: group.code ?? '',
      name: group.name ?? '',
      description: group.description ?? '',
      isActive: group.isActive ? 'true' : 'false',
    };
  }, [group]);

  const handleFormSubmit = (formData: GroupFormInput) => {
    if (!onSubmit) return;

    const payload: UpdateGroupPayload = {
      code: formData.code,
      name: formData.name || null,
      description: formData.description || null,
      isActive: formData.isActive === 'true',
    };
    onSubmit(payload);
  };

  return (
    <FormCard>
      <FormGenerator<GroupFormInput>
        id="group-form"
        fields={GROUP_FORM_FIELDS}
        onSubmit={handleFormSubmit}
        schema={editGroupSchema as any}
        defaultValues={defaultValues}
        externalErrors={serverErrors}
        actions={
          <div className="flex gap-2 justify-end px-0 pb-0">
            <GroupFormActions isSubmitting={isSubmitting} onCancel={onCancel} />
          </div>
        }
      />
    </FormCard>
  );
}
