'use client';

import { AlertTriangle } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { Button } from '@/components/atoms';
import { FormCard } from '@/components/molecules';
import { FormGenerator } from '@/components/organisms/FormGenerator';
import { useCompaniesInfinite } from '@/domains/company/hooks/use-companies-infinite';
import type { EmployeeListItem } from '@/domains/manpower/types';
import type {
  FieldRule,
  FormFieldConfig,
  HideRule,
} from '@/shared/components/organisms/FormGenerator';
import { Separator } from '@/shared/components/ui';
import { useUserTypes } from '@/shared/hooks/use-enums';
import { maskPhone, noWhitespace, stripPhonePrefix } from '@/shared/utils/masks';
import type { CreateUserPayload } from '../api/create-user';
import { PLACEHOLDERS, STATUS_SELECT_OPTIONS, USER_LABELS } from '../constants';
import { useEmployeesInfinite } from '../hooks/use-employees-infinite';
import { useRolesInfinite } from '../hooks/use-roles-infinite';
import { createUserSchema, createUserSchemaEdit, type UserFormInput } from '../schemas/user.schema';
import type { UserDetail } from '../types';

function SeparatorWithEmployeeAlert() {
  const userType = useWatch<UserFormInput, 'userType'>({ name: 'userType' });

  return (
    <div className="flex flex-col gap-4">
      <Separator />
      {userType === 'employee' && (
        <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4">
          <AlertTriangle className="mt-0.5 size-5 shrink-0 text-amber-500" />
          <div className="flex flex-col gap-0.5">
            <p className="text-sm font-semibold text-amber-900">
              {USER_LABELS.CREATE.EMPLOYEE_ALERT.TITLE}
            </p>
            <p className="text-sm text-slate-500">
              {USER_LABELS.CREATE.EMPLOYEE_ALERT.DESCRIPTION}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

interface EmployeeAutoFillProps {
  employees: EmployeeListItem[];
  onCompanyChange: (companyId: string | null) => void;
}

/**
 * Invisible component rendered inside FormProvider (via actions slot).
 * Watches companyId → clears employeeId when company changes.
 * Watches employeeId → auto-fills name/email/phone when employee is selected.
 */
function EmployeeAutoFill({ employees, onCompanyChange }: EmployeeAutoFillProps) {
  const { setValue } = useFormContext<UserFormInput>();
  const companyId = useWatch<UserFormInput, 'companyId'>({ name: 'companyId' });
  const employeeId = useWatch<UserFormInput, 'employeeId'>({ name: 'employeeId' });

  // Ref so changing employees list (infinite scroll pages) doesn't re-trigger autofill
  const employeesRef = useRef<EmployeeListItem[]>([]);
  useEffect(() => {
    employeesRef.current = employees;
  }, [employees]);

  // Skip clearing employeeId on initial mount (preserves edit-mode values)
  const isMounted = useRef(false);
  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }
    onCompanyChange(companyId ?? null);
    setValue('employeeId', null, { shouldValidate: true });
  }, [companyId, onCompanyChange, setValue]);

  // Skip autofill on initial mount (preserves edit-mode values)
  const isInitialSelect = useRef(true);
  useEffect(() => {
    if (isInitialSelect.current) {
      isInitialSelect.current = false;
      return;
    }
    if (!employeeId) return;
    const employee = employeesRef.current.find((e) => e.id === employeeId);
    if (!employee) return;
    setValue('name', employee.fullName, { shouldValidate: true });
    setValue('email', employee.email, { shouldValidate: true });
    setValue('phone', stripPhonePrefix(employee.phone), { shouldValidate: true });
  }, [employeeId, setValue]);

  return null;
}

const ENABLE_FOR_NON_EMPLOYEE: FieldRule<UserFormInput>[] = [
  { conditions: [{ field: 'userType', value: 'non_employee' }] },
];

const HIDE_FOR_NON_EMPLOYEE: HideRule<UserFormInput>[] = [
  {
    conditions: [{ field: 'userType', value: 'employee' }],
    defaultHidden: true,
  },
];

const REQUIRED_FOR_EMPLOYEE: FieldRule<UserFormInput>[] = [
  { conditions: [{ field: 'userType', value: 'employee' }] },
];

const BASE_FORM_FIELDS: FormFieldConfig<UserFormInput>[] = [
  {
    name: 'userType',
    type: 'select',
    label: USER_LABELS.CREATE.FIELDS.USER_TYPE,
    required: true,
    options: [],
    colSpan: 4,
    isSearchable: false,
  },
  {
    name: 'companyId',
    type: 'select',
    label: USER_LABELS.CREATE.FIELDS.COMPANY,
    required: false,
    options: [],
    isClearable: true,
    isSearchable: true,
    colSpan: 4,
    hideRules: HIDE_FOR_NON_EMPLOYEE,
    requiredRules: REQUIRED_FOR_EMPLOYEE,
  },
  {
    name: 'employeeId',
    type: 'select',
    label: USER_LABELS.CREATE.FIELDS.EMPLOYEE_NAME,
    required: false,
    options: [],
    isClearable: true,
    isSearchable: true,
    colSpan: 4,
    hideRules: HIDE_FOR_NON_EMPLOYEE,
    requiredRules: REQUIRED_FOR_EMPLOYEE,
  },
  {
    type: 'custom',
    content: <SeparatorWithEmployeeAlert />,
    colSpan: 12,
  },
  {
    name: 'name',
    type: 'text',
    label: USER_LABELS.CREATE.FIELDS.NAME,
    placeholder: PLACEHOLDERS.NAME,
    required: true,
    colSpan: 4,
    enableRules: ENABLE_FOR_NON_EMPLOYEE,
  },
  {
    name: 'email',
    type: 'text',
    label: USER_LABELS.CREATE.FIELDS.EMAIL,
    placeholder: PLACEHOLDERS.EMAIL,
    required: true,
    colSpan: 4,
    enableRules: ENABLE_FOR_NON_EMPLOYEE,
    mask: noWhitespace,
  },
  {
    name: 'phone',
    type: 'text',
    label: USER_LABELS.CREATE.FIELDS.PHONE_NUMBER,
    placeholder: PLACEHOLDERS.PHONE_NUMBER,
    required: true,
    colSpan: 4,
    enableRules: ENABLE_FOR_NON_EMPLOYEE,
    validateOnBlur: true,
    mask: maskPhone,
    prefix: '+62',
  },
  {
    name: 'roleId',
    type: 'select',
    label: USER_LABELS.CREATE.FIELDS.ROLE,
    required: true,
    options: [],
    isSearchable: true,
    placeholder: PLACEHOLDERS.ROLE_SELECT,
    colSpan: 4,
  },
  {
    name: 'isActive',
    type: 'select',
    label: USER_LABELS.CREATE.FIELDS.STATUS,
    required: true,
    options: STATUS_SELECT_OPTIONS,
    colSpan: 4,
    isSearchable: false,
  },
  {
    name: 'password',
    type: 'password',
    label: USER_LABELS.CREATE.FIELDS.PASSWORD,
    placeholder: PLACEHOLDERS.PASSWORD,
    required: true,
    colSpan: 4,
    mask: noWhitespace,
  },
];

type FormMode = 'create' | 'edit';

interface UserFormProps {
  mode?: FormMode;
  user?: UserDetail | null;
  onSubmit?: (payload: CreateUserPayload) => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
  serverErrors?: Record<string, string[]>;
}

function UserFormActions({
  mode = 'create',
  onCancel,
  isSubmitting,
}: {
  mode: 'create' | 'edit';
  onCancel?: () => void;
  isSubmitting?: boolean;
}) {
  const { formState } = useFormContext<UserFormInput>();

  return (
    <div className="flex gap-2 justify-end">
      <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
        {mode === 'edit' ? USER_LABELS.EDIT.BUTTONS.CANCEL : USER_LABELS.CREATE.BUTTONS.CANCEL}
      </Button>
      <Button type="submit" form="user-form" disabled={!formState.isValid || isSubmitting}>
        {isSubmitting
          ? mode === 'edit'
            ? USER_LABELS.EDIT.BUTTONS.SAVING
            : USER_LABELS.CREATE.BUTTONS.SAVING
          : mode === 'edit'
            ? USER_LABELS.EDIT.BUTTONS.SAVE
            : USER_LABELS.CREATE.BUTTONS.SAVE}
      </Button>
    </div>
  );
}

export function UserForm({
  mode = 'create',
  user,
  onSubmit,
  onCancel,
  isSubmitting,
  serverErrors,
}: UserFormProps) {
  const isEdit = mode === 'edit';

  // Track selected company so employee list can be filtered
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(
    user?.companyId ?? null
  );

  const { options: roleOptions, isLoading: rolesLoading } = useRolesInfinite({ perPage: 10 });
  const { data: userTypeOptions } = useUserTypes();

  const {
    options: companyOptions,
    isLoading: companiesLoading,
    hasMore: companiesHasMore,
    loadMore: companiesLoadMore,
  } = useCompaniesInfinite({ perPage: 20, isActive: true });

  const {
    options: employeeOptions,
    employees,
    isLoading: employeesLoading,
    hasMore: employeesHasMore,
    loadMore: employeesLoadMore,
  } = useEmployeesInfinite({
    perPage: 20,
    companyId: selectedCompanyId,
    enabled: !!selectedCompanyId,
  });

  const formFields = useMemo(() => {
    const fallbackOptions = [{ label: 'No options available', value: '' }];
    return BASE_FORM_FIELDS.map((field) => {
      if (!('name' in field)) return field;
      if (field.name === 'roleId') {
        return { ...field, options: roleOptions, isLoading: rolesLoading };
      }
      if (field.name === 'userType') {
        return { ...field, options: userTypeOptions ?? fallbackOptions };
      }
      if (field.name === 'password') {
        return { ...field, required: !isEdit };
      }
      if (field.name === 'companyId') {
        return {
          ...field,
          options: companyOptions,
          isLoading: companiesLoading,
          onScrollToBottom: companiesHasMore ? () => companiesLoadMore() : undefined,
        };
      }
      if (field.name === 'employeeId') {
        return {
          ...field,
          options: employeeOptions,
          isLoading: employeesLoading,
          disabled: !selectedCompanyId,
          onScrollToBottom: employeesHasMore ? () => employeesLoadMore() : undefined,
        };
      }
      return field;
    });
  }, [
    roleOptions,
    rolesLoading,
    isEdit,
    userTypeOptions,
    companyOptions,
    companiesLoading,
    companiesHasMore,
    companiesLoadMore,
    employeeOptions,
    employeesLoading,
    employeesHasMore,
    employeesLoadMore,
    selectedCompanyId,
  ]);

  const defaultValues = useMemo(() => {
    if (!user) return undefined;
    return {
      userType: (user.userType ?? 'non_employee') as 'employee' | 'non_employee',
      roleId: user.role?.id?.toString() ?? '',
      isActive: user.isActive ? '1' : '0',
      name: user.name ?? '',
      email: user.email ?? '',
      phone: stripPhonePrefix(user.phoneNumber),
      companyId: user.companyId ?? null,
      employeeId: user.employeeId ?? null,
      password: '',
    };
  }, [user]);

  const handleFormSubmit = (formData: any) => {
    if (!onSubmit) return;
    onSubmit(formData);
  };

  return (
    <FormCard>
      <FormGenerator<UserFormInput>
        id="user-form"
        fields={formFields}
        onSubmit={handleFormSubmit}
        schema={isEdit ? (createUserSchemaEdit as any) : (createUserSchema as any)}
        defaultValues={defaultValues}
        externalErrors={serverErrors}
        actions={
          <div className="flex flex-col gap-4 px-0 pb-0">
            {/* Invisible component; rendered inside FormProvider to access form context */}
            <EmployeeAutoFill employees={employees} onCompanyChange={setSelectedCompanyId} />
            <div className="flex gap-2 justify-end">
              <UserFormActions
                mode={isEdit ? 'edit' : 'create'}
                onCancel={onCancel}
                isSubmitting={isSubmitting}
              />
            </div>
          </div>
        }
      />
    </FormCard>
  );
}
