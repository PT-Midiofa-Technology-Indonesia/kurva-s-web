'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { Button, type SelectOption } from '@/components/atoms';
import { FormCard, WorkDaysSelector } from '@/components/molecules';
import { FormGenerator } from '@/components/organisms/FormGenerator';
import { useCompaniesInfinite } from '@/domains/company';
import type { FormFieldConfig } from '@/shared/components/organisms/FormGenerator';
import { Separator } from '@/shared/components/ui';
import { useDebounce } from '@/shared/hooks/use-debounce';
import {
  useCities,
  useDistricts,
  useProvinces,
  useProvinceTimezone,
  useVillages,
} from '@/shared/hooks/use-geography';
import { maskPhone, noWhitespace, stripPhonePrefix } from '@/shared/utils/masks';
import { formatTimezone } from '@/shared/utils/timezone';
import type { CreateOfficePayload } from '../api/create-office';
import type { UpdateOfficePayload } from '../api/update-office';
import { OFFICE_LABELS, OFFICE_TYPE_OPTIONS, PLACEHOLDERS, STATUS_OPTIONS } from '../constants';
import { createOfficeSchema, editOfficeSchema, type OfficeFormInput } from '../schemas';
import type { Office } from '../types';

// --- Form field builder ---
interface FormFieldOptions {
  companyOptions: SelectOption[];
  officeTypeOptions: SelectOption[];
  provinceOptions: SelectOption[];
  cityOptions: SelectOption[];
  districtOptions: SelectOption[];
  villageOptions: SelectOption[];
  isCompaniesLoading: boolean;
  isCitiesLoading: boolean;
  isDistrictsLoading: boolean;
  isVillagesLoading: boolean;
  onCompanyScrollToBottom: () => void;
  onCompanySearchChange: (value: string) => void;
  provinceTimezoneHint?: string;
}

function buildFormFields(options: FormFieldOptions): FormFieldConfig<OfficeFormInput>[] {
  const {
    companyOptions,
    officeTypeOptions,
    provinceOptions,
    cityOptions,
    districtOptions,
    villageOptions,
    isCompaniesLoading,
    isCitiesLoading,
    isDistrictsLoading,
    isVillagesLoading,
    onCompanyScrollToBottom,
    onCompanySearchChange,
    provinceTimezoneHint,
  } = options;

  return [
    {
      name: 'code',
      type: 'text',
      label: OFFICE_LABELS.CREATE.FIELDS.CODE,
      placeholder: PLACEHOLDERS.CODE,
      required: true,
      colSpan: 4,
      mask: noWhitespace,
    },
    {
      name: 'name',
      type: 'text',
      label: OFFICE_LABELS.CREATE.FIELDS.NAME,
      placeholder: PLACEHOLDERS.NAME,
      required: true,
      colSpan: 4,
    },
    {
      name: 'type',
      type: 'select',
      label: OFFICE_LABELS.CREATE.FIELDS.TYPE,
      placeholder: PLACEHOLDERS.TYPE,
      required: true,
      options: officeTypeOptions,
      isSearchable: false,
      colSpan: 4,
    },
    {
      name: 'workStartTime',
      type: 'time',
      label: OFFICE_LABELS.CREATE.FIELDS.WORK_START_TIME,
      placeholder: PLACEHOLDERS.WORK_START_TIME,
      required: false,
      colSpan: 3,
    },
    {
      name: 'workEndTime',
      type: 'time',
      label: OFFICE_LABELS.CREATE.FIELDS.WORK_END_TIME,
      placeholder: PLACEHOLDERS.WORK_END_TIME,
      required: false,
      colSpan: 3,
    },
    {
      type: 'custom',
      colSpan: 6,
      content: <WorkDaysField />,
    },
    {
      name: 'phone',
      type: 'text',
      label: OFFICE_LABELS.CREATE.FIELDS.PHONE,
      placeholder: PLACEHOLDERS.PHONE,
      required: false,
      colSpan: 3,
      mask: maskPhone,
      prefix: '+62',
    },
    {
      name: 'companyId',
      type: 'select',
      label: OFFICE_LABELS.CREATE.FIELDS.COMPANY,
      placeholder: PLACEHOLDERS.COMPANY,
      required: true,
      options: companyOptions,
      isSearchable: true,
      isClearable: true,
      isLoading: isCompaniesLoading,
      colSpan: 3,
      onScrollToBottom: onCompanyScrollToBottom,
      onSearchChange: onCompanySearchChange,
    },
    {
      name: 'isActive',
      type: 'select',
      label: OFFICE_LABELS.CREATE.FIELDS.STATUS,
      placeholder: PLACEHOLDERS.STATUS,
      required: true,
      options: STATUS_OPTIONS,
      isSearchable: false,
      colSpan: 3,
    },
    {
      type: 'custom',
      content: (
        <div className="space-y-4">
          <Separator className="flex-1 h-[0.05rem]" />
          <p className="text-sm font-medium text-slate-500">
            {OFFICE_LABELS.CREATE.FIELDS.ADDRESS_SECTION}
          </p>
        </div>
      ),
      colSpan: 12,
    },
    {
      name: 'latitude',
      type: 'text',
      label: OFFICE_LABELS.CREATE.FIELDS.LATITUDE,
      placeholder: PLACEHOLDERS.LATITUDE,
      required: true,
      colSpan: 3,
    },
    {
      name: 'longitude',
      type: 'text',
      label: OFFICE_LABELS.CREATE.FIELDS.LONGITUDE,
      placeholder: PLACEHOLDERS.LONGITUDE,
      required: true,
      colSpan: 3,
    },
    {
      name: 'attendanceRadiusMeters',
      type: 'text',
      label: OFFICE_LABELS.CREATE.FIELDS.ATTENDANCE_RADIUS,
      placeholder: PLACEHOLDERS.ATTENDANCE_RADIUS,
      required: true,
      colSpan: 6,
    },
    {
      name: 'provinceId',
      type: 'select',
      label: OFFICE_LABELS.CREATE.FIELDS.PROVINCE,
      placeholder: PLACEHOLDERS.PROVINCE,
      required: true,
      options: provinceOptions,
      isSearchable: true,
      isClearable: true,
      colSpan: 3,
      hint: provinceTimezoneHint,
    },
    {
      name: 'cityId',
      type: 'select',
      label: OFFICE_LABELS.CREATE.FIELDS.CITY,
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
      label: OFFICE_LABELS.CREATE.FIELDS.DISTRICT,
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
      label: OFFICE_LABELS.CREATE.FIELDS.VILLAGE,
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
      label: OFFICE_LABELS.CREATE.FIELDS.ADDRESS_DETAIL,
      placeholder: PLACEHOLDERS.ADDRESS_DETAIL,
      required: false,
      colSpan: 12,
    },
  ];
}

// --- Form actions ---
type FormMode = 'create' | 'edit';

function OfficeFormActions({
  mode = 'create',
  isSubmitting,
  onCancel,
}: {
  mode: FormMode;
  isSubmitting?: boolean;
  onCancel?: () => void;
}) {
  const { formState } = useFormContext<OfficeFormInput>();
  const labels = mode === 'edit' ? OFFICE_LABELS.EDIT : OFFICE_LABELS.CREATE;

  return (
    <div className="flex gap-2 justify-end">
      <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
        {labels.BUTTONS.CANCEL}
      </Button>
      <Button type="submit" form="office-form" disabled={!formState.isValid || isSubmitting}>
        {isSubmitting ? labels.BUTTONS.SAVING : labels.BUTTONS.SAVE}
      </Button>
    </div>
  );
}

// --- Geography observer ---
function GeographyObserver({
  onProvinceChange,
  onCityChange,
  onDistrictChange,
}: {
  onProvinceChange: (id: string) => void;
  onCityChange: (id: string) => void;
  onDistrictChange: (id: string) => void;
}) {
  const { control, setValue } = useFormContext<OfficeFormInput>();
  const provinceId = useWatch({ control, name: 'provinceId' });
  const cityId = useWatch({ control, name: 'cityId' });
  const districtId = useWatch({ control, name: 'districtId' });

  const prevProvinceRef = useRef(provinceId);
  const prevCityRef = useRef(cityId);
  const prevDistrictRef = useRef(districtId);

  useEffect(() => {
    if (prevProvinceRef.current === provinceId) return;
    prevProvinceRef.current = provinceId;
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

// --- WorkDays field ---
function WorkDaysField() {
  const { control, setValue } = useFormContext<OfficeFormInput>();
  const workDays = useWatch({ control, name: 'workDays' });

  return (
    <WorkDaysSelector
      value={workDays || []}
      onChange={(value) => setValue('workDays', value)}
      label={OFFICE_LABELS.CREATE.FIELDS.WORK_DAYS}
    />
  );
}

// --- Component ---
interface OfficeFormProps {
  mode?: FormMode;
  office?: Office | null;
  onSubmit?: (payload: CreateOfficePayload | UpdateOfficePayload) => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
  serverErrors?: Record<string, string[]>;
}

export function OfficeForm({
  mode = 'create',
  office,
  onSubmit,
  onCancel,
  isSubmitting,
  serverErrors,
}: OfficeFormProps) {
  const isEdit = mode === 'edit';

  const [selectedProvinceId, setSelectedProvinceId] = useState<string>(office?.province?.id ?? '');
  const [selectedCityId, setSelectedCityId] = useState<string>(office?.city?.id ?? '');
  const [selectedDistrictId, setSelectedDistrictId] = useState<string>(office?.district?.id ?? '');

  useEffect(() => {
    if (office) {
      setSelectedProvinceId(office.province?.id ?? '');
      setSelectedCityId(office.city?.id ?? '');
      setSelectedDistrictId(office.district?.id ?? '');
    }
  }, [office]);

  const [companySearch, setCompanySearch] = useState('');
  const debouncedCompanySearch = useDebounce(companySearch, 300);

  const {
    options: companyOptions,
    isLoading: isCompaniesLoading,
    hasMore: hasMoreCompanies,
    isFetchingNextPage: isFetchingMoreCompanies,
    loadMore: loadMoreCompanies,
  } = useCompaniesInfinite({ search: debouncedCompanySearch, isActive: true });

  const handleCompanySearchChange = useCallback((value: string) => {
    setCompanySearch(value);
  }, []);

  const handleCompanyScrollToBottom = useCallback(() => {
    if (hasMoreCompanies && !isFetchingMoreCompanies) loadMoreCompanies();
  }, [hasMoreCompanies, isFetchingMoreCompanies, loadMoreCompanies]);

  const { data: provinceData } = useProvinces();
  const provinceTimezone = useProvinceTimezone(selectedProvinceId);
  const provinceTimezoneHint = useMemo(() => {
    const label = formatTimezone(provinceTimezone);
    return label ? `${OFFICE_LABELS.CREATE.FIELDS.TIMEZONE}: ${label}` : undefined;
  }, [provinceTimezone]);
  const { data: cityData, isFetching: isCitiesLoading } = useCities(selectedProvinceId);
  const { data: districtData, isFetching: isDistrictsLoading } = useDistricts(selectedCityId);
  const { data: villageData, isFetching: isVillagesLoading } = useVillages(selectedDistrictId);

  const fields = useMemo(
    () =>
      buildFormFields({
        companyOptions,
        officeTypeOptions: OFFICE_TYPE_OPTIONS,
        provinceOptions: provinceData ?? [],
        cityOptions: cityData ?? [],
        districtOptions: districtData ?? [],
        villageOptions: villageData ?? [],
        isCompaniesLoading,
        isCitiesLoading,
        isDistrictsLoading,
        isVillagesLoading,
        onCompanyScrollToBottom: handleCompanyScrollToBottom,
        onCompanySearchChange: handleCompanySearchChange,
        provinceTimezoneHint,
      }),
    [
      companyOptions,
      provinceData,
      cityData,
      districtData,
      villageData,
      isCompaniesLoading,
      isCitiesLoading,
      isDistrictsLoading,
      isVillagesLoading,
      handleCompanyScrollToBottom,
      handleCompanySearchChange,
      provinceTimezoneHint,
    ]
  );

  const defaultValues = useMemo((): OfficeFormInput => {
    if (!office) {
      return {
        code: '',
        name: '',
        type: '',
        phone: '',
        companyId: '',
        isActive: 'true',
        workStartTime: '',
        workEndTime: '',
        workDays: [],
        latitude: '',
        longitude: '',
        provinceId: '',
        cityId: undefined,
        districtId: undefined,
        villageId: undefined,
        addressDetail: '',
        attendanceRadiusMeters: '',
      };
    }
    return {
      code: office.code ?? '',
      name: office.name ?? '',
      type: office.type ?? '',
      phone: stripPhonePrefix(office.phone),
      companyId: office.company?.id ?? '',
      isActive: office.isActive ? 'true' : 'false',
      workStartTime: office.workStartTime ?? undefined,
      workEndTime: office.workEndTime ?? undefined,
      workDays: office.workDays ?? [],
      latitude: office.latitude != null ? String(office.latitude) : '',
      longitude: office.longitude != null ? String(office.longitude) : '',
      provinceId: office.province?.id ?? '',
      cityId: office.city?.id ?? undefined,
      districtId: office.district?.id ?? undefined,
      villageId: office.village?.id ?? undefined,
      addressDetail: office.addressDetail ?? '',
      attendanceRadiusMeters:
        office.attendanceRadiusMeters != null ? String(office.attendanceRadiusMeters) : '',
    };
  }, [office]);

  const handleFormSubmit = (formData: OfficeFormInput) => {
    if (!onSubmit) return;

    const basePayload = {
      companyId: formData.companyId,
      code: formData.code,
      name: formData.name,
      type: formData.type as 'main_office' | 'branch_office',
      phone: formData.phone || undefined,
      latitude: formData.latitude ? Number(formData.latitude) : undefined,
      longitude: formData.longitude ? Number(formData.longitude) : undefined,
      isActive: formData.isActive === 'true',
      workStartTime: formData.workStartTime || undefined,
      workEndTime: formData.workEndTime || undefined,
      workDays: formData.workDays && formData.workDays.length > 0 ? formData.workDays : undefined,
      provinceId: formData.provinceId || undefined,
      cityId: formData.cityId || undefined,
      districtId: formData.districtId || undefined,
      villageId: formData.villageId || undefined,
      addressDetail: formData.addressDetail || undefined,
      attendanceRadiusMeters: formData.attendanceRadiusMeters
        ? Number(formData.attendanceRadiusMeters)
        : undefined,
      // null asks the backend to derive it from provinceId
      timezone: null,
    };

    if (isEdit) {
      const payload: UpdateOfficePayload = basePayload;
      onSubmit(payload);
    } else {
      const payload: CreateOfficePayload = basePayload;
      onSubmit(payload);
    }
  };

  return (
    <FormCard>
      <FormGenerator<OfficeFormInput>
        id="office-form"
        fields={fields}
        onSubmit={handleFormSubmit}
        schema={(isEdit ? editOfficeSchema : createOfficeSchema) as any}
        defaultValues={defaultValues}
        externalErrors={serverErrors}
        actions={
          <div className="flex gap-2 justify-end px-0 pb-0">
            <GeographyObserver
              onProvinceChange={setSelectedProvinceId}
              onCityChange={setSelectedCityId}
              onDistrictChange={setSelectedDistrictId}
            />
            <OfficeFormActions
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
