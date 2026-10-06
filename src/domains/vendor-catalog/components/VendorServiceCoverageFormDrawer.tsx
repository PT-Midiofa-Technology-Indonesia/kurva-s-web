'use client';

import { Trash2, X } from 'lucide-react';
import { useMemo } from 'react';
import { useFieldArray, useFormContext, useWatch } from 'react-hook-form';
import { AsyncSelect, Button } from '@/components/atoms';
import { FormGenerator } from '@/components/organisms/FormGenerator';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/shared/components/ui/drawer';
import { Label } from '@/shared/components/ui/label';
import { useCities, useProvinces } from '@/shared/hooks/use-geography';
import { VENDOR_CATALOG_LABELS } from '../constants';
import { vendorServiceCoverageSyncSchema } from '../schemas';
import type { VendorServiceCoverage, VendorServiceCoverageSyncFormInput } from '../types';

interface CoverageEntryRowProps {
  index: number;
  canRemove: boolean;
  onRemove: (index: number) => void;
}

function CoverageEntryRow({ index, canRemove, onRemove }: CoverageEntryRowProps) {
  const { data: provinceData } = useProvinces();
  const {
    setValue,
    control,
    formState: { errors },
  } = useFormContext<VendorServiceCoverageSyncFormInput>();

  const provinceId = useWatch({ control, name: `coverages.${index}.provinceId` });
  const cityIds = useWatch({ control, name: `coverages.${index}.cityIds` });

  const { data: cityData, isFetching: isCitiesLoading } = useCities(provinceId);

  const coverageErrors = errors.coverages?.[index];

  return (
    <div className="border rounded-lg p-3 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-700">
          {VENDOR_CATALOG_LABELS.SERVICE_COVERAGE.DRAWER.COVERAGE_LABEL}
        </span>
        {canRemove && (
          <button
            type="button"
            onClick={() => onRemove(index)}
            className="text-red-500 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="space-y-1">
        <Label className='text-sm font-medium text-slate-700 after:content-["*"] after:ml-0.5 after:text-primary'>
          {VENDOR_CATALOG_LABELS.SERVICE_COVERAGE.DRAWER.FIELDS.PROVINCE}
        </Label>
        <AsyncSelect
          value={provinceId || null}
          onChange={(val) => {
            const next = (val as string | null) ?? '';
            setValue(`coverages.${index}.provinceId`, next, { shouldValidate: true });
            setValue(`coverages.${index}.cityIds`, [], { shouldValidate: true });
          }}
          options={provinceData ?? []}
          isSearchable
          isClearable
          placeholder={VENDOR_CATALOG_LABELS.SERVICE_COVERAGE.DRAWER.PLACEHOLDERS.PROVINCE}
        />
        {coverageErrors?.provinceId ? (
          <p className="text-xs text-red-600">{coverageErrors.provinceId.message}</p>
        ) : null}
      </div>

      <div className="space-y-1">
        <Label className="text-sm font-medium text-slate-700">
          {VENDOR_CATALOG_LABELS.SERVICE_COVERAGE.DRAWER.FIELDS.CITY}
        </Label>
        <AsyncSelect
          value={cityIds ?? []}
          onChange={(val) => {
            const arr = Array.isArray(val) ? val : val ? [val] : [];
            setValue(`coverages.${index}.cityIds`, arr, { shouldValidate: true });
          }}
          options={cityData ?? []}
          isMulti
          isSearchable
          isClearable
          isLoading={isCitiesLoading}
          placeholder={VENDOR_CATALOG_LABELS.SERVICE_COVERAGE.DRAWER.PLACEHOLDERS.CITY}
          isDisabled={!provinceId}
        />
      </div>
    </div>
  );
}

function CoverageEntriesField() {
  const { control } = useFormContext<VendorServiceCoverageSyncFormInput>();
  const { fields, append, remove } = useFieldArray({ control, name: 'coverages' });

  return (
    <div className="space-y-3">
      {fields.map((field, index) => (
        <CoverageEntryRow
          key={field.id}
          index={index}
          canRemove={fields.length > 1}
          onRemove={remove}
        />
      ))}
      <div className="flex justify-end">
        <Button
          type="button"
          className="bg-slate-900 hover:bg-slate-800"
          onClick={() => append({ provinceId: '', cityIds: [] })}
        >
          {VENDOR_CATALOG_LABELS.SERVICE_COVERAGE.DRAWER.BUTTONS.ADD_COVERAGE}
        </Button>
      </div>
    </div>
  );
}

interface VendorServiceCoverageFormDrawerProps {
  open: boolean;
  onClose: () => void;
  vendorId: string;
  vendorName: string;
  existingItems?: VendorServiceCoverage[];
  onSave: (payload: {
    vendorId: string;
    coverages: { provinceId: string; cityIds: string[] }[];
  }) => void;
  isSaving?: boolean;
}

export function VendorServiceCoverageFormDrawer({
  open,
  onClose,
  vendorId,
  vendorName,
  existingItems,
  onSave,
  isSaving,
}: VendorServiceCoverageFormDrawerProps) {
  const defaultValues = useMemo<VendorServiceCoverageSyncFormInput>(() => {
    if (existingItems && existingItems.length > 0) {
      return {
        coverages: existingItems.map((item) => ({
          provinceId: item.provinceId ?? '',
          cityIds: item.cities?.map((c) => c.id) ?? [],
        })),
      };
    }
    return { coverages: [{ provinceId: '', cityIds: [] }] };
  }, [existingItems]);

  const fields = useMemo(
    () => [{ type: 'custom' as const, content: <CoverageEntriesField /> }],
    []
  );

  const handleSubmit = (data: VendorServiceCoverageSyncFormInput) => {
    onSave({
      vendorId,
      coverages: data.coverages.map((c) => ({
        provinceId: c.provinceId,
        cityIds: c.cityIds ?? [],
      })),
    });
  };

  return (
    <Drawer open={open} onOpenChange={(v) => !v && onClose()} direction="right">
      <DrawerContent className="w-lg max-w-lg inset-y-0! right-0! left-auto! mt-0! rounded-l-xl! rounded-r-none! border-l! flex flex-col">
        <DrawerHeader className="pb-2">
          <div className="flex items-center justify-between">
            <DrawerTitle className="text-lg font-semibold text-[#0A0A0A]">
              {VENDOR_CATALOG_LABELS.SERVICE_COVERAGE.DRAWER.TITLE}
            </DrawerTitle>
            <DrawerClose asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <X className="h-4 w-4" />
              </Button>
            </DrawerClose>
          </div>
          <div className="rounded-lg bg-slate-50 p-3 mt-2">
            <p className="text-sm font-medium text-slate-900">{vendorName}</p>
          </div>
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto px-4 py-2">
          <FormGenerator<VendorServiceCoverageSyncFormInput>
            key={String(open)}
            id="vendor-service-coverage-form"
            schema={vendorServiceCoverageSyncSchema}
            fields={fields}
            onSubmit={handleSubmit}
            defaultValues={defaultValues}
          />
        </div>

        <DrawerFooter className="border-t px-4 py-4">
          <Button type="submit" form="vendor-service-coverage-form" disabled={isSaving}>
            {isSaving
              ? VENDOR_CATALOG_LABELS.SERVICE_COVERAGE.DRAWER.BUTTONS.SAVING
              : VENDOR_CATALOG_LABELS.SERVICE_COVERAGE.DRAWER.BUTTONS.SAVE}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={onClose}
            disabled={isSaving}
          >
            {VENDOR_CATALOG_LABELS.SERVICE_COVERAGE.DRAWER.BUTTONS.CANCEL}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
