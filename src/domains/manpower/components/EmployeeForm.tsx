'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { Button, type SelectOption } from '@/components/atoms';
import { FormCard } from '@/components/molecules';
import { FormGenerator } from '@/components/organisms/FormGenerator';
import type { FormFieldConfig } from '@/shared/components/organisms/FormGenerator';
import { Separator } from '@/shared/components/ui';
import { useEmployeeTypes, useGenders } from '@/shared/hooks/use-enums';
import { useCities, useDistricts, useProvinces, useVillages } from '@/shared/hooks/use-geography';
import { maskPhone, noWhitespace, stripPhonePrefix } from '@/shared/utils/masks';
import type { CreateEmployeePayload } from '../api/create-employee';
import type { UpdateEmployeePayload } from '../api/update-employee';
import { MANPOWER_LABELS, PLACEHOLDERS, STATUS_OPTIONS } from '../constants';
import { employeeFormSchema } from '../schemas/employee-form';
import type { Employee } from '../types';

interface EmployeeFormInput {
  fullName: string;
  employeeType: string;
  isActive: string;
  gender: string;
  birthPlace: string;
  birthDate: string;
  phone: string;
  email: string;
  provinceId: string | null;
  cityId: string | null;
  districtId: string | null;
  villageId: string | null;
  addressDetail: string;
}

interface FormFieldOptions {
  employeeTypeOptions: SelectOption[];
  genderOptions: SelectOption[];
  provinceOptions: SelectOption[];
  cityOptions: SelectOption[];
  districtOptions: SelectOption[];
  villageOptions: SelectOption[];
  isCitiesLoading: boolean;
  isDistrictsLoading: boolean;
  isVillagesLoading: boolean;
}

function buildFormFields(options: FormFieldOptions): FormFieldConfig<EmployeeFormInput>[] {
  const {
    employeeTypeOptions,
    genderOptions,
    provinceOptions,
    cityOptions,
    districtOptions,
    villageOptions,
    isCitiesLoading,
    isDistrictsLoading,
    isVillagesLoading,
  } = options;

  return [
    {
      name: 'fullName',
      type: 'text',
      label: MANPOWER_LABELS.CREATE.FIELDS.FULL_NAME,
      placeholder: PLACEHOLDERS.FULL_NAME,
      required: true,
      colSpan: 4,
    },
    {
      name: 'employeeType',
      type: 'select',
      label: MANPOWER_LABELS.CREATE.FIELDS.EMPLOYEE_TYPE,
      placeholder: PLACEHOLDERS.EMPLOYEE_TYPE,
      required: true,
      options: employeeTypeOptions,
      isSearchable: false,
      colSpan: 4,
    },
    {
      name: 'isActive',
      type: 'select',
      label: MANPOWER_LABELS.CREATE.FIELDS.STATUS,
      placeholder: PLACEHOLDERS.STATUS,
      required: true,
      options: STATUS_OPTIONS,
      isSearchable: false,
      colSpan: 4,
    },
    {
      name: 'gender',
      type: 'select',
      label: MANPOWER_LABELS.CREATE.FIELDS.GENDER,
      placeholder: PLACEHOLDERS.GENDER,
      required: true,
      options: genderOptions,
      isSearchable: false,
      colSpan: 4,
    },
    {
      name: 'birthPlace',
      type: 'text',
      label: MANPOWER_LABELS.CREATE.FIELDS.BIRTH_PLACE,
      placeholder: PLACEHOLDERS.BIRTH_PLACE,
      required: true,
      colSpan: 4,
    },
    {
      name: 'birthDate',
      type: 'date',
      label: MANPOWER_LABELS.CREATE.FIELDS.BIRTH_DATE,
      placeholder: PLACEHOLDERS.BIRTH_DATE,
      required: true,
      colSpan: 4,
    },
    {
      name: 'phone',
      type: 'text',
      label: MANPOWER_LABELS.CREATE.FIELDS.PHONE,
      placeholder: PLACEHOLDERS.PHONE,
      required: true,
      colSpan: 6,
      validateOnBlur: true,
      mask: maskPhone,
      prefix: '+62',
    },
    {
      name: 'email',
      type: 'text',
      label: MANPOWER_LABELS.CREATE.FIELDS.EMAIL,
      placeholder: PLACEHOLDERS.EMAIL,
      required: true,
      colSpan: 6,
      validateOnBlur: true,
      mask: noWhitespace,
    },
    {
      type: 'custom',
      content: (
        <div className="space-y-4">
          <Separator className="flex-1 h-[0.05rem]" />
          <p className="text-sm font-medium text-slate-500">
            {MANPOWER_LABELS.CREATE.FIELDS.ADDRESS_SECTION}
          </p>
        </div>
      ),
      colSpan: 12,
    },
    {
      name: 'provinceId',
      type: 'select',
      label: MANPOWER_LABELS.CREATE.FIELDS.PROVINCE,
      placeholder: PLACEHOLDERS.PROVINCE,
      required: false,
      options: provinceOptions,
      isSearchable: true,
      isClearable: true,
      colSpan: 3,
    },
    {
      name: 'cityId',
      type: 'select',
      label: MANPOWER_LABELS.CREATE.FIELDS.CITY,
      placeholder: PLACEHOLDERS.CITY,
      required: false,
      options: cityOptions,
      isSearchable: true,
      isClearable: true,
      isLoading: isCitiesLoading,
      colSpan: 3,
      enableRules: [
        {
          conditions: [{ field: 'provinceId', evaluator: (val) => !!val }],
        },
      ],
    },
    {
      name: 'districtId',
      type: 'select',
      label: MANPOWER_LABELS.CREATE.FIELDS.DISTRICT,
      placeholder: PLACEHOLDERS.DISTRICT,
      required: false,
      options: districtOptions,
      isSearchable: true,
      isClearable: true,
      isLoading: isDistrictsLoading,
      colSpan: 3,
      enableRules: [
        {
          conditions: [{ field: 'cityId', evaluator: (val) => !!val }],
        },
      ],
    },
    {
      name: 'villageId',
      type: 'select',
      label: MANPOWER_LABELS.CREATE.FIELDS.VILLAGE,
      placeholder: PLACEHOLDERS.VILLAGE,
      required: false,
      options: villageOptions,
      isSearchable: true,
      isClearable: true,
      isLoading: isVillagesLoading,
      colSpan: 3,
      enableRules: [
        {
          conditions: [{ field: 'districtId', evaluator: (val) => !!val }],
        },
      ],
    },
    {
      name: 'addressDetail',
      type: 'textarea',
      label: MANPOWER_LABELS.CREATE.FIELDS.ADDRESS_DETAIL,
      placeholder: PLACEHOLDERS.ADDRESS_DETAIL,
      required: false,
      colSpan: 12,
    },
  ];
}

type FormMode = 'create' | 'edit';

function EmployeeFormActions({
  mode = 'create',
  isSubmitting,
  onCancel,
}: {
  mode: FormMode;
  isSubmitting?: boolean;
  onCancel?: () => void;
}) {
  const { formState } = useFormContext<EmployeeFormInput>();
  const labels = mode === 'edit' ? MANPOWER_LABELS.EDIT : MANPOWER_LABELS.CREATE;

  return (
    <div className="flex gap-2 justify-end">
      <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
        {labels.BUTTONS.CANCEL}
      </Button>
      <Button type="submit" form="employee-form" disabled={!formState.isValid || isSubmitting}>
        {isSubmitting ? labels.BUTTONS.SAVING : labels.BUTTONS.SAVE}
      </Button>
    </div>
  );
}

function GeographyObserver({
  onProvinceChange,
  onCityChange,
  onDistrictChange,
}: {
  onProvinceChange: (id: string) => void;
  onCityChange: (id: string) => void;
  onDistrictChange: (id: string) => void;
}) {
  const { control, setValue } = useFormContext<EmployeeFormInput>();
  const provinceId = useWatch({ control, name: 'provinceId' });
  const cityId = useWatch({ control, name: 'cityId' });
  const districtId = useWatch({ control, name: 'districtId' });

  const prevProvinceRef = useRef(provinceId);
  const prevCityRef = useRef(cityId);
  const prevDistrictRef = useRef(districtId);

  useEffect(() => {
    if (prevProvinceRef.current === provinceId) return;
    prevProvinceRef.current = provinceId;
    // Province changed — reset all dependents
    setValue('cityId', null as any);
    setValue('districtId', null as any);
    setValue('villageId', null as any);
    onProvinceChange(provinceId ?? '');
    onCityChange('');
    onDistrictChange('');
  }, [provinceId, setValue, onProvinceChange, onCityChange, onDistrictChange]);

  useEffect(() => {
    if (prevCityRef.current === cityId) return;
    prevCityRef.current = cityId;
    // City changed — reset district and village
    setValue('districtId', null as any);
    setValue('villageId', null as any);
    onCityChange(cityId ?? '');
    onDistrictChange('');
  }, [cityId, setValue, onCityChange, onDistrictChange]);

  useEffect(() => {
    if (prevDistrictRef.current === districtId) return;
    prevDistrictRef.current = districtId;
    setValue('villageId', null as any);
    onDistrictChange(districtId ?? '');
  }, [districtId, setValue, onDistrictChange]);

  return null;
}

interface EmployeeFormProps {
  mode?: FormMode;
  employee?: Employee | null;
  defaultEmployeeType?: string;
  onSubmit?: (payload: CreateEmployeePayload | UpdateEmployeePayload) => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
  serverErrors?: Record<string, string[]>;
}

export function EmployeeForm({
  mode = 'create',
  employee,
  defaultEmployeeType,
  onSubmit,
  onCancel,
  isSubmitting,
  serverErrors,
}: EmployeeFormProps) {
  const isEdit = mode === 'edit';

  // Initialize geography selections from existing employee data (edit mode)
  const [selectedProvinceId, setSelectedProvinceId] = useState<string>(
    employee?.province?.id ?? ''
  );
  const [selectedCityId, setSelectedCityId] = useState<string>(employee?.city?.id ?? '');
  const [selectedDistrictId, setSelectedDistrictId] = useState<string>(
    employee?.district?.id ?? ''
  );

  // Sync geography state when employee data changes
  useEffect(() => {
    if (employee) {
      setSelectedProvinceId(employee.province?.id ?? '');
      setSelectedCityId(employee.city?.id ?? '');
      setSelectedDistrictId(employee.district?.id ?? '');
    }
  }, [employee]);

  const { data: employeeTypeData } = useEmployeeTypes();
  const { data: genderData } = useGenders();
  const { data: provinceData } = useProvinces();
  const { data: cityData, isFetching: isCitiesLoading } = useCities(selectedProvinceId);
  const { data: districtData, isFetching: isDistrictsLoading } = useDistricts(selectedCityId);
  const { data: villageData, isFetching: isVillagesLoading } = useVillages(selectedDistrictId);

  const fallbackOptions = useMemo(() => [{ label: 'No options available', value: '' }], []);

  const fields = useMemo(
    () =>
      buildFormFields({
        employeeTypeOptions: employeeTypeData ?? fallbackOptions,
        genderOptions: genderData ?? fallbackOptions,
        provinceOptions: provinceData ?? [],
        cityOptions: cityData ?? [],
        districtOptions: districtData ?? [],
        villageOptions: villageData ?? [],
        isCitiesLoading,
        isDistrictsLoading,
        isVillagesLoading,
      }),
    [
      employeeTypeData,
      genderData,
      provinceData,
      cityData,
      districtData,
      villageData,
      isCitiesLoading,
      isDistrictsLoading,
      isVillagesLoading,
      fallbackOptions,
    ]
  );

  const defaultValues = useMemo((): EmployeeFormInput => {
    if (!employee) {
      return {
        fullName: '',
        employeeType: defaultEmployeeType ?? '',
        isActive: 'true',
        gender: '',
        birthPlace: '',
        birthDate: '',
        phone: '',
        email: '',
        provinceId: null,
        cityId: null,
        districtId: null,
        villageId: null,
        addressDetail: '',
      };
    }
    return {
      fullName: employee.fullName ?? '',
      employeeType: employee.employeeType ?? '',
      isActive: employee.isActive ? 'true' : 'false',
      gender: employee.gender ?? '',
      birthPlace: employee.birthPlace ?? '',
      birthDate: employee.birthDate ?? '',
      phone: stripPhonePrefix(employee.phone),
      email: employee.email ?? '',
      provinceId: employee.province?.id ?? null,
      cityId: employee.city?.id ?? null,
      districtId: employee.district?.id ?? null,
      villageId: employee.village?.id ?? null,
      addressDetail: employee.addressDetail ?? '',
    };
  }, [employee, defaultEmployeeType]);

  const handleFormSubmit = (formData: EmployeeFormInput) => {
    if (!onSubmit) return;

    const payload = {
      fullName: formData.fullName,
      employeeType: formData.employeeType,
      isActive: formData.isActive === 'true',
      gender: formData.gender,
      birthPlace: formData.birthPlace,
      birthDate: formData.birthDate,
      phone: formData.phone,
      email: formData.email,
      provinceId: formData.provinceId || undefined,
      cityId: formData.cityId || undefined,
      districtId: formData.districtId || undefined,
      villageId: formData.villageId || undefined,
      addressDetail: formData.addressDetail || undefined,
    };

    onSubmit(payload);
  };

  return (
    <FormCard>
      <FormGenerator<EmployeeFormInput>
        id="employee-form"
        fields={fields}
        onSubmit={handleFormSubmit}
        schema={employeeFormSchema as any}
        defaultValues={defaultValues}
        externalErrors={serverErrors}
        actions={
          <div className="flex gap-2 justify-end px-0 pb-0">
            <GeographyObserver
              onProvinceChange={setSelectedProvinceId}
              onCityChange={setSelectedCityId}
              onDistrictChange={setSelectedDistrictId}
            />
            <EmployeeFormActions
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
