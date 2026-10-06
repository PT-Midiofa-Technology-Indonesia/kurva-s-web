'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import {
  Controller,
  FormProvider,
  type Path,
  useFieldArray,
  useForm,
  useFormContext,
  useWatch,
} from 'react-hook-form';
import { applyFormApiErrors } from '@/domains/logistic/utils/apply-form-errors';
import { useWarehousesInfinite } from '@/domains/warehouse';
import { AsyncSelect, Button, Input, type SelectOption } from '@/shared/components/atoms';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/shared/components/ui/drawer';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { ApiErrorClass, getErrorMessage } from '@/shared/lib/api-error';
import { toast } from '@/shared/lib/toast';
import { LOADING_ORDER_LABELS, LOADING_ORDER_SOURCE_TYPE_OPTIONS } from '../constants';
import {
  useCreateLoadingOrder,
  useLoadingOrderAvailableEquipmentQuery,
  useLoadingOrderAvailableMaterialsQuery,
  useLoadingOrderDetailQuery,
  useLoadingOrderSelectableAllocationsQuery,
  useUpdateLoadingOrder,
} from '../hooks';
import {
  type LoadingOrderFormItemValues,
  type LoadingOrderFormValues,
  loadingOrderFormSchema,
} from '../schemas';
import type {
  LoadingOrderAvailableEquipment,
  LoadingOrderAvailableMaterial,
  LoadingOrderItem,
  LoadingOrderSelectableAllocation,
} from '../types';

interface LoadingOrderFormDrawerProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  editId: string | null;
  companyId: string | null;
}

const blankItem = (): LoadingOrderFormItemValues => ({
  itemType: 'material',
  itemCatalogId: '',
  resourceUnitId: '',
  quantity: 1,
  notes: '',
});

function FieldError({
  name,
}: {
  name: keyof LoadingOrderFormValues | `items.${number}.${string}`;
}) {
  const { getFieldState, formState } = useFormContext<LoadingOrderFormValues>();
  const error = getFieldState(name as Path<LoadingOrderFormValues>, formState).error;
  if (!error?.message) return null;
  return <p className="text-xs text-destructive">{error.message}</p>;
}

function toSelectOptionFromMaterial(material: LoadingOrderAvailableMaterial): SelectOption {
  return {
    value: material.itemCatalogId,
    label: `${material.code} - ${material.name} (avail: ${material.availableQuantity})`,
  };
}

function toSelectOptionFromEquipment(equipment: LoadingOrderAvailableEquipment): SelectOption {
  return {
    value: equipment.resourceUnitId,
    label: `${equipment.code} - ${equipment.name}${equipment.serialNumber ? ` (${equipment.serialNumber})` : ''}`,
  };
}

function toSelectOptionFromAllocation(allocation: LoadingOrderSelectableAllocation): SelectOption {
  return {
    value: allocation.resourceAllocationId,
    label: `${allocation.code} - ${allocation.sourceWarehouse.code} ${allocation.sourceWarehouse.name}`,
  };
}

function formatAllocationItem(allocation: LoadingOrderSelectableAllocation): string {
  const item = allocation.itemCatalog ?? allocation.resourceUnit;
  if (!item) return '-';

  const identifier = 'serialNumber' in item && item.serialNumber ? item.serialNumber : item.code;
  return `${identifier} - ${item.name} (${allocation.quantity})`;
}

function toWarehouseOption(warehouse: { id: string; code: string; name: string }): SelectOption {
  return {
    value: warehouse.id,
    label: `${warehouse.code} - ${warehouse.name}`,
  };
}

function LoadingOrderItemRow({
  index,
  companyId,
  sourceWarehouseId,
  readOnly,
  initialItem,
}: {
  index: number;
  companyId: string | null;
  sourceWarehouseId: string;
  readOnly?: boolean;
  initialItem?: LoadingOrderItem | null;
}) {
  const { control, setValue } = useFormContext<LoadingOrderFormValues>();
  const itemType = useWatch({ control, name: `items.${index}.itemType` });
  const itemCatalogId = useWatch({
    control,
    name: `items.${index}.itemCatalogId`,
  });
  const quantity = useWatch({ control, name: `items.${index}.quantity` });
  const notes = useWatch({ control, name: `items.${index}.notes` });

  const [materialSearch, setMaterialSearch] = useState('');
  const [equipmentSearch, setEquipmentSearch] = useState('');

  const { data: materials = [] } = useLoadingOrderAvailableMaterialsQuery(
    sourceWarehouseId,
    { companyId: companyId ?? undefined, search: materialSearch },
    !!sourceWarehouseId && itemType === 'material'
  );
  const { data: equipment = [] } = useLoadingOrderAvailableEquipmentQuery(
    sourceWarehouseId,
    { companyId: companyId ?? undefined, search: equipmentSearch },
    !!sourceWarehouseId && itemType === 'equipment'
  );

  const itemOptions = useMemo(() => {
    const options =
      itemType === 'equipment'
        ? equipment.map(toSelectOptionFromEquipment)
        : materials.map(toSelectOptionFromMaterial);

    const currentOption =
      itemType === 'equipment'
        ? initialItem?.resourceUnit
          ? {
              value: initialItem.resourceUnit.id,
              label: `${initialItem.resourceUnit.code} - ${initialItem.resourceUnit.name}`,
            }
          : null
        : initialItem?.itemCatalog
          ? {
              value: initialItem.itemCatalog.id,
              label: `${initialItem.itemCatalog.code} - ${initialItem.itemCatalog.name}`,
            }
          : null;

    if (!currentOption) return options;
    if (options.some((option) => option.value === currentOption.value)) return options;
    return [currentOption, ...options];
  }, [equipment, initialItem, itemType, materials]);

  useEffect(() => {
    if (itemType === 'material') {
      setValue(`items.${index}.resourceUnitId`, '');
      if (!itemCatalogId) setValue(`items.${index}.quantity`, 1);
    } else {
      setValue(`items.${index}.itemCatalogId`, '');
      setValue(`items.${index}.quantity`, 1);
    }
  }, [index, itemCatalogId, itemType, setValue]);

  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 space-y-3">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-1">
        <div className="space-y-1.5">
          <Label className="text-xs font-normal text-slate-500">
            {LOADING_ORDER_LABELS.FORM.ITEM_TYPE}
          </Label>
          <Controller
            control={control}
            name={`items.${index}.itemType`}
            render={({ field }) => (
              <AsyncSelect
                options={[
                  { value: 'material', label: 'Material' },
                  { value: 'equipment', label: 'Equipment' },
                ]}
                value={field.value}
                onChange={(selected) => {
                  const value = Array.isArray(selected) ? selected[0] : selected;
                  field.onChange((value as string) || 'material');
                }}
                isSearchable={false}
                isClearable={false}
                placeholder="Pilih tipe item"
                isDisabled={readOnly}
                className="bg-white"
              />
            )}
          />
          <FieldError name={`items.${index}.itemType`} />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-normal text-slate-500">
            {LOADING_ORDER_LABELS.FORM.ITEM}
          </Label>
          <Controller
            control={control}
            name={
              itemType === 'equipment'
                ? `items.${index}.resourceUnitId`
                : `items.${index}.itemCatalogId`
            }
            render={({ field }) => (
              <AsyncSelect
                options={itemOptions}
                value={field.value}
                onChange={(selected) => {
                  const value = Array.isArray(selected) ? selected[0] : selected;
                  field.onChange(value || '');
                  if (itemType === 'equipment') {
                    setValue(`items.${index}.quantity`, 1);
                  }
                }}
                isSearchable
                onSearchChange={(value) => {
                  if (itemType === 'equipment') {
                    setEquipmentSearch(value);
                  } else {
                    setMaterialSearch(value);
                  }
                }}
                placeholder={sourceWarehouseId ? 'Pilih item' : 'Pilih source warehouse dulu'}
                isDisabled={readOnly || !sourceWarehouseId}
                className="bg-white"
              />
            )}
          />
          <FieldError
            name={
              itemType === 'equipment'
                ? `items.${index}.resourceUnitId`
                : `items.${index}.itemCatalogId`
            }
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-1">
        <div className="space-y-1.5">
          <Label className="text-xs font-normal text-slate-500">
            {LOADING_ORDER_LABELS.FORM.QUANTITY}
          </Label>
          <Input
            type="number"
            min={1}
            disabled={readOnly || itemType === 'equipment'}
            value={quantity ?? 1}
            onChange={(event) =>
              setValue(`items.${index}.quantity`, Number(event.target.value || 1))
            }
            className="h-9 bg-white"
          />
          <FieldError name={`items.${index}.quantity`} />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-normal text-slate-500">
            {LOADING_ORDER_LABELS.FORM.ITEM_NOTES}
          </Label>
          <Input
            value={notes ?? ''}
            onChange={(event) => setValue(`items.${index}.notes`, event.target.value)}
            disabled={readOnly}
            placeholder="Catatan item"
            className="h-9 bg-white"
          />
          <FieldError name={`items.${index}.notes`} />
        </div>
      </div>
    </div>
  );
}

function LoadingOrderItemsEditor({
  companyId,
  sourceWarehouseId,
  initialItems,
  readOnly,
}: {
  companyId: string | null;
  sourceWarehouseId: string;
  initialItems?: LoadingOrderItem[];
  readOnly?: boolean;
}) {
  const { control } = useFormContext<LoadingOrderFormValues>();
  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: 'items',
  });
  const sourceType = useWatch({ control, name: 'sourceType' });

  useEffect(() => {
    if (readOnly) return;
    if (sourceType === 'manual') {
      if (fields.length === 0) append(blankItem());
    } else if (fields.length > 0) {
      replace([]);
    }
  }, [append, fields.length, readOnly, replace, sourceType]);

  if (sourceType !== 'manual') return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium text-slate-700">
          {LOADING_ORDER_LABELS.FORM.ITEMS}
        </Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => append(blankItem())}
          className="h-8 gap-2"
          disabled={readOnly}
        >
          <Plus className="h-4 w-4" />
          {LOADING_ORDER_LABELS.FORM.ADD_ITEM}
        </Button>
      </div>

      <div className="space-y-3">
        {fields.map((field, index) => (
          <div key={field.id} className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Item {index + 1}</span>
              {fields.length > 1 && !readOnly && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => remove(index)}
                  className="h-8 w-8 p-0 text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
            <LoadingOrderItemRow
              index={index}
              companyId={companyId}
              sourceWarehouseId={sourceWarehouseId}
              readOnly={readOnly}
              initialItem={initialItems?.[index] ?? null}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export function LoadingOrderFormDrawer({
  open,
  onClose,
  onSuccess,
  editId,
  companyId,
}: LoadingOrderFormDrawerProps) {
  const isEdit = !!editId;
  const { data: detailResponse, isLoading: detailLoading } = useLoadingOrderDetailQuery(
    editId ?? '',
    companyId
  );
  const { mutateAsync: createLoadingOrder, isPending: isCreating } = useCreateLoadingOrder();
  const { mutateAsync: updateLoadingOrder, isPending: isUpdating } = useUpdateLoadingOrder();
  const {
    options: warehouseOptions,
    isLoading: warehouseLoading,
    hasMore: warehouseHasMore,
    loadMore: warehouseLoadMore,
  } = useWarehousesInfinite({
    companyId: companyId ?? undefined,
    includeCompanyIdParam: true,
    enabled: open,
    isActive: true,
    perPage: 20,
  });

  const detail = detailResponse?.success ? detailResponse.data : null;
  const isEditable = !isEdit || detail?.status === 'draft';

  const defaultValues = useMemo<LoadingOrderFormValues>(() => {
    if (detail) {
      return {
        sourceType: detail.sourceType,
        resourceAllocationId: detail.resourceAllocation?.id ?? '',
        sourceWarehouseId: detail.sourceWarehouse?.id ?? '',
        destinationWarehouseId: detail.destinationWarehouse?.id ?? '',
        notes: detail.notes ?? '',
        items:
          detail.sourceType === 'manual'
            ? detail.items.map((item) => ({
                itemType: item.itemType === 'equipment' ? 'equipment' : 'material',
                itemCatalogId: item.itemCatalog?.id ?? '',
                resourceUnitId: item.resourceUnit?.id ?? '',
                quantity: item.quantity ?? 1,
                notes: item.notes ?? '',
              }))
            : [],
      };
    }

    return {
      sourceType: 'manual',
      resourceAllocationId: '',
      sourceWarehouseId: '',
      destinationWarehouseId: '',
      notes: '',
      items: [blankItem()],
    };
  }, [detail]);

  const form = useForm<LoadingOrderFormValues>({
    resolver: zodResolver(loadingOrderFormSchema) as any,
    defaultValues,
    mode: 'onChange',
  });

  const {
    control,
    handleSubmit,
    register,
    reset,
    setError,
    setValue,
    formState: { isValid, isSubmitting },
  } = form;

  const sourceType = useWatch({ control, name: 'sourceType' });
  const sourceWarehouseId = useWatch({ control, name: 'sourceWarehouseId' });
  const resourceAllocationId = useWatch({
    control,
    name: 'resourceAllocationId',
  });

  const [allocationSearch, setAllocationSearch] = useState('');

  const { data: allocations = [] } = useLoadingOrderSelectableAllocationsQuery(
    { companyId: companyId ?? undefined, search: allocationSearch },
    open && sourceType === 'allocation' && !isEdit
  );

  useEffect(() => {
    if (!open) {
      setAllocationSearch('');
    }
    reset(defaultValues);
  }, [defaultValues, open, reset]);

  const warehouseSelectOptions = useMemo(() => {
    const options = warehouseOptions.slice();
    if (detail?.sourceWarehouse) {
      const current = toWarehouseOption(detail.sourceWarehouse);
      if (!options.some((option) => option.value === current.value)) options.unshift(current);
    }
    if (detail?.destinationWarehouse) {
      const current = toWarehouseOption(detail.destinationWarehouse);
      if (!options.some((option) => option.value === current.value)) options.unshift(current);
    }
    return options;
  }, [detail?.destinationWarehouse, detail?.sourceWarehouse, warehouseOptions]);

  const allocationOptions = useMemo<SelectOption[]>(
    () => allocations.map(toSelectOptionFromAllocation),
    [allocations]
  );
  const selectedAllocation = useMemo(
    () =>
      allocations.find((allocation) => allocation.resourceAllocationId === resourceAllocationId),
    [allocations, resourceAllocationId]
  );

  const handleClose = () => {
    onClose();
  };

  const onSubmit = handleSubmit(async (values) => {
    if (!companyId) return;

    try {
      if (isEdit && editId) {
        const payload =
          values.sourceType === 'manual'
            ? {
                destinationWarehouseId: values.destinationWarehouseId,
                notes: values.notes || null,
                items: values.items.map((item: LoadingOrderFormItemValues) =>
                  item.itemType === 'equipment'
                    ? {
                        resourceUnitId: item.resourceUnitId,
                        quantity: 1,
                        notes: item.notes || null,
                      }
                    : {
                        itemCatalogId: item.itemCatalogId,
                        quantity: item.quantity,
                        notes: item.notes || null,
                      }
                ),
              }
            : {
                destinationWarehouseId: values.destinationWarehouseId,
                notes: values.notes || null,
              };

        await updateLoadingOrder({
          id: editId,
          payload,
          companyId,
        });
      } else {
        const payload =
          values.sourceType === 'allocation'
            ? {
                sourceType: 'allocation' as const,
                resourceAllocationId: values.resourceAllocationId,
                destinationWarehouseId: values.destinationWarehouseId,
                notes: values.notes || null,
              }
            : {
                sourceType: 'manual' as const,
                sourceWarehouseId: values.sourceWarehouseId,
                destinationWarehouseId: values.destinationWarehouseId,
                notes: values.notes || null,
                items: values.items.map((item: LoadingOrderFormItemValues) =>
                  item.itemType === 'equipment'
                    ? {
                        resourceUnitId: item.resourceUnitId,
                        quantity: 1,
                        notes: item.notes || null,
                      }
                    : {
                        itemCatalogId: item.itemCatalogId,
                        quantity: item.quantity,
                        notes: item.notes || null,
                      }
                ),
              };

        await createLoadingOrder({
          payload,
          companyId,
        });
      }

      onClose();
      onSuccess?.();
    } catch (error) {
      if (applyFormApiErrors(error, setError)) return;
      if (error instanceof ApiErrorClass) {
        toast.error({ title: error.message });
        return;
      }
      toast.error({ title: getErrorMessage(error) });
    }
  });

  const isSaving = isCreating || isUpdating || isSubmitting;

  if (isEdit && detailLoading) {
    return (
      <Drawer open={open} onOpenChange={(value) => !value && handleClose()} direction="right">
        <DrawerContent className="w-xl max-w-xl inset-y-0! right-0! left-auto! mt-0! rounded-l-xl! rounded-r-none! border-l! flex flex-col">
          <DrawerHeader className="pb-2">
            <div className="flex items-center justify-between">
              <DrawerTitle className="text-2xl font-semibold text-[#0A0A0A]">
                {LOADING_ORDER_LABELS.FORM.EDIT_TITLE}
              </DrawerTitle>
              <DrawerClose asChild>
                <Button variant="ghost" size="xs" className="h-6 w-6 p-0" aria-label="Close">
                  <span className="text-lg leading-none">&times;</span>
                </Button>
              </DrawerClose>
            </div>
          </DrawerHeader>
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Drawer open={open} onOpenChange={(value) => !value && handleClose()} direction="right">
      <DrawerContent className="w-xl max-w-xl inset-y-0! right-0! left-auto! mt-0! rounded-l-xl! rounded-r-none! border-l! flex flex-col">
        <DrawerHeader className="pb-2">
          <div className="flex items-center justify-between">
            <DrawerTitle className="text-2xl font-semibold text-[#0A0A0A]">
              {isEdit
                ? LOADING_ORDER_LABELS.FORM.EDIT_TITLE
                : LOADING_ORDER_LABELS.FORM.CREATE_TITLE}
            </DrawerTitle>
            <DrawerClose asChild>
              <Button variant="ghost" size="xs" className="h-6 w-6 p-0" aria-label="Close">
                <span className="text-lg leading-none">&times;</span>
              </Button>
            </DrawerClose>
          </div>
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto px-4 py-6">
          <FormProvider {...form}>
            <form id="loading-order-form" onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-slate-700">
                  {LOADING_ORDER_LABELS.FORM.SOURCE_TYPE}
                </Label>
                <Controller
                  control={control}
                  name="sourceType"
                  render={({ field }) => (
                    <AsyncSelect
                      options={LOADING_ORDER_SOURCE_TYPE_OPTIONS}
                      value={field.value}
                      onChange={(selected) => {
                        const value = Array.isArray(selected) ? selected[0] : selected;
                        field.onChange((value as string) || 'manual');
                        if ((value as string) === 'allocation') {
                          setValue('sourceWarehouseId', '');
                          setValue('items', []);
                        }
                      }}
                      isSearchable={false}
                      isClearable={false}
                      isDisabled={isEdit || !isEditable}
                      placeholder="Pilih source type"
                    />
                  )}
                />
                <FieldError name="sourceType" />
              </div>

              {sourceType === 'allocation' ? (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium text-slate-700">
                      {LOADING_ORDER_LABELS.FORM.RESOURCE_ALLOCATION}
                    </Label>
                    {isEdit ? (
                      <Input
                        value={detail?.resourceAllocation?.code ?? ''}
                        disabled
                        className="h-10"
                      />
                    ) : (
                      <Controller
                        control={control}
                        name="resourceAllocationId"
                        render={({ field }) => (
                          <AsyncSelect
                            options={allocationOptions}
                            value={field.value}
                            onChange={(selected) => {
                              const value = Array.isArray(selected) ? selected[0] : selected;
                              field.onChange(value || '');
                            }}
                            isSearchable
                            onSearchChange={setAllocationSearch}
                            placeholder="Pilih resource allocation"
                            isDisabled={!isEditable}
                          />
                        )}
                      />
                    )}
                    <FieldError name="resourceAllocationId" />
                  </div>
                  {selectedAllocation ? (
                    <div className="space-y-1.5">
                      <Label className="text-sm font-medium text-slate-700">Item</Label>
                      <Input
                        value={formatAllocationItem(selectedAllocation)}
                        disabled
                        className="h-10"
                      />
                    </div>
                  ) : null}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium text-slate-700">
                      {LOADING_ORDER_LABELS.FORM.SOURCE_WAREHOUSE}
                    </Label>
                    {isEdit ? (
                      <Input
                        value={detail?.sourceWarehouse?.code ?? ''}
                        disabled
                        className="h-10"
                      />
                    ) : (
                      <Controller
                        control={control}
                        name="sourceWarehouseId"
                        render={({ field }) => (
                          <AsyncSelect
                            options={warehouseSelectOptions}
                            value={field.value}
                            onChange={(selected) => {
                              const value = Array.isArray(selected) ? selected[0] : selected;
                              field.onChange(value || '');
                            }}
                            isSearchable
                            placeholder="Pilih source warehouse"
                            isLoading={warehouseLoading}
                            onScrollToBottom={
                              warehouseHasMore ? () => warehouseLoadMore() : undefined
                            }
                            isDisabled={!isEditable}
                          />
                        )}
                      />
                    )}
                    <FieldError name="sourceWarehouseId" />
                  </div>

                  <LoadingOrderItemsEditor
                    companyId={companyId}
                    sourceWarehouseId={sourceWarehouseId}
                    initialItems={detail?.items}
                    readOnly={!isEditable}
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-slate-700">
                  {LOADING_ORDER_LABELS.FORM.DESTINATION_WAREHOUSE}
                </Label>
                <Controller
                  control={control}
                  name="destinationWarehouseId"
                  render={({ field }) => (
                    <AsyncSelect
                      options={warehouseSelectOptions}
                      value={field.value}
                      onChange={(selected) => {
                        const value = Array.isArray(selected) ? selected[0] : selected;
                        field.onChange(value || '');
                      }}
                      isSearchable
                      placeholder="Pilih destination warehouse"
                      isLoading={warehouseLoading}
                      onScrollToBottom={warehouseHasMore ? () => warehouseLoadMore() : undefined}
                      isDisabled={!isEditable}
                    />
                  )}
                />
                <FieldError name="destinationWarehouseId" />
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-slate-700">
                  {LOADING_ORDER_LABELS.FORM.NOTES}
                </Label>
                <Textarea
                  rows={4}
                  placeholder="Catatan tambahan"
                  disabled={!isEditable}
                  {...register('notes')}
                />
                <FieldError name="notes" />
              </div>
            </form>
          </FormProvider>
        </div>

        <DrawerFooter className="px-4 py-4 border-t flex flex-col gap-3">
          <Button
            form="loading-order-form"
            type="submit"
            className="w-full bg-teal-600 hover:bg-teal-700 text-white"
            disabled={isSaving || !isValid || !isEditable}
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : isEdit ? (
              LOADING_ORDER_LABELS.FORM.SAVE_CHANGES
            ) : (
              LOADING_ORDER_LABELS.FORM.SAVE
            )}
          </Button>
          <Button variant="outline" onClick={handleClose} className="w-full">
            {LOADING_ORDER_LABELS.FORM.CANCEL}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
