'use client';

import { useMemo, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { useEmployeesInfinite } from '@/domains/manpower';
import { useProjectsInfinite } from '@/domains/project-control';
import { Button } from '@/shared/components/atoms';
import { FormCard } from '@/shared/components/molecules';
import type { FormFieldConfig } from '@/shared/components/organisms/FormGenerator';
import { FormGenerator } from '@/shared/components/organisms/FormGenerator';
import { CREATE_MOM_LABELS } from '../constants';
import { createMomSchema } from '../schemas';
import type { CreateMomFormValues } from '../types';
import { TodoSection } from './TodoSection';

const labels = CREATE_MOM_LABELS;

function useMomFormFields(companyId?: string): FormFieldConfig<CreateMomFormValues>[] {
  const [projectSearch, setProjectSearch] = useState('');
  const [participantSearch, setParticipantSearch] = useState('');
  const [selectedCompanyId] = useState(companyId ?? '');

  const projects = useProjectsInfinite({ search: projectSearch, companyId: selectedCompanyId });
  const employees = useEmployeesInfinite({
    companyId: selectedCompanyId,
    search: participantSearch,
  });

  const projectOptionList = useMemo(
    () => projects.options.map((option) => ({ id: option.value, name: option.label })),
    [projects.options]
  );

  const fields = useMemo<FormFieldConfig<CreateMomFormValues>[]>(
    () => [
      {
        name: 'title',
        type: 'text',
        label: labels.FIELDS.TITLE,
        placeholder: labels.FIELDS.TITLE_PLACEHOLDER,
        required: true,
        colSpan: 12,
      },
      {
        name: 'projectIds',
        type: 'select',
        label: labels.FIELDS.PROJECT,
        placeholder: labels.FIELDS.PROJECT_PLACEHOLDER,
        isMulti: true,
        options: projects.options,
        isLoading: projects.isLoading || projects.isFetching,
        onScrollToBottom: projects.hasMore ? projects.loadMore : undefined,
        onSearchChange: setProjectSearch,
        colSpan: 12,
      },
      {
        name: 'location',
        type: 'text',
        label: labels.FIELDS.LOCATION,
        placeholder: labels.FIELDS.LOCATION_PLACEHOLDER,
        required: true,
        colSpan: 12,
      },
      {
        name: 'participantIds',
        type: 'select',
        label: labels.FIELDS.PARTICIPANTS,
        placeholder: labels.FIELDS.PARTICIPANTS_PLACEHOLDER,
        required: true,
        isMulti: true,
        options: employees.options,
        isLoading: employees.isLoading,
        onScrollToBottom: employees.hasMore ? employees.loadMore : undefined,
        onSearchChange: setParticipantSearch,
        colSpan: 12,
      },
      {
        name: 'startDate',
        type: 'date',
        label: labels.FIELDS.START_DATE,
        placeholder: labels.FIELDS.START_DATE_PLACEHOLDER,
        required: true,
        colSpan: 3,
      },
      {
        name: 'startTime',
        type: 'time',
        label: labels.FIELDS.START_TIME,
        required: true,
        colSpan: 3,
      },
      {
        name: 'endDate',
        type: 'date',
        label: labels.FIELDS.END_DATE,
        placeholder: labels.FIELDS.END_DATE_PLACEHOLDER,
        required: true,
        colSpan: 3,
      },
      {
        name: 'endTime',
        type: 'time',
        label: labels.FIELDS.END_TIME,
        required: true,
        colSpan: 3,
      },
      {
        name: 'topic',
        type: 'textarea',
        label: labels.FIELDS.TOPIC,
        placeholder: labels.FIELDS.TOPIC_PLACEHOLDER,
        required: true,
        colSpan: 12,
      },
      {
        name: 'decision',
        type: 'textarea',
        label: labels.FIELDS.DECISION,
        placeholder: labels.FIELDS.DECISION_PLACEHOLDER,
        required: true,
        colSpan: 12,
      },
      {
        type: 'custom',
        content: <TodoSection projects={projectOptionList} companyId={selectedCompanyId} />,
        colSpan: 12,
      },
    ],
    [projects, employees, projectOptionList, selectedCompanyId]
  );

  return fields;
}

const DEFAULT_VALUES: CreateMomFormValues = {
  title: '',
  companyId: '',
  projectIds: [],
  location: '',
  participantIds: [],
  startDate: '',
  startTime: '',
  endDate: '',
  endTime: '',
  topic: '',
  decision: '',
  todo: {},
};

function CreateMomFormActions({
  isSubmitting,
  onCancel,
}: {
  isSubmitting?: boolean;
  onCancel?: () => void;
}) {
  const { formState } = useFormContext<CreateMomFormValues>();

  return (
    <div className="flex gap-2 justify-end">
      <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
        {labels.BUTTONS.CANCEL}
      </Button>
      <Button type="submit" form="create-mom-form" disabled={!formState.isValid || isSubmitting}>
        {isSubmitting ? labels.BUTTONS.SAVING : labels.BUTTONS.SAVE}
      </Button>
    </div>
  );
}

export interface CreateMomFormProps {
  mode?: 'create' | 'edit';
  companyId?: string;
  defaultValues?: CreateMomFormValues;
  onSubmit: (values: CreateMomFormValues) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function CreateMomForm({
  companyId,
  defaultValues,
  onSubmit,
  onCancel,
  isSubmitting,
}: CreateMomFormProps) {
  const initialCompanyId = companyId ?? defaultValues?.companyId;
  const fields = useMomFormFields(initialCompanyId);
  const resolvedDefaultValues = useMemo(
    () =>
      defaultValues
        ? { ...DEFAULT_VALUES, ...defaultValues }
        : { ...DEFAULT_VALUES, companyId: initialCompanyId },
    [defaultValues, initialCompanyId]
  );

  return (
    <FormCard>
      <FormGenerator<CreateMomFormValues>
        id="create-mom-form"
        fields={fields}
        onSubmit={onSubmit}
        schema={createMomSchema}
        defaultValues={resolvedDefaultValues}
        actions={<CreateMomFormActions isSubmitting={isSubmitting} onCancel={onCancel} />}
      />
    </FormCard>
  );
}
