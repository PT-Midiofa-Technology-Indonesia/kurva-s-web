'use client';

import { useMemo } from 'react';
import { useFormContext } from 'react-hook-form';
import { Button } from '@/components/atoms';
import { FormCard } from '@/components/molecules';
import { FormGenerator } from '@/components/organisms/FormGenerator';
import type { FormFieldConfig } from '@/shared/components/organisms/FormGenerator';
import { noWhitespace } from '@/shared/utils/masks';
import { EMPLOYEE_GRADE_LABELS, PLACEHOLDERS, STATUS_OPTIONS } from '../constants';
import { createEmployeeGradeSchema, editEmployeeGradeSchema } from '../schemas';
import type {
  CreateEmployeeGradePayload,
  EmployeeGrade,
  UpdateEmployeeGradePayload,
} from '../types';

interface EmployeeGradeFormInput {
  code: string;
  name: string;
  description?: string;
  isActive: string;
}

function buildFormFields(): FormFieldConfig<EmployeeGradeFormInput>[] {
  return [
    {
      name: 'code',
      type: 'text',
      label: EMPLOYEE_GRADE_LABELS.CREATE.FIELDS.CODE,
      placeholder: PLACEHOLDERS.CODE,
      required: true,
      colSpan: 4,
      mask: noWhitespace,
    },
    {
      name: 'name',
      type: 'text',
      label: EMPLOYEE_GRADE_LABELS.CREATE.FIELDS.NAME,
      placeholder: PLACEHOLDERS.NAME,
      required: true,
      colSpan: 4,
    },
    {
      name: 'isActive',
      type: 'select',
      label: EMPLOYEE_GRADE_LABELS.CREATE.FIELDS.STATUS,
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
      label: EMPLOYEE_GRADE_LABELS.CREATE.FIELDS.DESCRIPTION,
      placeholder: PLACEHOLDERS.DESCRIPTION,
      required: false,
      colSpan: 12,
    },
  ];
}

type FormMode = 'create' | 'edit';

function EmployeeGradeFormActions({
  mode = 'create',
  isSubmitting,
  onCancel,
}: {
  mode: FormMode;
  isSubmitting?: boolean;
  onCancel?: () => void;
}) {
  const { formState } = useFormContext<EmployeeGradeFormInput>();
  const labels = mode === 'edit' ? EMPLOYEE_GRADE_LABELS.EDIT : EMPLOYEE_GRADE_LABELS.CREATE;

  return (
    <div className="flex gap-2 justify-end">
      <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
        {labels.BUTTONS.CANCEL}
      </Button>
      <Button
        type="submit"
        form="employee-grade-form"
        disabled={!formState.isValid || isSubmitting}
      >
        {isSubmitting ? labels.BUTTONS.SAVING : labels.BUTTONS.SAVE}
      </Button>
    </div>
  );
}

interface EmployeeGradeFormProps {
  mode?: FormMode;
  employeeGrade?: EmployeeGrade | null;
  onSubmit?: (payload: CreateEmployeeGradePayload | UpdateEmployeeGradePayload) => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
  serverErrors?: Record<string, string[]>;
}

export function EmployeeGradeForm({
  mode = 'create',
  employeeGrade,
  onSubmit,
  onCancel,
  isSubmitting,
  serverErrors,
}: EmployeeGradeFormProps) {
  const isEdit = mode === 'edit';

  const fields = useMemo(() => buildFormFields(), []);

  const defaultValues = useMemo((): EmployeeGradeFormInput => {
    if (!employeeGrade) {
      return {
        code: '',
        name: '',
        description: '',
        isActive: 'true',
      };
    }
    return {
      code: employeeGrade.code ?? '',
      name: employeeGrade.name ?? '',
      description: employeeGrade.description ?? '',
      isActive: employeeGrade.isActive ? 'true' : 'false',
    };
  }, [employeeGrade]);

  const handleFormSubmit = (formData: EmployeeGradeFormInput) => {
    if (!onSubmit) return;

    if (isEdit) {
      const payload: UpdateEmployeeGradePayload = {
        code: formData.code,
        name: formData.name || null,
        description: formData.description || null,
        isActive: formData.isActive === 'true',
      };
      onSubmit(payload);
    } else {
      const payload: CreateEmployeeGradePayload = {
        code: formData.code,
        name: formData.name,
        description: formData.description || null,
        isActive: formData.isActive === 'true',
      };
      onSubmit(payload);
    }
  };

  return (
    <FormCard>
      <FormGenerator<EmployeeGradeFormInput>
        id="employee-grade-form"
        fields={fields}
        onSubmit={handleFormSubmit}
        schema={(isEdit ? editEmployeeGradeSchema : createEmployeeGradeSchema) as any}
        defaultValues={defaultValues}
        externalErrors={serverErrors}
        actions={
          <div className="flex gap-2 justify-end px-0 pb-0">
            <EmployeeGradeFormActions
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
