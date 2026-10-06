'use client';

import { useMemo } from 'react';
import { useFormContext } from 'react-hook-form';
import { Button } from '@/components/atoms';
import { FormCard } from '@/components/molecules';
import { FormGenerator } from '@/components/organisms/FormGenerator';
import type { FormFieldConfig } from '@/shared/components/organisms/FormGenerator';
import { noWhitespace } from '@/shared/utils/masks';
import type { CreateProjectCapabilityPayload } from '../api/create-project-capability';
import type { UpdateProjectCapabilityPayload } from '../api/update-project-capability';
import { PLACEHOLDERS, PROJECT_CAPABILITY_LABELS, STATUS_OPTIONS } from '../constants';
import { createProjectCapabilitySchema, editProjectCapabilitySchema } from '../schemas';
import type { ProjectCapability } from '../types';

interface ProjectCapabilityFormInput {
  code: string;
  name: string;
  description?: string;
  isActive: string;
}

const PROJECT_CAPABILITY_FORM_FIELDS: FormFieldConfig<ProjectCapabilityFormInput>[] = [
  {
    name: 'code',
    type: 'text',
    label: PROJECT_CAPABILITY_LABELS.CREATE.FIELDS.CODE,
    placeholder: PLACEHOLDERS.CODE,
    required: true,
    colSpan: 4,
    mask: noWhitespace,
  },
  {
    name: 'name',
    type: 'text',
    label: PROJECT_CAPABILITY_LABELS.CREATE.FIELDS.NAME,
    placeholder: PLACEHOLDERS.NAME,
    required: true,
    colSpan: 4,
  },
  {
    name: 'isActive',
    type: 'select',
    label: PROJECT_CAPABILITY_LABELS.CREATE.FIELDS.STATUS,
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
    label: PROJECT_CAPABILITY_LABELS.CREATE.FIELDS.DESCRIPTION,
    placeholder: PLACEHOLDERS.DESCRIPTION,
    required: false,
    colSpan: 12,
  },
];

type FormMode = 'create' | 'edit';

function ProjectCapabilityFormActions({
  mode = 'create',
  isSubmitting,
  onCancel,
}: {
  mode: FormMode;
  isSubmitting?: boolean;
  onCancel?: () => void;
}) {
  const { formState } = useFormContext<ProjectCapabilityFormInput>();
  const labels =
    mode === 'edit' ? PROJECT_CAPABILITY_LABELS.EDIT : PROJECT_CAPABILITY_LABELS.CREATE;

  return (
    <div className="flex gap-2 justify-end">
      <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
        {labels.BUTTONS.CANCEL}
      </Button>
      <Button
        type="submit"
        form="project-capability-form"
        disabled={!formState.isValid || isSubmitting}
      >
        {isSubmitting ? labels.BUTTONS.SAVING : labels.BUTTONS.SAVE}
      </Button>
    </div>
  );
}

interface ProjectCapabilityFormProps {
  mode?: FormMode;
  projectCapability?: ProjectCapability | null;
  onSubmit?: (payload: CreateProjectCapabilityPayload | UpdateProjectCapabilityPayload) => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
  serverErrors?: Record<string, string[]>;
}

export function ProjectCapabilityForm({
  mode = 'create',
  projectCapability,
  onSubmit,
  onCancel,
  isSubmitting,
  serverErrors,
}: ProjectCapabilityFormProps) {
  const isEdit = mode === 'edit';

  const defaultValues = useMemo((): ProjectCapabilityFormInput => {
    if (!projectCapability) {
      return {
        code: '',
        name: '',
        description: '',
        isActive: 'true',
      };
    }
    return {
      code: projectCapability.code ?? '',
      name: projectCapability.name ?? '',
      description: projectCapability.description ?? '',
      isActive: projectCapability.isActive ? 'true' : 'false',
    };
  }, [projectCapability]);

  const handleFormSubmit = (formData: ProjectCapabilityFormInput) => {
    if (!onSubmit) return;

    if (isEdit) {
      const payload: UpdateProjectCapabilityPayload = {
        code: formData.code,
        name: formData.name || null,
        description: formData.description || null,
        isActive: formData.isActive === 'true',
      };
      onSubmit(payload);
    } else {
      const payload: CreateProjectCapabilityPayload = {
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
      <FormGenerator<ProjectCapabilityFormInput>
        id="project-capability-form"
        fields={PROJECT_CAPABILITY_FORM_FIELDS}
        onSubmit={handleFormSubmit}
        schema={(isEdit ? editProjectCapabilitySchema : createProjectCapabilitySchema) as any}
        defaultValues={defaultValues}
        externalErrors={serverErrors}
        actions={
          <div className="flex gap-2 justify-end px-0 pb-0">
            <ProjectCapabilityFormActions
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
