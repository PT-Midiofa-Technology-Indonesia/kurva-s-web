'use client';

import type { FormFieldConfig } from '@/shared/components/organisms/FormGenerator';
import { Separator } from '@/shared/components/ui';
import { COMMON_STATUS_OPTIONS } from '@/shared/constants';
import { noWhitespace } from '@/shared/utils/masks';
import { VENDOR_CATALOG_LABELS, VENDOR_CATALOG_PLACEHOLDERS } from '../constants';
import type { VendorFormInput } from '../types';

export interface FormFieldOptions {
  provinceOptions: any[];
  cityOptions: any[];
  districtOptions: any[];
  villageOptions: any[];
  isCitiesLoading: boolean;
  isDistrictsLoading: boolean;
  isVillagesLoading: boolean;
}

export function buildVendorFormFields(
  options: FormFieldOptions
): FormFieldConfig<VendorFormInput>[] {
  const {
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
      name: 'code',
      type: 'text',
      label: VENDOR_CATALOG_LABELS.CREATE.FIELDS.CODE,
      placeholder: VENDOR_CATALOG_PLACEHOLDERS.CODE,
      required: true,
      colSpan: 4,
      mask: noWhitespace,
    },
    {
      name: 'name',
      type: 'text',
      label: VENDOR_CATALOG_LABELS.CREATE.FIELDS.NAME,
      placeholder: VENDOR_CATALOG_PLACEHOLDERS.NAME,
      required: true,
      colSpan: 4,
    },
    {
      name: 'isActive',
      type: 'select',
      label: VENDOR_CATALOG_LABELS.CREATE.FIELDS.STATUS,
      options: COMMON_STATUS_OPTIONS,
      placeholder: VENDOR_CATALOG_LABELS.CREATE.FIELDS.STATUS_PLACEHOLDER,
      colSpan: 4,
      isSearchable: false,
      isClearable: false,
      required: true,
    },
    {
      name: 'isSubcontractor',
      type: 'checkbox-group',
      label: VENDOR_CATALOG_LABELS.CREATE.FIELDS.TYPE,
      required: true,
      items: [
        {
          label: VENDOR_CATALOG_LABELS.CREATE.FIELDS.VENDOR_SUBCONTRACTOR,
          name: 'isSubcontractor',
        },
        { label: VENDOR_CATALOG_LABELS.CREATE.FIELDS.VENDOR_SUPPLIER, name: 'isSupplier' },
        { label: VENDOR_CATALOG_LABELS.CREATE.FIELDS.VENDOR_LOGISTIC, name: 'isLogistic' },
      ],
      colSpan: 12,
    },
    {
      type: 'custom',
      content: (
        <div className="space-y-4">
          <Separator className="flex-1 h-[0.05rem]" />
          <p className="text-sm font-medium text-slate-500">
            {VENDOR_CATALOG_LABELS.CREATE.FIELDS.ADDRESS_SECTION}
          </p>
        </div>
      ),
      colSpan: 12,
    },
    {
      name: 'provinceId',
      type: 'select',
      label: VENDOR_CATALOG_LABELS.CREATE.FIELDS.PROVINCE,
      placeholder: VENDOR_CATALOG_PLACEHOLDERS.PROVINCE,
      options: provinceOptions,
      isSearchable: true,
      isClearable: true,
      colSpan: 3,
    },
    {
      name: 'cityId',
      type: 'select',
      label: VENDOR_CATALOG_LABELS.CREATE.FIELDS.CITY,
      placeholder: VENDOR_CATALOG_PLACEHOLDERS.CITY,
      options: cityOptions,
      isSearchable: true,
      isClearable: true,
      isLoading: isCitiesLoading,
      colSpan: 3,
      enableRules: [{ conditions: [{ field: 'provinceId', evaluator: (val) => !!val }] }],
    },
    {
      name: 'districtId',
      type: 'select',
      label: VENDOR_CATALOG_LABELS.CREATE.FIELDS.DISTRICT,
      placeholder: VENDOR_CATALOG_PLACEHOLDERS.DISTRICT,
      options: districtOptions,
      isSearchable: true,
      isClearable: true,
      isLoading: isDistrictsLoading,
      colSpan: 3,
      enableRules: [{ conditions: [{ field: 'cityId', evaluator: (val) => !!val }] }],
    },
    {
      name: 'villageId',
      type: 'select',
      label: VENDOR_CATALOG_LABELS.CREATE.FIELDS.VILLAGE,
      placeholder: VENDOR_CATALOG_PLACEHOLDERS.VILLAGE,
      options: villageOptions,
      isSearchable: true,
      isClearable: true,
      isLoading: isVillagesLoading,
      colSpan: 3,
      enableRules: [{ conditions: [{ field: 'districtId', evaluator: (val) => !!val }] }],
    },
    {
      name: 'addressDetail',
      type: 'textarea',
      label: VENDOR_CATALOG_LABELS.CREATE.FIELDS.ADDRESS,
      placeholder: VENDOR_CATALOG_PLACEHOLDERS.ADDRESS,
      colSpan: 12,
    },
  ];
}
