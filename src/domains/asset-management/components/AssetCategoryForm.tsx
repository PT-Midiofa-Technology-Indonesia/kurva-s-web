'use client';

import { useMemo } from 'react';
import { useFormContext } from 'react-hook-form';
import { Button } from '@/components/atoms';
import { FormCard } from '@/components/molecules';
import { FormGenerator } from '@/components/organisms/FormGenerator';
import type { FormFieldConfig } from '@/shared/components/organisms/FormGenerator';
import { COMMON_STATUS_OPTIONS } from '@/shared/constants';
import { useDepreciationMethods } from '@/shared/hooks/use-enums';
import { noWhitespace } from '@/shared/utils/masks';
import type { CreateAssetCategoryPayload } from '../api/create-asset-category';
import type { UpdateAssetCategoryPayload } from '../api/update-asset-category';
import { ASSET_CATEGORY_LABELS } from '../constants';
import { createAssetCategorySchema, updateAssetCategorySchema } from '../schemas';
import type { AssetCategoryListItem } from '../types';

const YES_NO_OPTIONS = [
  { label: 'Ya', value: 'true' },
  { label: 'Tidak', value: 'false' },
] as const;

interface AssetCategoryFormInput {
  code: string;
  name: string;
  usefulLifeMonths: number | undefined;
  depreciationMethod: string;
  salvageValuePercent: number | undefined;
  maintenanceIntervalMonths: number | undefined;
  requiresSerial: string;
  notes: string;
  isActive: string;
}

type FormMode = 'create' | 'edit';

function FormActions({
  mode,
  isSubmitting,
  onCancel,
}: {
  mode: FormMode;
  isSubmitting?: boolean;
  onCancel?: () => void;
}) {
  const { formState } = useFormContext<AssetCategoryFormInput>();
  const labels = ASSET_CATEGORY_LABELS.FORM;

  return (
    <div className="flex justify-end gap-2">
      <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
        {labels.BUTTONS.BACK}
      </Button>
      <Button
        type="submit"
        form="asset-category-form"
        disabled={!formState.isValid || isSubmitting}
      >
        {isSubmitting
          ? labels.BUTTONS.SAVING
          : mode === 'edit'
            ? labels.BUTTONS.SAVE_CHANGE
            : labels.BUTTONS.SAVE}
      </Button>
    </div>
  );
}

interface AssetCategoryFormProps {
  mode?: FormMode;
  assetCategory?: AssetCategoryListItem | null;
  onSubmit?: (payload: CreateAssetCategoryPayload | UpdateAssetCategoryPayload) => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
  serverErrors?: Record<string, string[]>;
}

export function AssetCategoryForm({
  mode = 'create',
  assetCategory,
  onSubmit,
  onCancel,
  isSubmitting,
  serverErrors,
}: AssetCategoryFormProps) {
  const { data: depreciationMethodEnum, isLoading: isLoadingDepreciationMethods } =
    useDepreciationMethods();

  const depreciationMethodOptions = useMemo(
    () =>
      (depreciationMethodEnum ?? []).map((option) => ({
        ...option,
        disabled: option.value !== 'straight_line',
      })),
    [depreciationMethodEnum]
  );

  const defaultValues = useMemo((): AssetCategoryFormInput => {
    if (!assetCategory) {
      return {
        code: '',
        name: '',
        usefulLifeMonths: undefined,
        depreciationMethod: 'straight_line',
        salvageValuePercent: 0,
        maintenanceIntervalMonths: undefined,
        requiresSerial: 'true',
        notes: '',
        isActive: 'true',
      };
    }

    return {
      code: assetCategory.code ?? '',
      name: assetCategory.name ?? '',
      usefulLifeMonths: assetCategory.usefulLifeMonths ?? undefined,
      depreciationMethod: assetCategory.depreciationMethod ?? 'straight_line',
      salvageValuePercent: assetCategory.salvageValuePercent
        ? Number.parseFloat(assetCategory.salvageValuePercent)
        : 0,
      maintenanceIntervalMonths: assetCategory.maintenanceIntervalMonths ?? undefined,
      requiresSerial: assetCategory.requiresSerial ? 'true' : 'false',
      notes: assetCategory.notes ?? '',
      isActive: assetCategory.isActive ? 'true' : 'false',
    };
  }, [assetCategory]);

  const fields = useMemo<FormFieldConfig<AssetCategoryFormInput>[]>(
    () => [
      {
        name: 'code',
        type: 'text',
        label: ASSET_CATEGORY_LABELS.FORM.FIELDS.CODE,
        placeholder: ASSET_CATEGORY_LABELS.FORM.PLACEHOLDERS.CODE,
        required: true,
        disabled: mode === 'edit',
        colSpan: 6,
        mask: noWhitespace,
      },
      {
        name: 'name',
        type: 'text',
        label: ASSET_CATEGORY_LABELS.FORM.FIELDS.NAME,
        placeholder: ASSET_CATEGORY_LABELS.FORM.PLACEHOLDERS.NAME,
        required: true,
        colSpan: 6,
      },
      {
        name: 'usefulLifeMonths',
        type: 'number',
        label: ASSET_CATEGORY_LABELS.FORM.FIELDS.USEFUL_LIFE_MONTHS,
        placeholder: ASSET_CATEGORY_LABELS.FORM.PLACEHOLDERS.USEFUL_LIFE_MONTHS,
        required: true,
        decimalPlaces: 0,
        emptyValue: 0,
        colSpan: 4,
      },
      {
        name: 'depreciationMethod',
        type: 'select',
        label: ASSET_CATEGORY_LABELS.FORM.FIELDS.DEPRECIATION_METHOD,
        placeholder: ASSET_CATEGORY_LABELS.FORM.PLACEHOLDERS.DEPRECIATION_METHOD,
        required: true,
        options: depreciationMethodOptions,
        isSearchable: false,
        isClearable: false,
        isLoading: isLoadingDepreciationMethods,
        colSpan: 4,
      },
      {
        name: 'salvageValuePercent',
        type: 'number',
        label: ASSET_CATEGORY_LABELS.FORM.FIELDS.SALVAGE_VALUE_PERCENT,
        placeholder: ASSET_CATEGORY_LABELS.FORM.PLACEHOLDERS.SALVAGE_VALUE_PERCENT,
        required: true,
        decimalPlaces: 2,
        emptyValue: 0,
        colSpan: 4,
      },
      {
        name: 'maintenanceIntervalMonths',
        type: 'number',
        label: ASSET_CATEGORY_LABELS.FORM.FIELDS.MAINTENANCE_INTERVAL_MONTHS,
        placeholder: ASSET_CATEGORY_LABELS.FORM.PLACEHOLDERS.MAINTENANCE_INTERVAL_MONTHS,
        required: false,
        decimalPlaces: 0,
        emptyValue: 0,
        colSpan: 4,
      },
      {
        name: 'requiresSerial',
        type: 'select',
        label: ASSET_CATEGORY_LABELS.FORM.FIELDS.REQUIRES_SERIAL,
        options: YES_NO_OPTIONS as unknown as {
          label: string;
          value: string;
        }[],
        placeholder: ASSET_CATEGORY_LABELS.FORM.PLACEHOLDERS.REQUIRES_SERIAL,
        isSearchable: false,
        isClearable: false,
        required: true,
        colSpan: 4,
      },
      {
        name: 'isActive',
        type: 'select',
        label: ASSET_CATEGORY_LABELS.FORM.FIELDS.STATUS,
        options: COMMON_STATUS_OPTIONS,
        placeholder: ASSET_CATEGORY_LABELS.FORM.PLACEHOLDERS.STATUS,
        isSearchable: false,
        isClearable: false,
        required: true,
        colSpan: 4,
      },
      {
        name: 'notes',
        type: 'textarea',
        label: ASSET_CATEGORY_LABELS.FORM.FIELDS.NOTES,
        placeholder: ASSET_CATEGORY_LABELS.FORM.PLACEHOLDERS.NOTES,
        required: false,
        colSpan: 12,
      },
    ],
    [depreciationMethodOptions, isLoadingDepreciationMethods, mode]
  );

  const handleFormSubmit = (formData: AssetCategoryFormInput) => {
    if (!onSubmit) return;

    const payload = {
      name: formData.name,
      usefulLifeMonths: formData.usefulLifeMonths ?? 0,
      depreciationMethod: formData.depreciationMethod,
      salvageValuePercent: formData.salvageValuePercent ?? 0,
      maintenanceIntervalMonths: formData.maintenanceIntervalMonths ?? null,
      requiresSerial: formData.requiresSerial === 'true',
      notes: formData.notes || undefined,
      isActive: formData.isActive === 'true',
    };

    if (mode === 'edit') {
      onSubmit(payload);
      return;
    }

    onSubmit({
      code: formData.code,
      ...payload,
    });
  };

  return (
    <FormCard>
      <FormGenerator<AssetCategoryFormInput>
        id="asset-category-form"
        fields={fields}
        onSubmit={handleFormSubmit}
        syncValues={mode !== 'edit'}
        schema={(mode === 'edit' ? updateAssetCategorySchema : createAssetCategorySchema) as any}
        defaultValues={defaultValues}
        externalErrors={serverErrors}
        actions={<FormActions mode={mode} isSubmitting={isSubmitting} onCancel={onCancel} />}
      />
    </FormCard>
  );
}
