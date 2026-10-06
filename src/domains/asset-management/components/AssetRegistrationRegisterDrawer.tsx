'use client';

import { AlertTriangle, Check, ChevronLeft, ChevronRight, Loader2, X } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { AsyncSelect, Button, type SelectOption, type SelectValue } from '@/components/atoms';
import { SearchBar } from '@/components/molecules/SearchBar';
import { useWarehousesInfinite } from '@/domains/warehouse';
import { ConfirmDialog } from '@/shared/components/molecules/AlertDialog';
import type { FormFieldConfig } from '@/shared/components/organisms/FormGenerator';
import { FormGenerator } from '@/shared/components/organisms/FormGenerator';
import { Badge } from '@/shared/components/ui/badge';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/shared/components/ui/drawer';
import { Switch } from '@/shared/components/ui/switch';
import { useDebounce } from '@/shared/hooks/use-debounce';
import { getErrorCode, getErrorMessage, getFieldErrors } from '@/shared/lib/api-error';
import { cn } from '@/shared/lib/utils';
import { formatCurrencyIDR, formatDateLong } from '@/shared/utils/format';
import { ASSET_CATALOG_LABELS } from '../constants';
import { useAssetCategoriesInfinite } from '../hooks/use-asset-categories-infinite';
import { useCreateAssetRegistration } from '../hooks/use-create-asset-registration';
import { useRegisterableUnitsInfinite } from '../hooks/use-registerable-units-infinite';
import { createAssetRegistrationSchema } from '../schemas';
import type { AssetCategoryListItem, AssetRegistrationRegisterableUnit } from '../types';

type AssetRegistrationFormValues = {
  resourceUnitId: string;
  assetCategoryId: string;
  depreciationStartDate: string;
  salvageValue: number | undefined;
  bookValueAtRegister: number | undefined;
  serialNumber: string;
  notes: string;
  confirm?: boolean;
};

type AssetRegistrationCreateParams = {
  companyId: string;
  payload: {
    resourceUnitId: string;
    assetCategoryId: string;
    depreciationStartDate: string;
    salvageValue?: number;
    bookValueAtRegister?: number | null;
    serialNumber?: string | null;
    notes?: string | null;
    confirm?: boolean;
  };
};

const FORM_ID = 'asset-registration-register-form';
const STEP_UNIT = 1;
const STEP_DETAILS = 2;

function toWarehouseOption(value: string, label: string): SelectOption {
  return { value, label };
}

function toCategoryOption(category: AssetCategoryListItem): SelectOption {
  return {
    value: category.id,
    label: `${category.code} - ${category.name}`,
  };
}

function getWarehouseLabel(unit: AssetRegistrationRegisterableUnit) {
  if (unit.inProject) return 'In Project';
  return unit.warehouse?.name ?? '-';
}

function formatMoney(value?: number | string | null) {
  if (value === null || value === undefined || value === '') return '-';
  return typeof value === 'number' ? formatCurrencyIDR(value) : formatCurrencyIDR(Number(value));
}

function StepPill({
  number,
  label,
  active,
  done,
}: {
  number: number;
  label: string;
  active?: boolean;
  done?: boolean;
}) {
  return (
    <div
      className={cn(
        'flex items-center gap-2 rounded-full border pl-1.5 pr-3 py-1.5 text-sm',
        active && 'border-primary bg-primary/5 text-primary',
        done && !active && ' text-emerald-700',
        !active && !done && 'border-slate-200 bg-slate-50 text-slate-600'
      )}
    >
      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-current/10 text-xs font-semibold">
        {number}
      </span>
      <span className="font-medium">{label}</span>
    </div>
  );
}

function RegisterFormBridge({
  categories,
  selectedUnit,
  onCategoryResolved,
  onFormValidityChange,
}: {
  categories: AssetCategoryListItem[];
  selectedUnit: AssetRegistrationRegisterableUnit | null;
  onCategoryResolved: (category: AssetCategoryListItem | null) => void;
  onFormValidityChange: (isValid: boolean) => void;
}) {
  const { control, formState, setValue } = useFormContext<AssetRegistrationFormValues>();
  const watchedCategoryId = useWatch({ control, name: 'assetCategoryId' });
  const prevCategoryIdRef = useRef<string | null>(null);

  useEffect(() => {
    onFormValidityChange(formState.isValid);
  }, [formState.isValid, onFormValidityChange]);

  useEffect(() => {
    if (prevCategoryIdRef.current === watchedCategoryId) return;
    prevCategoryIdRef.current = watchedCategoryId ?? null;

    const category = categories.find((item) => item.id === watchedCategoryId) ?? null;
    onCategoryResolved(category);

    const salvageDirty = !!formState.dirtyFields.salvageValue;
    if (salvageDirty) return;

    if (!selectedUnit || !category) {
      setValue('salvageValue', undefined, {
        shouldDirty: false,
        shouldTouch: false,
        shouldValidate: true,
      });
      return;
    }

    const acquisitionCost = Number(selectedUnit.acquisitionCost);
    const salvagePercent = Number(category.salvageValuePercent);
    const nextSalvageValue =
      Number.isFinite(acquisitionCost) && Number.isFinite(salvagePercent)
        ? Math.round((acquisitionCost * salvagePercent) / 100)
        : undefined;

    setValue('salvageValue', nextSalvageValue, {
      shouldDirty: false,
      shouldTouch: false,
      shouldValidate: true,
    });
  }, [
    categories,
    formState.dirtyFields.salvageValue,
    onCategoryResolved,
    selectedUnit,
    setValue,
    watchedCategoryId,
  ]);

  return null;
}

function UnitCard({
  unit,
  selected,
  onSelect,
}: {
  unit: AssetRegistrationRegisterableUnit;
  selected: boolean;
  onSelect: (unit: AssetRegistrationRegisterableUnit) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(unit)}
      className={cn(
        'flex w-full flex-col gap-3 rounded-xl border p-4 text-left transition-colors',
        selected
          ? 'ring-primary ring-2 shadow-sm'
          : 'border-slate-200 bg-white hover:ring-primary hover:ring-2'
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-950">{unit.unitCode}</p>
          <p className="mt-0.5 text-sm text-slate-600">{unit.itemName}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {selected && (
            <Badge variant="success">
              <Check />
              Dipilih
            </Badge>
          )}
          {!unit.isAsset && <Badge variant="destructive">Non-Asset</Badge>}
          {unit.isConsumable && <Badge variant="secondary">Consumable</Badge>}
        </div>
      </div>

      <div className="flex flex-col gap-2 text-sm text-slate-600 ">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant={unit.isAsset ? 'success' : 'secondary'}>
              {unit.isAsset ? 'Asset' : 'Non-Asset'}
            </Badge>
            <Badge variant="secondary">{unit.status}</Badge>
          </div>
        </div>

        <div className="grid grid-cols-5 items-center gap-2 mt-3">
          <span className="col-span-2 font-medium text-slate-700">Gudang</span>
          <span className="col-span-3">
            <span className="font-medium text-slate-700">: </span>
            {getWarehouseLabel(unit)}
          </span>
        </div>
        <div className="grid grid-cols-5 items-center gap-2">
          <span className="col-span-2 font-medium text-slate-700">Serial</span>
          <span className="col-span-3">
            <span className="font-medium text-slate-700">: </span>
            {unit.serialNumber ?? '-'}
          </span>
        </div>
        <div className="grid grid-cols-5 items-center gap-2">
          <span className="col-span-2 font-medium text-slate-700">Acquisition Date</span>
          <span className="col-span-3">
            <span className="font-medium text-slate-700">: </span>
            {formatDateLong(unit.acquisitionDate)}
          </span>
        </div>
        <div className="grid grid-cols-5 items-center gap-2">
          <span className="col-span-2 font-medium text-slate-700">Acquisition Cost</span>
          <span className="col-span-3">
            <span className="font-medium text-slate-700">: </span>
            {formatMoney(Number(unit.acquisitionCost))}
          </span>
        </div>
      </div>
    </button>
  );
}

export function AssetRegistrationRegisterDrawer({
  open,
  onClose,
  companyId,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  companyId: string | null;
  onSuccess?: () => void;
}) {
  const [step, setStep] = useState<number>(STEP_UNIT);
  const [unitSearch, setUnitSearch] = useState('');
  const [warehouseSearch, setWarehouseSearch] = useState('');
  const [categorySearch, setCategorySearch] = useState('');
  const [showAll, setShowAll] = useState(false);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string | undefined>();
  const [selectedWarehouseOption, setSelectedWarehouseOption] = useState<SelectOption | null>(null);
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);
  const [selectedUnitSnapshot, setSelectedUnitSnapshot] =
    useState<AssetRegistrationRegisterableUnit | null>(null);
  const [selectedCategorySnapshot, setSelectedCategorySnapshot] =
    useState<AssetCategoryListItem | null>(null);
  const [isFormValid, setIsFormValid] = useState(false);
  const [serverErrors, setServerErrors] = useState<Record<string, string[]>>({});
  const [serverMessage, setServerMessage] = useState<string | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [pendingPayload, setPendingPayload] = useState<AssetRegistrationCreateParams | null>(null);

  const { mutate: createAssetRegistration, isPending } = useCreateAssetRegistration();

  const debouncedUnitSearch = useDebounce(unitSearch, 300);
  const debouncedWarehouseSearch = useDebounce(warehouseSearch, 300);
  const debouncedCategorySearch = useDebounce(categorySearch, 300);

  const {
    items: registerableUnits,
    isLoading: isLoadingUnits,
    error: unitError,
  } = useRegisterableUnitsInfinite({
    companyId,
    enabled: open && !!companyId,
    search: debouncedUnitSearch,
    showAll,
    warehouseId: selectedWarehouseId,
  });

  const {
    options: warehouseOptionsRaw,
    isLoading: isLoadingWarehouses,
    hasMore: hasMoreWarehouses,
    isFetchingNextPage: isFetchingMoreWarehouses,
    loadMore: loadMoreWarehouses,
  } = useWarehousesInfinite({
    companyId: companyId ?? undefined,
    enabled: open && !!companyId,
    search: debouncedWarehouseSearch,
  });

  const {
    items: assetCategories,
    options: assetCategoryOptionsRaw,
    isLoading: isLoadingCategories,
    hasMore: hasMoreCategories,
    isFetchingNextPage: isFetchingMoreCategories,
    loadMore: loadMoreCategories,
  } = useAssetCategoriesInfinite({
    enabled: open && step === STEP_DETAILS,
    isActive: true,
    search: debouncedCategorySearch,
  });

  const resetState = useCallback(() => {
    setStep(STEP_UNIT);
    setUnitSearch('');
    setWarehouseSearch('');
    setCategorySearch('');
    setShowAll(false);
    setSelectedWarehouseId(undefined);
    setSelectedWarehouseOption(null);
    setSelectedUnitId(null);
    setSelectedUnitSnapshot(null);
    setSelectedCategorySnapshot(null);
    setIsFormValid(false);
    setServerErrors({});
    setServerMessage(null);
    setIsConfirmOpen(false);
    setPendingPayload(null);
  }, []);

  useEffect(() => {
    if (!open) {
      resetState();
    }
  }, [open, resetState]);

  const warehouseOptions = useMemo(() => {
    const options = [...warehouseOptionsRaw];
    if (
      selectedWarehouseOption &&
      !options.some((option) => option.value === selectedWarehouseOption.value)
    ) {
      options.unshift(selectedWarehouseOption);
    }
    return options;
  }, [selectedWarehouseOption, warehouseOptionsRaw]);

  const selectedCategoryOption = useMemo(() => {
    if (!selectedCategorySnapshot) return null;
    return toCategoryOption(selectedCategorySnapshot);
  }, [selectedCategorySnapshot]);

  const categoryOptions = useMemo(() => {
    const options = [...assetCategoryOptionsRaw];
    if (
      selectedCategoryOption &&
      !options.some((option) => option.value === selectedCategoryOption.value)
    ) {
      options.unshift(selectedCategoryOption);
    }
    return options;
  }, [assetCategoryOptionsRaw, selectedCategoryOption]);

  const selectedUnit = selectedUnitSnapshot;
  const hardBlocked = !!(selectedUnit?.isConsumable && selectedCategorySnapshot?.requiresSerial);
  const selectedUnitWarning = selectedUnit && !selectedUnit.isAsset;

  const defaultValues = useMemo<AssetRegistrationFormValues>(
    () => ({
      resourceUnitId: selectedUnit?.id ?? '',
      assetCategoryId: '',
      depreciationStartDate: selectedUnit?.acquisitionDate ?? '',
      salvageValue: undefined,
      bookValueAtRegister: undefined,
      serialNumber: selectedUnit?.serialNumber ?? '',
      notes: '',
      confirm: undefined,
    }),
    [selectedUnit]
  );

  const fields = useMemo<FormFieldConfig<AssetRegistrationFormValues>[]>(() => {
    if (!selectedUnit) return [];

    return [
      {
        type: 'custom',
        content: (
          <RegisterFormBridge
            categories={assetCategories}
            selectedUnit={selectedUnit}
            onCategoryResolved={(category) => {
              setSelectedCategorySnapshot(category);
            }}
            onFormValidityChange={setIsFormValid}
          />
        ),
        colSpan: 12,
        className: 'hidden',
      },
      {
        name: 'assetCategoryId',
        type: 'select',
        label: ASSET_CATALOG_LABELS.REGISTER.FIELDS.ASSET_CATEGORY,
        placeholder: ASSET_CATALOG_LABELS.REGISTER.PLACEHOLDERS.ASSET_CATEGORY,
        required: true,
        options: categoryOptions,
        isLoading: isLoadingCategories,
        isSearchable: true,
        isClearable: false,
        colSpan: 12,
        onScrollToBottom:
          hasMoreCategories && !isFetchingMoreCategories ? loadMoreCategories : undefined,
        onSearchChange: setCategorySearch,
      },
      {
        name: 'depreciationStartDate',
        type: 'date',
        label: ASSET_CATALOG_LABELS.REGISTER.FIELDS.DEPRECIATION_START_DATE,
        placeholder: ASSET_CATALOG_LABELS.REGISTER.PLACEHOLDERS.DEPRECIATION_START_DATE,
        required: true,
        colSpan: 12,
      },
      {
        name: 'serialNumber',
        type: 'text',
        label: ASSET_CATALOG_LABELS.REGISTER.FIELDS.SERIAL_NUMBER,
        placeholder: ASSET_CATALOG_LABELS.REGISTER.PLACEHOLDERS.SERIAL_NUMBER,
        required: false,
        colSpan: 12,
      },
      {
        name: 'salvageValue',
        type: 'input-currency',
        label: ASSET_CATALOG_LABELS.REGISTER.FIELDS.SALVAGE_VALUE,
        placeholder: ASSET_CATALOG_LABELS.REGISTER.PLACEHOLDERS.SALVAGE_VALUE,
        prefix: 'Rp',
        decimalPlaces: 0,
        required: false,
        colSpan: 12,
      },
      {
        name: 'bookValueAtRegister',
        type: 'input-currency',
        label: ASSET_CATALOG_LABELS.REGISTER.FIELDS.BOOK_VALUE_AT_REGISTER,
        placeholder: ASSET_CATALOG_LABELS.REGISTER.PLACEHOLDERS.BOOK_VALUE_AT_REGISTER,
        prefix: 'Rp',
        decimalPlaces: 0,
        required: false,
        colSpan: 12,
      },
      {
        name: 'notes',
        type: 'textarea',
        label: ASSET_CATALOG_LABELS.REGISTER.FIELDS.NOTES,
        placeholder: ASSET_CATALOG_LABELS.REGISTER.PLACEHOLDERS.NOTES,
        required: false,
        colSpan: 12,
      },
    ];
  }, [
    assetCategories,
    categoryOptions,
    hasMoreCategories,
    isFetchingMoreCategories,
    isLoadingCategories,
    loadMoreCategories,
    selectedUnit,
  ]);

  const handleClose = useCallback(() => {
    resetState();
    onClose();
  }, [onClose, resetState]);

  const handleUnitSelect = useCallback((unit: AssetRegistrationRegisterableUnit) => {
    setSelectedUnitId(unit.id);
    setSelectedUnitSnapshot(unit);
    setSelectedCategorySnapshot(null);
    setServerErrors({});
    setServerMessage(null);
    setIsConfirmOpen(false);
    setPendingPayload(null);
    setIsFormValid(false);
  }, []);

  const handleWarehouseChange = useCallback(
    (value: SelectValue) => {
      const selectedValue = Array.isArray(value) ? value[0] : value;

      if (!selectedValue) {
        setSelectedWarehouseId(undefined);
        setSelectedWarehouseOption(null);
        return;
      }

      const matched = warehouseOptionsRaw.find((option) => option.value === selectedValue);
      setSelectedWarehouseId(selectedValue);
      setSelectedWarehouseOption(
        matched ?? toWarehouseOption(selectedValue, String(selectedValue))
      );
    },
    [warehouseOptionsRaw]
  );

  const handleShowAllChange = useCallback((checked: boolean) => {
    setShowAll(checked);
  }, []);

  const handleNext = useCallback(() => {
    if (!selectedUnit) return;
    setStep(STEP_DETAILS);
  }, [selectedUnit]);

  const handleBack = useCallback(() => {
    setStep(STEP_UNIT);
  }, []);

  const buildPayload = useCallback(
    (
      values: AssetRegistrationFormValues,
      confirm?: boolean
    ): AssetRegistrationCreateParams | null => {
      if (!companyId || !selectedUnit) return null;

      return {
        companyId,
        payload: {
          resourceUnitId: selectedUnit.id,
          assetCategoryId: values.assetCategoryId,
          depreciationStartDate: values.depreciationStartDate,
          salvageValue: values.salvageValue === undefined ? undefined : Number(values.salvageValue),
          bookValueAtRegister:
            values.bookValueAtRegister === undefined
              ? undefined
              : Number(values.bookValueAtRegister),
          serialNumber: values.serialNumber?.trim() ? values.serialNumber.trim() : undefined,
          notes: values.notes?.trim() ? values.notes.trim() : undefined,
          confirm,
        },
      };
    },
    [companyId, selectedUnit]
  );

  const submitPayload = useCallback(
    (params: AssetRegistrationCreateParams, confirm?: boolean) => {
      createAssetRegistration(
        {
          companyId: params.companyId,
          payload: {
            ...params.payload,
            confirm,
          },
        },
        {
          onSuccess: () => {
            onSuccess?.();
            handleClose();
          },
          onError: (error) => {
            const fieldErrors = getFieldErrors(error);
            if (fieldErrors) {
              setServerErrors(fieldErrors);
              return;
            }

            const errorCode = getErrorCode(error);
            if (errorCode === 'CONFIRMATION_REQUIRED' && !confirm) {
              setPendingPayload(params);
              setIsConfirmOpen(true);
              return;
            }

            setServerMessage(getErrorMessage(error));
          },
        }
      );
    },
    [createAssetRegistration, handleClose, onSuccess]
  );

  const handleFormSubmit = useCallback(
    (values: AssetRegistrationFormValues) => {
      setServerErrors({});
      setServerMessage(null);

      const payload = buildPayload(values);
      if (!payload) return;

      submitPayload(payload);
    },
    [buildPayload, submitPayload]
  );

  const handleConfirmRegister = useCallback(() => {
    if (!pendingPayload) return;

    setIsConfirmOpen(false);
    submitPayload(pendingPayload, true);
  }, [pendingPayload, submitPayload]);

  return (
    <Drawer open={open} onOpenChange={(v) => !v && handleClose()} direction="right">
      <DrawerContent className="w-[min(96vw,72rem)] max-w-[min(96vw,72rem)] inset-y-0! right-0! left-auto! mt-0! rounded-l-xl! rounded-r-none! border-l! flex flex-col">
        <DrawerHeader className="pb-2">
          <div className="flex items-center justify-between gap-4">
            <div className="flex min-w-0 flex-col gap-1">
              <DrawerTitle className="text-2xl font-semibold text-[#0A0A0A]">
                {ASSET_CATALOG_LABELS.REGISTER.TITLE}
              </DrawerTitle>
              <p className="text-sm text-slate-500">Ikuti dua langkah untuk mendaftarkan asset.</p>
            </div>
            <DrawerClose asChild>
              <Button variant="ghost" size="xs" className="h-6 w-6 p-0" aria-label="Close">
                <span className="sr-only">Close</span>
                <X className="h-4 w-4" />
              </Button>
            </DrawerClose>
          </div>
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto px-4 py-5">
          <div className="flex flex-col gap-5">
            <div className="flex flex-wrap gap-2">
              <StepPill
                number={1}
                label={ASSET_CATALOG_LABELS.REGISTER.STEPS.UNIT}
                active={step === STEP_UNIT}
                done={step === STEP_DETAILS}
              />
              <StepPill
                number={2}
                label={ASSET_CATALOG_LABELS.REGISTER.STEPS.DETAILS}
                active={step === STEP_DETAILS}
                done={step === STEP_DETAILS}
              />
            </div>

            {step === STEP_UNIT ? (
              <div className="flex flex-col gap-5">
                <div className="flex flex-wrap items-center gap-3">
                  <SearchBar
                    value={unitSearch}
                    onChange={(event) => setUnitSearch(event.target.value)}
                    onClear={() => setUnitSearch('')}
                    showClear
                    placeholder="Cari unit, serial number, atau nama item..."
                    width="100%"
                    className="min-w-[280px] flex-1"
                  />

                  <AsyncSelect
                    className="min-w-[240px] flex-1"
                    value={selectedWarehouseOption?.value ?? selectedWarehouseId ?? null}
                    options={warehouseOptions}
                    placeholder={ASSET_CATALOG_LABELS.REGISTER.FIELDS.WAREHOUSE}
                    isSearchable
                    isClearable
                    isLoading={isLoadingWarehouses}
                    onChange={handleWarehouseChange}
                    onSearchChange={setWarehouseSearch}
                    onScrollToBottom={
                      hasMoreWarehouses && !isFetchingMoreWarehouses
                        ? loadMoreWarehouses
                        : undefined
                    }
                  />

                  <div className="flex items-center gap-3 rounded-xl border border-slate-200 px-3 py-2">
                    <Switch checked={showAll} onCheckedChange={handleShowAllChange} />
                    <span className="text-sm text-slate-700">
                      {ASSET_CATALOG_LABELS.REGISTER.FIELDS.SHOW_ALL}
                    </span>
                  </div>
                </div>

                {serverMessage && (
                  <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                    {serverMessage}
                  </div>
                )}

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 rounded-full bg-primary/10 p-2 text-primary">
                      <AlertTriangle className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-950">
                        {companyId
                          ? 'Pilih satu unit yang akan didaftarkan sebagai asset.'
                          : 'Company belum dipilih.'}
                      </p>
                      <p className="text-sm text-slate-600">
                        {companyId
                          ? 'Gunakan search, warehouse filter, dan switch show all untuk menemukan unit.'
                          : 'Asset registration membutuhkan company context aktif.'}
                      </p>
                    </div>
                  </div>
                </div>

                {companyId ? (
                  <div className="flex flex-col gap-3">
                    {isLoadingUnits ? (
                      <div className="flex items-center justify-center rounded-xl border border-slate-200 py-12">
                        <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
                      </div>
                    ) : registerableUnits.length === 0 ? (
                      <div className="rounded-xl border border-dashed border-slate-300 px-4 py-10 text-center">
                        <p className="text-sm font-medium text-slate-950">
                          Tidak ada unit yang bisa dipilih.
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                          {showAll
                            ? 'Coba ubah search atau filter warehouse.'
                            : 'Aktifkan show all jika ingin melihat unit non-asset.'}
                        </p>
                      </div>
                    ) : (
                      registerableUnits.map((unit) => (
                        <UnitCard
                          key={unit.id}
                          unit={unit}
                          selected={selectedUnitId === unit.id}
                          onSelect={handleUnitSelect}
                        />
                      ))
                    )}
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-slate-300 px-4 py-10 text-center">
                    <p className="text-sm font-medium text-slate-950">Company belum dipilih.</p>
                    <p className="mt-1 text-sm text-slate-500">
                      Pilih company pada daftar asset catalog terlebih dahulu.
                    </p>
                  </div>
                )}

                {unitError && (
                  <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                    {getErrorMessage(unitError)}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col gap-5">
                {selectedUnit && (
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold text-slate-950">
                          {selectedUnit.unitCode}
                        </p>
                        <p className="text-sm text-slate-600">{selectedUnit.itemName}</p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant={selectedUnit.isAsset ? 'success' : 'secondary'}>
                          {selectedUnit.isAsset ? 'Asset' : 'Non-Asset'}
                        </Badge>
                        {selectedUnit.isConsumable && (
                          <Badge variant="destructive">Consumable</Badge>
                        )}
                        {selectedUnit.inProject && <Badge variant="secondary">In Project</Badge>}
                      </div>
                    </div>

                    <div className="mt-4 grid gap-3 md:grid-cols-1 2xl:grid-cols-2">
                      <div className="rounded-lg bg-white p-3">
                        <p className="text-xs tracking-wide text-slate-500">Warehouse</p>
                        <p className=" text-sm font-semibold text-slate-950">
                          {getWarehouseLabel(selectedUnit)}
                        </p>
                      </div>
                      <div className="rounded-lg bg-white p-3">
                        <p className="text-xs tracking-wide text-slate-500">Serial</p>
                        <p className=" text-sm font-semibold text-slate-950">
                          {selectedUnit.serialNumber ?? '-'}
                        </p>
                      </div>
                      <div className="rounded-lg bg-white p-3">
                        <p className="text-xs tracking-wide text-slate-500">Acquisition Date</p>
                        <p className=" text-sm font-semibold text-slate-950">
                          {formatDateLong(selectedUnit.acquisitionDate)}
                        </p>
                      </div>
                      <div className="rounded-lg bg-white p-3">
                        <p className="text-xs tracking-wide text-slate-500">Acquisition Cost</p>
                        <p className=" text-sm font-semibold text-slate-950">
                          {formatMoney(Number(selectedUnit.acquisitionCost))}
                        </p>
                      </div>
                    </div>

                    {selectedUnitWarning && (
                      <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                        {ASSET_CATALOG_LABELS.REGISTER.WARNINGS.NON_ASSET}
                      </div>
                    )}

                    {hardBlocked && (
                      <div className="mt-3 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                        {ASSET_CATALOG_LABELS.REGISTER.WARNINGS.CONSUMABLE_SERIAL}
                      </div>
                    )}
                  </div>
                )}

                <div className={cn(step === STEP_DETAILS ? 'block' : 'hidden')}>
                  <FormGenerator<AssetRegistrationFormValues>
                    key={selectedUnit?.id ?? 'asset-registration-empty'}
                    id={FORM_ID}
                    schema={createAssetRegistrationSchema as any}
                    fields={fields}
                    onSubmit={handleFormSubmit}
                    defaultValues={defaultValues}
                    externalErrors={serverErrors}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <DrawerFooter className="border-t px-4 py-4">
          {step === STEP_UNIT ? (
            <>
              <Button
                type="button"
                className="w-full"
                onClick={handleNext}
                disabled={!selectedUnit}
              >
                {ASSET_CATALOG_LABELS.REGISTER.BUTTONS.NEXT}
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleClose}
                disabled={isPending}
              >
                {ASSET_CATALOG_LABELS.REGISTER.BUTTONS.BACK}
              </Button>
            </>
          ) : (
            <>
              <Button
                type="submit"
                form={FORM_ID}
                className="w-full"
                disabled={!selectedUnit || hardBlocked || !isFormValid || isPending}
              >
                {isPending
                  ? ASSET_CATALOG_LABELS.REGISTER.BUTTONS.REGISTERING
                  : ASSET_CATALOG_LABELS.REGISTER.BUTTONS.REGISTER}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleBack}
                disabled={isPending}
              >
                <ChevronLeft className="h-4 w-4" />
                {ASSET_CATALOG_LABELS.REGISTER.BUTTONS.BACK}
              </Button>
            </>
          )}
        </DrawerFooter>

        <ConfirmDialog
          open={isConfirmOpen}
          onOpenChange={(value) => {
            if (!value) setIsConfirmOpen(false);
          }}
          variant="default"
          title={ASSET_CATALOG_LABELS.REGISTER.DIALOG.CONFIRM_TITLE}
          description={ASSET_CATALOG_LABELS.REGISTER.DIALOG.CONFIRM_DESCRIPTION}
          cancelText={ASSET_CATALOG_LABELS.REGISTER.DIALOG.CONFIRM_CANCEL}
          confirmText={ASSET_CATALOG_LABELS.REGISTER.DIALOG.CONFIRM_CONFIRM}
          onCancel={() => setIsConfirmOpen(false)}
          onConfirm={handleConfirmRegister}
          isLoading={isPending}
        />
      </DrawerContent>
    </Drawer>
  );
}
