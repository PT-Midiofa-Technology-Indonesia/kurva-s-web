'use client';

import { useEffect, useMemo, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { Button } from '@/components/atoms';
import { FormCard } from '@/components/molecules';
import { FormGenerator } from '@/components/organisms/FormGenerator';
import type { FormFieldConfig } from '@/shared/components/organisms/FormGenerator';
import { useCities, useDistricts, useProvinces, useVillages } from '@/shared/hooks/use-geography';
import type { CreateVendorCatalogPayload } from '../api/create-vendor-catalog';
import type { UpdateVendorCatalogPayload } from '../api/update-vendor-catalog';
import { VENDOR_CATALOG_LABELS } from '../constants';
import { createVendorSchema } from '../schemas';
import type { VendorCatalog, VendorFormInput } from '../types';
import { buildVendorFormFields } from './VendorCatalogFormFields';
import { GeographyObserver } from './VendorCatalogFormGeography';

type FormMode = 'create' | 'edit';

function VendorFormActions({
  mode = 'create',
  isSubmitting,
  onCancel,
}: {
  mode: FormMode;
  isSubmitting?: boolean;
  onCancel?: () => void;
}) {
  const { formState } = useFormContext<VendorFormInput>();
  const labels = mode === 'edit' ? VENDOR_CATALOG_LABELS.EDIT : VENDOR_CATALOG_LABELS.CREATE;

  return (
    <div className="flex gap-2 justify-end">
      <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
        {labels.BUTTONS.CANCEL}
      </Button>
      <Button type="submit" form="vendor-form" disabled={!formState.isValid || isSubmitting}>
        {isSubmitting ? labels.BUTTONS.SAVING : labels.BUTTONS.SAVE}
      </Button>
    </div>
  );
}

interface VendorFormProps {
  mode?: FormMode;
  vendor?: VendorCatalog | null;
  onSubmit?: (payload: CreateVendorCatalogPayload | UpdateVendorCatalogPayload) => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
  serverErrors?: Record<string, string[]>;
}

export function VendorCatalogForm({
  mode = 'create',
  vendor,
  onSubmit,
  onCancel,
  isSubmitting,
  serverErrors,
}: VendorFormProps) {
  const isEdit = mode === 'edit';

  const [selectedProvinceId, setSelectedProvinceId] = useState<string>(vendor?.provinceId ?? '');
  const [selectedCityId, setSelectedCityId] = useState<string>(vendor?.cityId ?? '');
  const [selectedDistrictId, setSelectedDistrictId] = useState<string>(vendor?.districtId ?? '');

  useEffect(() => {
    if (vendor) {
      setSelectedProvinceId(vendor.provinceId ?? '');
      setSelectedCityId(vendor.cityId ?? '');
      setSelectedDistrictId(vendor.districtId ?? '');
    }
  }, [vendor]);

  const { data: provinceData } = useProvinces();
  const { data: cityData, isFetching: isCitiesLoading } = useCities(selectedProvinceId);
  const { data: districtData, isFetching: isDistrictsLoading } = useDistricts(selectedCityId);
  const { data: villageData, isFetching: isVillagesLoading } = useVillages(selectedDistrictId);

  const fields = useMemo<FormFieldConfig<VendorFormInput>[]>(
    () => [
      ...buildVendorFormFields({
        provinceOptions: provinceData ?? [],
        cityOptions: cityData ?? [],
        districtOptions: districtData ?? [],
        villageOptions: villageData ?? [],
        isCitiesLoading,
        isDistrictsLoading,
        isVillagesLoading,
      }),
      {
        type: 'custom',
        content: (
          <GeographyObserver
            onProvinceChange={setSelectedProvinceId}
            onCityChange={setSelectedCityId}
            onDistrictChange={setSelectedDistrictId}
          />
        ),
        colSpan: 12,
        className: 'hidden',
      },
    ],
    [
      provinceData,
      cityData,
      districtData,
      villageData,
      isCitiesLoading,
      isDistrictsLoading,
      isVillagesLoading,
    ]
  );

  const defaultValues = useMemo((): VendorFormInput => {
    if (!vendor) {
      return {
        code: '',
        name: '',
        isSubcontractor: false,
        isSupplier: false,
        isLogistic: false,
        npwp: '',
        siupNumber: '',
        phone: '',
        email: '',
        provinceId: null,
        cityId: null,
        districtId: null,
        villageId: null,
        postalCode: '',
        addressDetail: '',
        contactPersonName: '',
        contactPersonPhone: '',
        contactPersonEmail: '',
        bankName: '',
        bankAccountNumber: '',
        bankAccountHolder: '',
        notes: '',
        isActive: 'true',
      };
    }
    return {
      code: vendor.code ?? '',
      name: vendor.name ?? '',
      isSubcontractor: vendor.isSubcontractor ?? false,
      isSupplier: vendor.isSupplier ?? false,
      isLogistic: vendor.isLogistic ?? false,
      npwp: vendor.npwp ?? '',
      siupNumber: vendor.siupNumber ?? '',
      phone: vendor.phone ?? '',
      email: vendor.email ?? '',
      provinceId: vendor.provinceId ?? null,
      cityId: vendor.cityId ?? null,
      districtId: vendor.districtId ?? null,
      villageId: vendor.villageId ?? null,
      postalCode: vendor.postalCode ?? '',
      addressDetail: vendor.addressDetail ?? '',
      contactPersonName: vendor.contactPersonName ?? '',
      contactPersonPhone: vendor.contactPersonPhone ?? '',
      contactPersonEmail: vendor.contactPersonEmail ?? '',
      bankName: vendor.bankName ?? '',
      bankAccountNumber: vendor.bankAccountNumber ?? '',
      bankAccountHolder: vendor.bankAccountHolder ?? '',
      notes: vendor.notes ?? '',
      isActive: vendor.isActive ? 'true' : 'false',
    };
  }, [vendor]);

  const handleFormSubmit = (formData: VendorFormInput) => {
    if (!onSubmit) return;

    const payload = {
      code: formData.code,
      name: formData.name,
      isSubcontractor: formData.isSubcontractor,
      isSupplier: formData.isSupplier,
      isLogistic: formData.isLogistic,
      npwp: formData.npwp || undefined,
      siupNumber: formData.siupNumber || undefined,
      phone: formData.phone,
      email: formData.email || undefined,
      provinceId: formData.provinceId || undefined,
      cityId: formData.cityId || undefined,
      districtId: formData.districtId || undefined,
      villageId: formData.villageId || undefined,
      postalCode: formData.postalCode || undefined,
      addressDetail: formData.addressDetail || undefined,
      contactPersonName: formData.contactPersonName || undefined,
      contactPersonPhone: formData.contactPersonPhone || undefined,
      contactPersonEmail: formData.contactPersonEmail || undefined,
      bankName: formData.bankName || undefined,
      bankAccountNumber: formData.bankAccountNumber || undefined,
      bankAccountHolder: formData.bankAccountHolder || undefined,
      notes: formData.notes || undefined,
      isActive: formData.isActive === 'true',
    };

    onSubmit(payload);
  };

  return (
    <FormCard>
      <FormGenerator<VendorFormInput>
        id="vendor-form"
        fields={fields}
        onSubmit={handleFormSubmit}
        schema={createVendorSchema as any}
        defaultValues={defaultValues}
        externalErrors={serverErrors}
        actions={
          <div className="flex gap-2 justify-end px-0 pb-0">
            <VendorFormActions
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
