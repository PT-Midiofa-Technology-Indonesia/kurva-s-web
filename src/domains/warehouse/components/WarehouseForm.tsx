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
import { useWarehouseTypes } from '@/shared/hooks/use-enums';
import {
  useCities,
  useDistricts,
  useProvinces,
  useProvinceTimezone,
  useVillages,
} from '@/shared/hooks/use-geography';
import { noWhitespace } from '@/shared/utils/masks';
import { formatTimezone } from '@/shared/utils/timezone';
import type { CreateWarehousePayload } from '../api/create-warehouse';
import type { UpdateWarehousePayload } from '../api/update-warehouse';
import { PLACEHOLDERS, STATUS_OPTIONS, WAREHOUSE_LABELS } from '../constants';
import { createWarehouseSchema, editWarehouseSchema, type WarehouseFormInput } from '../schemas';
import type { Warehouse } from '../types';

// --- Form field builder ---
interface FormFieldOptions {
  companyOptions: SelectOption[];
  typeOptions: SelectOption[];
  provinceOptions: SelectOption[];
  cityOptions: SelectOption[];
  districtOptions: SelectOption[];
  villageOptions: SelectOption[];
  isCompaniesLoading: boolean;
  isTypesLoading: boolean;
  isCitiesLoading: boolean;
  isDistrictsLoading: boolean;
  isVillagesLoading: boolean;
  onCompanyScrollToBottom: () => void;
  onCompanySearchChange: (value: string) => void;
  provinceTimezoneHint?: string;
}

function buildFormFields(options: FormFieldOptions): FormFieldConfig<WarehouseFormInput>[] {
  const {
    companyOptions,
    typeOptions,
    provinceOptions,
    cityOptions,
    districtOptions,
    villageOptions,
    isCompaniesLoading,
    isTypesLoading,
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
      label: WAREHOUSE_LABELS.CREATE.FIELDS.CODE,
      placeholder: PLACEHOLDERS.CODE,
      required: true,
      colSpan: 4,
      mask: noWhitespace,
    },
    {
      name: 'name',
      type: 'text',
      label: WAREHOUSE_LABELS.CREATE.FIELDS.NAME,
      placeholder: PLACEHOLDERS.NAME,
      required: true,
      colSpan: 4,
    },
    {
      name: 'type',
      type: 'select',
      label: WAREHOUSE_LABELS.CREATE.FIELDS.TYPE,
      placeholder: PLACEHOLDERS.TYPE,
      required: true,
      options: typeOptions,
      isSearchable: true,
      isClearable: true,
      isLoading: isTypesLoading,
      colSpan: 4,
    },
    {
      name: 'companyId',
      type: 'select',
      label: WAREHOUSE_LABELS.CREATE.FIELDS.COMPANY,
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
      name: 'workStartTime',
      type: 'time',
      label: WAREHOUSE_LABELS.CREATE.FIELDS.WORK_START_TIME,
      placeholder: PLACEHOLDERS.WORK_START_TIME,
      required: false,
      colSpan: 3,
    },
    {
      name: 'workEndTime',
      type: 'time',
      label: WAREHOUSE_LABELS.CREATE.FIELDS.WORK_END_TIME,
      placeholder: PLACEHOLDERS.WORK_END_TIME,
      required: false,
      colSpan: 3,
    },
    {
      name: 'isActive',
      type: 'select',
      label: WAREHOUSE_LABELS.CREATE.FIELDS.STATUS,
      required: true,
      options: STATUS_OPTIONS,
      placeholder: PLACEHOLDERS.STATUS,
      colSpan: 3,
      isSearchable: false,
    },
    {
      type: 'custom',
      colSpan: 6,
      content: <WorkDaysField />,
    },
    {
      type: 'custom',
      content: (
        <div className="space-y-4">
          <Separator className="flex-1 h-[0.05rem]" />
          <p className="text-sm font-medium text-slate-500">
            {WAREHOUSE_LABELS.CREATE.FIELDS.ADDRESS_SECTION}
          </p>
        </div>
      ),
      colSpan: 12,
    },
    {
      name: 'latitude',
      type: 'text',
      label: WAREHOUSE_LABELS.CREATE.FIELDS.LATITUDE,
      placeholder: PLACEHOLDERS.LATITUDE,
      required: true,
      colSpan: 3,
    },
    {
      name: 'longitude',
      type: 'text',
      label: WAREHOUSE_LABELS.CREATE.FIELDS.LONGITUDE,
      placeholder: PLACEHOLDERS.LONGITUDE,
      required: true,
      colSpan: 3,
    },
    {
      name: 'attendanceRadiusMeters',
      type: 'text',
      label: WAREHOUSE_LABELS.CREATE.FIELDS.ATTENDANCE_RADIUS,
      placeholder: PLACEHOLDERS.ATTENDANCE_RADIUS,
      required: true,
      colSpan: 6,
    },
    {
      name: 'provinceId',
      type: 'select',
      label: WAREHOUSE_LABELS.CREATE.FIELDS.PROVINCE,
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
      label: WAREHOUSE_LABELS.CREATE.FIELDS.CITY,
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
      label: WAREHOUSE_LABELS.CREATE.FIELDS.DISTRICT,
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
      label: WAREHOUSE_LABELS.CREATE.FIELDS.VILLAGE,
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
      label: WAREHOUSE_LABELS.CREATE.FIELDS.ADDRESS_DETAIL,
      placeholder: PLACEHOLDERS.ADDRESS_DETAIL,
      required: false,
      colSpan: 12,
    },
  ];
}

// --- Form actions ---
type FormMode = 'create' | 'edit';

function WarehouseFormActions({
  mode = 'create',
  isSubmitting,
  onCancel,
}: {
  mode: FormMode;
  isSubmitting?: boolean;
  onCancel?: () => void;
}) {
  const { formState } = useFormContext<WarehouseFormInput>();
  const labels = mode === 'edit' ? WAREHOUSE_LABELS.EDIT : WAREHOUSE_LABELS.CREATE;

  return (
    <div className="flex gap-2 justify-end">
      <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
        {labels.BUTTONS.CANCEL}
      </Button>
      <Button type="submit" form="warehouse-form" disabled={!formState.isValid || isSubmitting}>
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
  const { control, setValue } = useFormContext<WarehouseFormInput>();
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
  const { control, setValue } = useFormContext<WarehouseFormInput>();
  const workDays = useWatch({ control, name: 'workDays' });

  return (
    <WorkDaysSelector
      value={workDays || []}
      onChange={(value) => setValue('workDays', value)}
      label={WAREHOUSE_LABELS.CREATE.FIELDS.WORK_DAYS}
    />
  );
}

// --- Component ---
interface WarehouseFormProps {
  mode?: FormMode;
  warehouse?: Warehouse | null;
  onSubmit?: (payload: CreateWarehousePayload | UpdateWarehousePayload) => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
  serverErrors?: Record<string, string[]>;
}

export function WarehouseForm({
  mode = 'create',
  warehouse,
  onSubmit,
  onCancel,
  isSubmitting,
  serverErrors,
}: WarehouseFormProps) {
  const isEdit = mode === 'edit';

  // Geography selections
  const [selectedProvinceId, setSelectedProvinceId] = useState<string>(
    warehouse?.province?.id ?? ''
  );
  const [selectedCityId, setSelectedCityId] = useState<string>(warehouse?.city?.id ?? '');
  const [selectedDistrictId, setSelectedDistrictId] = useState<string>(
    warehouse?.district?.id ?? ''
  );

  // Sync geography state when warehouse data changes
  useEffect(() => {
    if (warehouse) {
      setSelectedProvinceId(warehouse.province?.id ?? '');
      setSelectedCityId(warehouse.city?.id ?? '');
      setSelectedDistrictId(warehouse.district?.id ?? '');
    }
  }, [warehouse]);

  // Data fetching
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

  const { data: warehouseTypesData, isFetching: isTypesLoading } = useWarehouseTypes();
  const { data: provinceData } = useProvinces();
  const provinceTimezone = useProvinceTimezone(selectedProvinceId);
  const provinceTimezoneHint = useMemo(() => {
    const label = formatTimezone(provinceTimezone);
    return label ? `${WAREHOUSE_LABELS.CREATE.FIELDS.TIMEZONE}: ${label}` : undefined;
  }, [provinceTimezone]);
  const { data: cityData, isFetching: isCitiesLoading } = useCities(selectedProvinceId);
  const { data: districtData, isFetching: isDistrictsLoading } = useDistricts(selectedCityId);
  const { data: villageData, isFetching: isVillagesLoading } = useVillages(selectedDistrictId);

  const typeOptions = useMemo<SelectOption[]>(
    () => warehouseTypesData?.map((t) => ({ label: t.label, value: t.value })) ?? [],
    [warehouseTypesData]
  );

  const fields = useMemo(
    () =>
      buildFormFields({
        companyOptions,
        typeOptions,
        provinceOptions: provinceData ?? [],
        cityOptions: cityData ?? [],
        districtOptions: districtData ?? [],
        villageOptions: villageData ?? [],
        isCompaniesLoading,
        isTypesLoading,
        isCitiesLoading,
        isDistrictsLoading,
        isVillagesLoading,
        onCompanyScrollToBottom: handleCompanyScrollToBottom,
        onCompanySearchChange: handleCompanySearchChange,
        provinceTimezoneHint,
      }),
    [
      companyOptions,
      typeOptions,
      provinceData,
      cityData,
      districtData,
      villageData,
      isCompaniesLoading,
      isTypesLoading,
      isCitiesLoading,
      isDistrictsLoading,
      isVillagesLoading,
      handleCompanyScrollToBottom,
      handleCompanySearchChange,
      provinceTimezoneHint,
    ]
  );

  const defaultValues = useMemo((): WarehouseFormInput => {
    if (!warehouse) {
      return {
        code: '',
        name: '',
        type: '',
        companyId: '',
        isActive: 'true',
        workStartTime: '',
        workEndTime: '',
        workDays: [],
        provinceId: '',
        cityId: undefined,
        districtId: undefined,
        villageId: undefined,
        addressDetail: '',
        latitude: '',
        longitude: '',
        attendanceRadiusMeters: '',
      };
    }
    return {
      code: warehouse.code ?? '',
      name: warehouse.name ?? '',
      type: warehouse.type ?? '',
      companyId: warehouse.company?.id ?? '',
      isActive: warehouse.isActive ? 'true' : 'false',
      workStartTime: warehouse.workStartTime ?? undefined,
      workEndTime: warehouse.workEndTime ?? undefined,
      workDays: warehouse.workDays ?? [],
      provinceId: warehouse.province?.id ?? '',
      cityId: warehouse.city?.id ?? undefined,
      districtId: warehouse.district?.id ?? undefined,
      villageId: warehouse.village?.id ?? undefined,
      addressDetail: warehouse.addressDetail ?? '',
      latitude: warehouse.latitude ?? '',
      longitude: warehouse.longitude ?? '',
      attendanceRadiusMeters:
        warehouse.attendanceRadiusMeters != null ? String(warehouse.attendanceRadiusMeters) : '',
    };
  }, [warehouse]);

  const handleFormSubmit = (formData: WarehouseFormInput) => {
    if (!onSubmit) return;

    const basePayload = {
      companyId: formData.companyId,
      code: formData.code,
      name: formData.name,
      type: formData.type,
      isActive: formData.isActive === 'true',
      workStartTime: formData.workStartTime || undefined,
      workEndTime: formData.workEndTime || undefined,
      workDays: formData.workDays && formData.workDays.length > 0 ? formData.workDays : undefined,
      provinceId: formData.provinceId || undefined,
      cityId: formData.cityId || undefined,
      districtId: formData.districtId || undefined,
      villageId: formData.villageId || undefined,
      addressDetail: formData.addressDetail || undefined,
      latitude: formData.latitude || undefined,
      longitude: formData.longitude || undefined,
      attendanceRadiusMeters: formData.attendanceRadiusMeters
        ? Number(formData.attendanceRadiusMeters)
        : undefined,
      // null asks the backend to derive it from provinceId
      timezone: null,
    };

    if (isEdit) {
      const payload: UpdateWarehousePayload = basePayload;
      onSubmit(payload);
    } else {
      const payload: CreateWarehousePayload = basePayload;
      onSubmit(payload);
    }
  };

  return (
    <FormCard>
      <FormGenerator<WarehouseFormInput>
        id="warehouse-form"
        fields={fields}
        onSubmit={handleFormSubmit}
        schema={(isEdit ? editWarehouseSchema : createWarehouseSchema) as any}
        defaultValues={defaultValues}
        externalErrors={serverErrors}
        actions={
          <div className="flex gap-2 justify-end px-0 pb-0">
            <GeographyObserver
              onProvinceChange={setSelectedProvinceId}
              onCityChange={setSelectedCityId}
              onDistrictChange={setSelectedDistrictId}
            />
            <WarehouseFormActions
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
