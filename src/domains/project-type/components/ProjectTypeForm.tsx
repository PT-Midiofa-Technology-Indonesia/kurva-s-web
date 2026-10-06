'use client';

import { useMemo } from 'react';
import { useFormContext } from 'react-hook-form';
import { Button } from '@/components/atoms';
import { FormCard } from '@/components/molecules';
import { FormGenerator } from '@/components/organisms/FormGenerator';
import type { FormFieldConfig } from '@/shared/components/organisms/FormGenerator';
import { noWhitespace } from '@/shared/utils/masks';
import type { CreateProjectTypePayload } from '../api/create-project-type';
import type { UpdateProjectTypePayload } from '../api/update-project-type';
import { PLACEHOLDERS, PROJECT_TYPE_LABELS, STATUS_OPTIONS } from '../constants';
import { createProjectTypeSchema, editProjectTypeSchema } from '../schemas';
import type { ProjectType } from '../types';

interface ProjectTypeFormInput {
  code: string;
  name: string;
  description?: string;
  isActive: string;
}

const PROJECT_TYPE_FORM_FIELDS: FormFieldConfig<ProjectTypeFormInput>[] = [
  {
    name: 'code',
    type: 'text',
    label: PROJECT_TYPE_LABELS.CREATE.FIELDS.CODE,
    placeholder: PLACEHOLDERS.CODE,
    required: true,
    colSpan: 4,
    mask: noWhitespace,
  },
  {
    name: 'name',
    type: 'text',
    label: PROJECT_TYPE_LABELS.CREATE.FIELDS.NAME,
    placeholder: PLACEHOLDERS.NAME,
    required: true,
    colSpan: 4,
  },
  {
    name: 'isActive',
    type: 'select',
    label: PROJECT_TYPE_LABELS.CREATE.FIELDS.STATUS,
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
    label: PROJECT_TYPE_LABELS.CREATE.FIELDS.DESCRIPTION,
    placeholder: PLACEHOLDERS.DESCRIPTION,
    required: false,
    colSpan: 12,
  },
];

type FormMode = 'create' | 'edit';

function ProjectTypeFormActions({
  mode = 'create',
  isSubmitting,
  onCancel,
}: {
  mode: FormMode;
  isSubmitting?: boolean;
  onCancel?: () => void;
}) {
  const { formState } = useFormContext<ProjectTypeFormInput>();
  const labels = mode === 'edit' ? PROJECT_TYPE_LABELS.EDIT : PROJECT_TYPE_LABELS.CREATE;

  return (
    <div className="flex gap-2 justify-end">
      <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
        {labels.BUTTONS.CANCEL}
      </Button>
      <Button type="submit" form="project-type-form" disabled={!formState.isValid || isSubmitting}>
        {isSubmitting ? labels.BUTTONS.SAVING : labels.BUTTONS.SAVE}
      </Button>
    </div>
  );
}

interface ProjectTypeFormProps {
  mode?: FormMode;
  projectType?: ProjectType | null;
  onSubmit?: (payload: CreateProjectTypePayload | UpdateProjectTypePayload) => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
  serverErrors?: Record<string, string[]>;
}

export function ProjectTypeForm({
  mode = 'create',
  projectType,
  onSubmit,
  onCancel,
  isSubmitting,
  serverErrors,
}: ProjectTypeFormProps) {
  const isEdit = mode === 'edit';

  const defaultValues = useMemo((): ProjectTypeFormInput => {
    if (!projectType) {
      return {
        code: '',
        name: '',
        description: '',
        isActive: 'true',
      };
    }
    return {
      code: projectType.code ?? '',
      name: projectType.name ?? '',
      description: projectType.description ?? '',
      isActive: projectType.isActive ? 'true' : 'false',
    };
  }, [projectType]);

  const handleFormSubmit = (formData: ProjectTypeFormInput) => {
    if (!onSubmit) return;

    if (isEdit) {
      const payload: UpdateProjectTypePayload = {
        code: formData.code,
        name: formData.name || null,
        description: formData.description || null,
        isActive: formData.isActive === 'true',
      };
      onSubmit(payload);
    } else {
      const payload: CreateProjectTypePayload = {
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
      <FormGenerator<ProjectTypeFormInput>
        id="project-type-form"
        fields={PROJECT_TYPE_FORM_FIELDS}
        onSubmit={handleFormSubmit}
        schema={(isEdit ? editProjectTypeSchema : createProjectTypeSchema) as any}
        defaultValues={defaultValues}
        externalErrors={serverErrors}
        actions={
          <div className="flex gap-2 justify-end px-0 pb-0">
            <ProjectTypeFormActions
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
