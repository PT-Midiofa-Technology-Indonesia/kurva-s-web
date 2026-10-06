'use client';

import { useMemo } from 'react';
import { useFormContext } from 'react-hook-form';
import { Button } from '@/components/atoms';
import { FormGenerator } from '@/components/organisms/FormGenerator';
import type { FormFieldConfig } from '@/shared/components/organisms/FormGenerator';
import { noWhitespace } from '@/shared/utils/masks';
import {
  SKILL_CATEGORY_FORM_LABELS,
  SKILL_CATEGORY_LABELS,
  SKILL_CATEGORY_PLACEHOLDERS,
  STATUS_OPTIONS,
} from '../constants';
import {
  createSkillCategoryFormSchema,
  editSkillCategoryFormSchema,
  type SkillCategoryFormData,
} from '../schemas';
import type { SkillCategory } from '../types';

interface SkillCategoryFormInput {
  code: string;
  name: string;
  description?: string;
  isActive: string;
}

const SKILL_CATEGORY_FORM_FIELDS: FormFieldConfig<SkillCategoryFormInput>[] = [
  {
    name: 'code',
    type: 'text',
    label: SKILL_CATEGORY_FORM_LABELS.CODE,
    placeholder: SKILL_CATEGORY_PLACEHOLDERS.CODE,
    required: true,
    colSpan: 4,
    mask: noWhitespace,
  },
  {
    name: 'name',
    type: 'text',
    label: SKILL_CATEGORY_FORM_LABELS.NAME,
    placeholder: SKILL_CATEGORY_PLACEHOLDERS.NAME,
    required: true,
    colSpan: 4,
  },
  {
    name: 'isActive',
    type: 'select',
    label: SKILL_CATEGORY_LABELS.CREATE.FIELDS.STATUS,
    required: true,
    options: STATUS_OPTIONS,
    placeholder: SKILL_CATEGORY_PLACEHOLDERS.STATUS,
    colSpan: 4,
    isSearchable: false,
    isClearable: false,
  },
  {
    name: 'description',
    type: 'textarea',
    label: SKILL_CATEGORY_LABELS.CREATE.FIELDS.DESCRIPTION,
    placeholder: SKILL_CATEGORY_PLACEHOLDERS.DESCRIPTION,
    required: false,
    colSpan: 12,
  },
];

type FormMode = 'create' | 'edit';

function SkillCategoryFormActions({
  mode = 'create',
  isSubmitting,
  onCancel,
}: {
  mode: FormMode;
  isSubmitting?: boolean;
  onCancel?: () => void;
}) {
  const { formState } = useFormContext<SkillCategoryFormInput>();
  const labels = mode === 'edit' ? SKILL_CATEGORY_LABELS.EDIT : SKILL_CATEGORY_LABELS.CREATE;

  return (
    <div className="flex gap-2 justify-end">
      <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
        {labels.BUTTONS.CANCEL}
      </Button>
      <Button
        type="submit"
        form="skill-category-form"
        disabled={!formState.isValid || isSubmitting}
      >
        {isSubmitting ? labels.BUTTONS.SAVING : labels.BUTTONS.SAVE}
      </Button>
    </div>
  );
}

interface SkillCategoryFormProps {
  mode?: FormMode;
  skillCategory?: SkillCategory | null;
  onSubmit?: (payload: SkillCategoryFormData) => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
  serverErrors?: Record<string, string[]>;
}

export function SkillCategoryForm({
  mode = 'create',
  skillCategory,
  onSubmit,
  onCancel,
  isSubmitting,
  serverErrors,
}: SkillCategoryFormProps) {
  const isEdit = mode === 'edit';

  const defaultValues = useMemo((): SkillCategoryFormInput => {
    if (!skillCategory) {
      return {
        code: '',
        name: '',
        description: '',
        isActive: 'true',
      };
    }
    return {
      code: skillCategory.code ?? '',
      name: skillCategory.name ?? '',
      description: skillCategory.description ?? '',
      isActive: skillCategory.isActive ? 'true' : 'false',
    };
  }, [skillCategory]);

  const handleFormSubmit = (formData: SkillCategoryFormInput) => {
    if (!onSubmit) return;

    const payload: SkillCategoryFormData = {
      code: formData.code,
      name: formData.name || '',
      description: formData.description || '',
      isActive: formData.isActive === 'true',
    };
    onSubmit(payload);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-[14px] shadow-sm">
      <div className="px-6 py-6">
        <FormGenerator<SkillCategoryFormInput>
          id="skill-category-form"
          fields={SKILL_CATEGORY_FORM_FIELDS}
          onSubmit={handleFormSubmit}
          schema={(isEdit ? editSkillCategoryFormSchema : createSkillCategoryFormSchema) as any}
          defaultValues={defaultValues}
          externalErrors={serverErrors}
          actions={
            <div className="flex gap-2 justify-end px-0 pb-0">
              <SkillCategoryFormActions
                mode={isEdit ? 'edit' : 'create'}
                isSubmitting={isSubmitting}
                onCancel={onCancel}
              />
            </div>
          }
        />
      </div>
    </div>
  );
}
