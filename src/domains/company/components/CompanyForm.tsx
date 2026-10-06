'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { Button, type SelectOption } from '@/components/atoms';
import { FormCard } from '@/components/molecules';
import { FormGenerator } from '@/components/organisms/FormGenerator';
import { useProjectCapabilitiesInfinite } from '@/domains/project-capability';
import type { FormFieldConfig } from '@/shared/components/organisms/FormGenerator';
import { Separator } from '@/shared/components/ui';
import { useDebounce } from '@/shared/hooks/use-debounce';
import { useCities, useDistricts, useProvinces, useVillages } from '@/shared/hooks/use-geography';
import { maskNpwp, maskPhone, noWhitespace, stripPhonePrefix } from '@/shared/utils/masks';
import type { CreateCompanyPayload } from '../api/create-company';
import type { UpdateCompanyPayload } from '../api/update-company';
import { COMPANY_LABELS, PLACEHOLDERS, STATUS_OPTIONS } from '../constants';
import { type CompanyFormInput, createCompanySchema, editCompanySchema } from '../schemas';
import type { Company } from '../types';

// --- Form field builder ---
interface FormFieldOptions {
  projectCapabilityOptions: SelectOption[];
  provinceOptions: SelectOption[];
  cityOptions: SelectOption[];
  districtOptions: SelectOption[];
  villageOptions: SelectOption[];
  isCapabilitiesLoading: boolean;
  isCitiesLoading: boolean;
  isDistrictsLoading: boolean;
  isVillagesLoading: boolean;
  onCapabilityScrollToBottom: () => void;
  onCapabilitySearchChange: (value: string) => void;
}

function buildFormFields(options: FormFieldOptions): FormFieldConfig<CompanyFormInput>[] {
  const {
    projectCapabilityOptions,
    provinceOptions,
    cityOptions,
    districtOptions,
    villageOptions,
    isCapabilitiesLoading,
    isCitiesLoading,
    isDistrictsLoading,
    isVillagesLoading,
    onCapabilityScrollToBottom,
    onCapabilitySearchChange,
  } = options;

  return [
    {
      name: 'code',
      type: 'text',
      label: COMPANY_LABELS.CREATE.FIELDS.CODE,
      placeholder: PLACEHOLDERS.CODE,
      required: true,
      colSpan: 6,
      mask: noWhitespace,
    },
    {
      name: 'name',
      type: 'text',
      label: COMPANY_LABELS.CREATE.FIELDS.NAME,
      placeholder: PLACEHOLDERS.NAME,
      required: true,
      colSpan: 6,
    },
    {
      name: 'npwp',
      type: 'text',
      label: COMPANY_LABELS.CREATE.FIELDS.NPWP,
      placeholder: PLACEHOLDERS.NPWP,
      required: false,
      colSpan: 6,
      mask: maskNpwp,
    },
    {
      name: 'siupNumber',
      type: 'text',
      label: COMPANY_LABELS.CREATE.FIELDS.SIUP_NUMBER,
      placeholder: PLACEHOLDERS.SIUP_NUMBER,
      required: false,
      colSpan: 6,
    },
    {
      name: 'projectCapabilityIds',
      type: 'select',
      label: COMPANY_LABELS.CREATE.FIELDS.PROJECT_CAPABILITIES,
      placeholder: PLACEHOLDERS.PROJECT_CAPABILITIES,
      required: true,
      options: projectCapabilityOptions,
      isMulti: true,
      isSearchable: true,
      isLoading: isCapabilitiesLoading,
      colSpan: 12,
      onScrollToBottom: onCapabilityScrollToBottom,
      onSearchChange: onCapabilitySearchChange,
    },
    {
      name: 'phone',
      type: 'text',
      label: COMPANY_LABELS.CREATE.FIELDS.PHONE,
      placeholder: PLACEHOLDERS.PHONE,
      required: false,
      colSpan: 4,
      mask: maskPhone,
      prefix: '+62',
    },
    {
      name: 'email',
      type: 'text',
      label: COMPANY_LABELS.CREATE.FIELDS.EMAIL,
      placeholder: PLACEHOLDERS.EMAIL,
      required: false,
      colSpan: 4,
      validateOnBlur: true,
      mask: noWhitespace,
    },
    {
      name: 'isActive',
      type: 'select',
      label: COMPANY_LABELS.CREATE.FIELDS.STATUS,
      placeholder: PLACEHOLDERS.STATUS,
      required: true,
      options: STATUS_OPTIONS,
      isSearchable: false,
      colSpan: 4,
    },
    {
      type: 'custom',
      content: (
        <div className="space-y-4">
          <Separator className="flex-1 h-[0.05rem]" />
          <p className="text-sm font-medium text-slate-500">
            {COMPANY_LABELS.CREATE.FIELDS.ADDRESS_SECTION}
          </p>
        </div>
      ),
      colSpan: 12,
    },
    {
      name: 'provinceId',
      type: 'select',
      label: COMPANY_LABELS.CREATE.FIELDS.PROVINCE,
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
      label: COMPANY_LABELS.CREATE.FIELDS.CITY,
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
      label: COMPANY_LABELS.CREATE.FIELDS.DISTRICT,
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
      label: COMPANY_LABELS.CREATE.FIELDS.VILLAGE,
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
      label: COMPANY_LABELS.CREATE.FIELDS.ADDRESS_DETAIL,
      placeholder: PLACEHOLDERS.ADDRESS_DETAIL,
      required: false,
      colSpan: 12,
    },
  ];
}

// --- Form actions ---
type FormMode = 'create' | 'edit';

function CompanyFormActions({
  mode = 'create',
  isSubmitting,
  onCancel,
}: {
  mode: FormMode;
  isSubmitting?: boolean;
  onCancel?: () => void;
}) {
  const { formState } = useFormContext<CompanyFormInput>();
  const labels = mode === 'edit' ? COMPANY_LABELS.EDIT : COMPANY_LABELS.CREATE;

  return (
    <div className="flex gap-2 justify-end">
      <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
        {labels.BUTTONS.CANCEL}
      </Button>
      <Button type="submit" form="company-form" disabled={!formState.isValid || isSubmitting}>
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
  const { control, setValue } = useFormContext<CompanyFormInput>();
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

// --- Component ---
interface CompanyFormProps {
  mode?: FormMode;
  company?: Company | null;
  onSubmit?: (payload: CreateCompanyPayload | UpdateCompanyPayload) => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
  serverErrors?: Record<string, string[]>;
}

export function CompanyForm({
  mode = 'create',
  company,
  onSubmit,
  onCancel,
  isSubmitting,
  serverErrors,
}: CompanyFormProps) {
  const isEdit = mode === 'edit';

  // Geography selections
  const [selectedProvinceId, setSelectedProvinceId] = useState<string>(company?.province?.id ?? '');
  const [selectedCityId, setSelectedCityId] = useState<string>(company?.city?.id ?? '');
  const [selectedDistrictId, setSelectedDistrictId] = useState<string>(company?.district?.id ?? '');

  // Sync geography state when company data changes
  useEffect(() => {
    if (company) {
      setSelectedProvinceId(company.province?.id ?? '');
      setSelectedCityId(company.city?.id ?? '');
      setSelectedDistrictId(company.district?.id ?? '');
    }
  }, [company]);

  // Data fetching
  const [capabilitySearch, setCapabilitySearch] = useState('');
  const debouncedCapabilitySearch = useDebounce(capabilitySearch, 300);

  const {
    options: projectCapabilityOptions,
    isLoading: isCapabilitiesLoading,
    hasMore: hasMoreCapabilities,
    isFetchingNextPage: isFetchingMoreCapabilities,
    loadMore: loadMoreCapabilities,
  } = useProjectCapabilitiesInfinite({ search: debouncedCapabilitySearch, isActive: true });

  const handleCapabilitySearchChange = useCallback((v: string) => setCapabilitySearch(v), []);
  const handleCapabilityScrollToBottom = useCallback(() => {
    if (hasMoreCapabilities && !isFetchingMoreCapabilities) loadMoreCapabilities();
  }, [hasMoreCapabilities, isFetchingMoreCapabilities, loadMoreCapabilities]);

  const { data: provinceData } = useProvinces();
  const { data: cityData, isFetching: isCitiesLoading } = useCities(selectedProvinceId);
  const { data: districtData, isFetching: isDistrictsLoading } = useDistricts(selectedCityId);
  const { data: villageData, isFetching: isVillagesLoading } = useVillages(selectedDistrictId);

  const fields = useMemo(
    () =>
      buildFormFields({
        projectCapabilityOptions,
        provinceOptions: provinceData ?? [],
        cityOptions: cityData ?? [],
        districtOptions: districtData ?? [],
        villageOptions: villageData ?? [],
        isCapabilitiesLoading,
        isCitiesLoading,
        isDistrictsLoading,
        isVillagesLoading,
        onCapabilityScrollToBottom: handleCapabilityScrollToBottom,
        onCapabilitySearchChange: handleCapabilitySearchChange,
      }),
    [
      projectCapabilityOptions,
      provinceData,
      cityData,
      districtData,
      villageData,
      isCapabilitiesLoading,
      isCitiesLoading,
      isDistrictsLoading,
      isVillagesLoading,
      handleCapabilityScrollToBottom,
      handleCapabilitySearchChange,
    ]
  );

  const defaultValues = useMemo((): CompanyFormInput => {
    if (!company) {
      return {
        code: '',
        name: '',
        npwp: '',
        siupNumber: '',
        projectCapabilityIds: [],
        phone: '',
        email: '',
        isActive: 'true',
        provinceId: undefined,
        cityId: undefined,
        districtId: undefined,
        villageId: undefined,
        addressDetail: '',
      };
    }
    return {
      code: company.code ?? '',
      name: company.name ?? '',
      npwp: company.npwp ?? '',
      siupNumber: company.siupNumber ?? '',
      projectCapabilityIds: company.projectCapabilities?.map((c) => c.id) ?? [],
      phone: stripPhonePrefix(company.phone),
      email: company.email ?? '',
      isActive: company.isActive ? 'true' : 'false',
      provinceId: company.province?.id ?? undefined,
      cityId: company.city?.id ?? undefined,
      districtId: company.district?.id ?? undefined,
      villageId: company.village?.id ?? undefined,
      addressDetail: company.addressDetail ?? '',
    };
  }, [company]);

  const handleFormSubmit = (formData: CompanyFormInput) => {
    if (!onSubmit) return;

    const basePayload = {
      code: formData.code,
      name: formData.name,
      npwp: formData.npwp || undefined,
      siupNumber: formData.siupNumber || undefined,
      projectCapabilityIds: formData.projectCapabilityIds?.length
        ? formData.projectCapabilityIds
        : undefined,
      phone: formData.phone || undefined,
      email: formData.email || undefined,
      isActive: formData.isActive === 'true',
      provinceId: formData.provinceId || undefined,
      cityId: formData.cityId || undefined,
      districtId: formData.districtId || undefined,
      villageId: formData.villageId || undefined,
      addressDetail: formData.addressDetail || undefined,
    };

    if (isEdit) {
      const payload: UpdateCompanyPayload = basePayload;
      onSubmit(payload);
    } else {
      const payload: CreateCompanyPayload = basePayload;
      onSubmit(payload);
    }
  };

  return (
    <FormCard>
      <FormGenerator<CompanyFormInput>
        id="company-form"
        fields={fields}
        onSubmit={handleFormSubmit}
        schema={(isEdit ? editCompanySchema : createCompanySchema) as any}
        defaultValues={defaultValues}
        externalErrors={serverErrors}
        actions={
          <div className="flex gap-2 justify-end px-0 pb-0">
            <GeographyObserver
              onProvinceChange={setSelectedProvinceId}
              onCityChange={setSelectedCityId}
              onDistrictChange={setSelectedDistrictId}
            />
            <CompanyFormActions
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
