'use client';

import { Loader2, Plus } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { useItemCatalogsInfinite } from '@/domains/item-master/hooks/use-item-catalogs-infinite';
import { useCompanyId } from '@/domains/procurement/hooks/use-company-id';
import { useWarehousesInfinite } from '@/domains/warehouse/hooks/use-warehouses-infinite';
import { Button, Input } from '@/shared/components/atoms';
import { FieldArrayTable, type FieldArrayTableColumn } from '@/shared/components/molecules';
import { FormCard } from '@/shared/components/molecules/FormCard';
import { MultiSelectPopup } from '@/shared/components/molecules/MultiSelectPopup/MultiSelectPopup';
import type { FormFieldConfig } from '@/shared/components/organisms/FormGenerator';
import { FormFieldRenderer, FormGenerator } from '@/shared/components/organisms/FormGenerator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui';
import { useDebounce } from '@/shared/hooks/use-debounce';
import { useMultiSelectPopupField } from '@/shared/hooks/use-multi-select-popup-field';
import { cn } from '@/shared/lib/utils';
import { DELIVERY_ORDER_FORM_LABELS, SOURCE_SHIPPING_TYPE_OPTIONS } from '../constants/form-fields';
import { useDeliveryOrderItemTypes } from '../hooks/use-delivery-order-item-types';
import { useLoadingOrdersInfinite } from '../hooks/use-loading-orders-infinite';
import { usePurchaseOrdersInfinite } from '../hooks/use-purchase-orders-infinite';
import { useVendorCatalogsInfinite } from '../hooks/use-vendor-catalogs-infinite';
import { deliveryOrderSchema, type DeliveryOrderFormValues as FormValues } from '../schemas';
import { aggregateItemsFromPOsAndLOs, toFormItem } from '../services/delivery-order-items';
import type { DeliveryOrder } from '../types';
import type {
  CreateDeliveryOrderPayload,
  DeliveryOrderSourceType,
} from '../types/delivery-order-form';

// -- Source Shipping Type Conditional Fields --
function SourceShippingFields({
  vendorOptions,
  isLoadingVendors,
  hasMoreVendors,
  loadMoreVendors,
  sourceWhOptions,
  isLoadingSourceWh,
  hasMoreSourceWh,
  loadMoreSourceWh,
  setVendorSearch,
  setSourceWhSearch,
}: {
  vendorOptions: any[];
  isLoadingVendors: boolean;
  hasMoreVendors: boolean;
  loadMoreVendors: () => void;
  sourceWhOptions: any[];
  isLoadingSourceWh: boolean;
  hasMoreSourceWh: boolean;
  loadMoreSourceWh: () => void;
  setVendorSearch: (v: string) => void;
  setSourceWhSearch: (v: string) => void;
}) {
  const { control } = useFormContext<FormValues>();
  const sourceShippingType = useWatch({ control, name: 'sourceShippingType' });

  if (sourceShippingType === 'vendor') {
    return (
      <FormFieldRenderer<FormValues>
        field={{
          type: 'select',
          name: 'sourceVendorId',
          label: DELIVERY_ORDER_FORM_LABELS.FIELDS.SOURCE_VENDOR,
          placeholder: DELIVERY_ORDER_FORM_LABELS.PLACEHOLDERS.SOURCE_VENDOR,
          required: false,
          options: vendorOptions,
          isLoading: isLoadingVendors,
          onScrollToBottom: hasMoreVendors ? loadMoreVendors : undefined,
          onSearchChange: setVendorSearch,
          colSpan: { base: 12, md: 6, lg: 4 },
        }}
      />
    );
  }

  if (sourceShippingType === 'warehouse') {
    return (
      <FormFieldRenderer<FormValues>
        field={{
          type: 'select',
          name: 'sourceWarehouseId',
          label: DELIVERY_ORDER_FORM_LABELS.FIELDS.SOURCE_WAREHOUSE,
          placeholder: DELIVERY_ORDER_FORM_LABELS.PLACEHOLDERS.SOURCE_WAREHOUSE,
          required: false,
          options: sourceWhOptions,
          isLoading: isLoadingSourceWh,
          onScrollToBottom: hasMoreSourceWh ? loadMoreSourceWh : undefined,
          onSearchChange: setSourceWhSearch,
          colSpan: { base: 12, md: 6, lg: 4 },
        }}
      />
    );
  }

  return null;
}

// -- Props --
interface DeliveryOrderFormProps {
  defaultData?: DeliveryOrder;
  sourceType?: string;
  onSubmit: (payload: CreateDeliveryOrderPayload) => void;
  isSubmitting?: boolean;
  onCancel?: () => void;
  serverErrors?: Record<string, string[]>;
}

// -- Helpers --
function formatDateInput(iso: string | null | undefined): string {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toISOString().split('T')[0];
}

function toFormDefaults(data?: DeliveryOrder): FormValues {
  if (!data) {
    return {
      sourceType: 'purchase_order',
      sourceShippingType: 'vendor',
      sourceVendorId: null,
      sourceWarehouseId: null,
      destinationWarehouseId: '',
      etd: '',
      eta: '',
      resi: '',
      carrier: '',
      shippingCost: null,
      weight: null,
      notes: '',
      purchaseOrders: [],
      loadingOrders: [],
      items: [],
    };
  }
  return {
    sourceType: data.sourceType ?? '',
    sourceShippingType: data.sourceWarehouse ? 'warehouse' : 'vendor',
    sourceVendorId: null,
    sourceWarehouseId: data.sourceWarehouse?.id ?? null,
    destinationWarehouseId: data.destinationWarehouse?.id ?? '',
    etd: formatDateInput(data.etd),
    eta: formatDateInput(data.eta),
    resi: data.resi ?? '',
    carrier: data.carrier ?? '',
    shippingCost: data.shippingCost ?? null,
    weight: data.weight ?? null,
    notes: data.notes ?? '',
    purchaseOrders: data.purchaseOrders.map((po) => ({
      purchaseOrderId: po.purchaseOrderId,
      code: po.purchaseOrder.code,
      costAllocationPercentage: po.costAllocationPercentage,
      remainingQuantity: 0,
      notes: po.notes ?? '',
      items: [],
    })),
    loadingOrders: data.loadingOrders.map((lo) => ({
      loadingOrderId: lo.loadingOrderId,
      code: lo.loadingOrder?.code ?? '',
      costAllocationPercentage: lo.costAllocationPercentage,
      notes: lo.notes ?? '',
      items: [],
    })),
    items: data.items.map(toFormItem),
  };
}

function normalizeAllocationEntries<T extends { costAllocationPercentage: number }>(
  entries: T[]
): T[] {
  if (entries.length === 1) {
    return entries.map((entry) => ({ ...entry, costAllocationPercentage: 100 }));
  }

  return entries;
}

function PercentageInput({
  value,
  onChange,
}: {
  value: number;
  onChange: (value: number) => void;
}) {
  const [displayValue, setDisplayValue] = useState(() => (value === 0 ? '' : String(value)));

  useEffect(() => {
    setDisplayValue(value === 0 ? '' : String(value));
  }, [value]);

  return (
    <Input
      type="text"
      inputMode="numeric"
      className="w-24 h-8"
      value={displayValue}
      placeholder="0"
      onFocus={(e) => e.target.select()}
      onChange={(e) => {
        const nextDisplayValue = e.target.value.replace(/\D/g, '').slice(0, 3);
        setDisplayValue(nextDisplayValue);

        if (nextDisplayValue === '') {
          onChange(0);
          return;
        }

        onChange(Math.min(100, Number(nextDisplayValue)));
      }}
      onBlur={() => {
        if (displayValue === '') {
          onChange(0);
          return;
        }

        const normalizedValue = Math.min(100, Number(displayValue));
        onChange(normalizedValue);
        setDisplayValue(String(normalizedValue));
      }}
    />
  );
}

function QuantityInput({ value, onChange }: { value: number; onChange: (value: number) => void }) {
  const [displayValue, setDisplayValue] = useState(() => (value === 0 ? '' : String(value)));

  useEffect(() => {
    setDisplayValue(value === 0 ? '' : String(value));
  }, [value]);

  return (
    <Input
      type="text"
      inputMode="numeric"
      className="w-24 h-8"
      value={displayValue}
      placeholder="0"
      onFocus={(e) => e.target.select()}
      onChange={(e) => {
        const nextDisplayValue = e.target.value.replace(/\D/g, '');
        setDisplayValue(nextDisplayValue);

        if (nextDisplayValue === '') {
          onChange(0);
          return;
        }

        onChange(Number(nextDisplayValue));
      }}
      onBlur={() => {
        if (displayValue === '') {
          onChange(0);
          return;
        }

        const normalizedValue = Number(displayValue);
        onChange(normalizedValue);
        setDisplayValue(String(normalizedValue));
      }}
    />
  );
}

function toPayload(values: FormValues, companyId?: string): CreateDeliveryOrderPayload {
  const normalizedPurchaseOrders = normalizeAllocationEntries(values.purchaseOrders);
  const normalizedLoadingOrders = normalizeAllocationEntries(values.loadingOrders);

  const payload: CreateDeliveryOrderPayload = {
    sourceType: values.sourceType as DeliveryOrderSourceType,
    sourceShippingType: values.sourceShippingType,
    sourceShippingId:
      values.sourceShippingType === 'warehouse'
        ? values.sourceWarehouseId || null
        : values.sourceVendorId || null,
    destinationWarehouseId: values.destinationWarehouseId,
    etd: values.etd,
    eta: values.eta,
    resi: values.resi || undefined,
    carrier: values.carrier || undefined,
    shippingCost: values.shippingCost,
    weight: values.weight,
    notes: values.notes || undefined,
    companyId: companyId ?? '',
  };

  if (normalizedPurchaseOrders.length > 0) {
    payload.purchaseOrders = normalizedPurchaseOrders.map((po) => ({
      purchaseOrderId: po.purchaseOrderId,
      costAllocationPercentage: po.costAllocationPercentage,
      costAllocatedAmount: 0,
      notes: po.notes || '',
    }));
  }

  if (normalizedLoadingOrders.length > 0) {
    payload.loadingOrders = normalizedLoadingOrders.map((lo) => ({
      loadingOrderId: lo.loadingOrderId,
      costAllocationPercentage: lo.costAllocationPercentage,
      notes: lo.notes || '',
    }));
  }

  if (values.sourceType === 'other_source' && values.items.length > 0) {
    payload.items = values.items.map((item) => ({
      itemType: item.itemType as 'material' | 'resource',
      itemCatalogId: item.itemCatalogId,
      quantity: item.quantity,
      notes: '',
    }));
  }

  return payload;
}

// -- Purchase Order Section --
function PurchaseOrderSection({ companyId }: { companyId?: string }) {
  const {
    control,
    setValue,
    formState: { errors },
  } = useFormContext<FormValues>();
  const [tableSearch, setTableSearch] = useState('');
  const purchaseOrders = useWatch({ control, name: 'purchaseOrders' });
  const sectionError = errors.purchaseOrders?.message;

  const {
    fields,
    remove,
    popupOpen,
    setPopupOpen,
    setSearch,
    popupItems,
    popupSelected,
    isLoading,
    hasMore,
    loadMore,
    handleOpenPopup,
    handleSelect,
    handleToggle,
  } = useMultiSelectPopupField<FormValues['purchaseOrders'][number], any>({
    control: control as any,
    fieldArrayName: 'purchaseOrders',
    selectIdKey: 'purchaseOrderId',
    useInfiniteHook: (opts) =>
      // biome-ignore lint/correctness/useHookAtTopLevel: Hook is called synchronously during render through callback
      usePurchaseOrdersInfinite({ search: opts.search, companyId, enabled: opts.enabled }),
    mapApiItemToPopupItem: (po: any) => ({
      id: po.id,
      label: po.code,
      description: po.vendor?.name,
    }),
    mapApiItemToFieldValue: (po: any) => ({
      purchaseOrderId: po.id,
      code: po.code,
      costAllocationPercentage: 0,
      remainingQuantity: Number(po.remainingQuantity) || 0,
      notes: '',
      items: (po.items ?? []).map((item: any) => ({
        itemType: 'material',
        itemCatalogId: item.purchaseRequestItem?.catalogId || '',
        resourceUnitId: '',
        itemCode: item.purchaseRequestItem?.boqItemCost?.code || '',
        itemName: item.catalogName || '',
        uom: item.purchaseRequestItem?.uom?.code || '',
        quantity: item.quantity || 0,
      })),
    }),
  });

  useEffect(() => {
    if (purchaseOrders.length === 1 && purchaseOrders[0]?.costAllocationPercentage !== 100) {
      setValue('purchaseOrders.0.costAllocationPercentage', 100, {
        shouldDirty: true,
        shouldValidate: true,
      });
      return;
    }

    if (purchaseOrders.length === 2 && purchaseOrders[0]?.costAllocationPercentage === 100) {
      setValue('purchaseOrders.0.costAllocationPercentage', 0, {
        shouldDirty: true,
        shouldValidate: true,
      });
    }
  }, [purchaseOrders, setValue]);

  const poRows = useMemo(
    () => fields.map((field, index) => ({ ...field, ...purchaseOrders?.[index] })),
    [fields, purchaseOrders]
  );

  const filteredPOs = useMemo(() => {
    if (!tableSearch.trim()) return poRows.map((row, i) => ({ row, originalIndex: i }));
    const q = tableSearch.toLowerCase();
    return poRows
      .map((row, i) => ({ row, originalIndex: i }))
      .filter(({ row }) => row.code?.toLowerCase().includes(q));
  }, [poRows, tableSearch]);

  const columns: FieldArrayTableColumn<(typeof filteredPOs)[number]>[] = [
    { key: 'code', label: 'Code', render: (entry) => entry.row.code },
    {
      key: 'costAllocationPercentage',
      label: 'Distribute Cost (%)',
      render: (entry) => (
        <PercentageInput
          value={entry.row.costAllocationPercentage}
          onChange={(nextValue) => {
            setValue(`purchaseOrders.${entry.originalIndex}.costAllocationPercentage`, nextValue, {
              shouldDirty: true,
              shouldValidate: true,
            });
          }}
        />
      ),
    },
  ];

  return (
    <FormCard className="flex flex-col gap-4">
      <h3 className="text-base font-semibold text-foreground mb-2">
        {DELIVERY_ORDER_FORM_LABELS.TABLES.PURCHASE_ORDER_TITLE}
      </h3>
      {sectionError ? <p className="text-sm text-destructive">{sectionError}</p> : null}
      <div className={cn(sectionError ? 'rounded-md border border-destructive/40' : undefined)}>
        <FieldArrayTable
          columns={columns}
          rows={filteredPOs}
          emptyMessage={
            tableSearch.trim()
              ? 'Tidak ada PO yang cocok dengan pencarian'
              : DELIVERY_ORDER_FORM_LABELS.TABLES.PURCHASE_ORDER_EMPTY
          }
          onRemove={(idx) => remove(filteredPOs[idx].originalIndex)}
          toolbar={
            <>
              <div className="relative flex-1 max-w-xs">
                <Input
                  placeholder={DELIVERY_ORDER_FORM_LABELS.TABLES.SEARCH_PO_PLACEHOLDER}
                  value={tableSearch}
                  onChange={(e) => setTableSearch(e.target.value)}
                  className="h-8"
                />
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleOpenPopup}
                leftIcon={<Plus className="h-4 w-4" />}
              >
                {DELIVERY_ORDER_FORM_LABELS.TABLES.ADD_BUTTON}
              </Button>
            </>
          }
        />
      </div>
      <MultiSelectPopup
        open={popupOpen}
        onClose={() => {
          setPopupOpen(false);
          setSearch('');
        }}
        onSelect={handleSelect}
        onToggle={handleToggle}
        title={DELIVERY_ORDER_FORM_LABELS.TABLES.PO_POPUP_TITLE}
        items={popupItems}
        selectedIds={popupSelected.map((i) => i.id)}
        isLoading={isLoading}
        hasMore={hasMore}
        onLoadMore={loadMore}
        onSearch={setSearch}
        searchPlaceholder={DELIVERY_ORDER_FORM_LABELS.TABLES.SEARCH_PO_PLACEHOLDER}
      />
    </FormCard>
  );
}

// -- Loading Order Section --
function LoadingOrderSection({ companyId }: { companyId?: string }) {
  const {
    control,
    setValue,
    formState: { errors },
  } = useFormContext<FormValues>();
  const [tableSearch, setTableSearch] = useState('');
  const loadingOrders = useWatch({ control, name: 'loadingOrders' });
  const sectionError = errors.loadingOrders?.message;

  const {
    fields,
    remove,
    popupOpen,
    setPopupOpen,
    setSearch,
    popupItems,
    popupSelected,
    isLoading,
    hasMore,
    loadMore,
    handleOpenPopup,
    handleSelect,
    handleToggle,
  } = useMultiSelectPopupField<FormValues['loadingOrders'][number], any>({
    control: control as any,
    fieldArrayName: 'loadingOrders',
    selectIdKey: 'loadingOrderId',
    useInfiniteHook: (opts) =>
      // biome-ignore lint/correctness/useHookAtTopLevel: Hook is called synchronously during render through callback
      useLoadingOrdersInfinite({ search: opts.search, companyId, enabled: opts.enabled }),
    mapApiItemToPopupItem: (lo: any) => ({
      id: lo.id,
      label: lo.code,
      description: `${lo.sourceWarehouse?.name ?? '-'} → ${lo.destinationWarehouse?.name ?? '-'}`,
    }),
    mapApiItemToFieldValue: (lo: any) => ({
      loadingOrderId: lo.id,
      code: lo.code,
      costAllocationPercentage: 0,
      notes: '',
      items: (lo.items ?? []).map(toFormItem),
    }),
  });

  useEffect(() => {
    if (loadingOrders.length === 1 && loadingOrders[0]?.costAllocationPercentage !== 100) {
      setValue('loadingOrders.0.costAllocationPercentage', 100, {
        shouldDirty: true,
        shouldValidate: true,
      });
      return;
    }

    if (loadingOrders.length === 2 && loadingOrders[0]?.costAllocationPercentage === 100) {
      setValue('loadingOrders.0.costAllocationPercentage', 0, {
        shouldDirty: true,
        shouldValidate: true,
      });
    }
  }, [loadingOrders, setValue]);

  const loRows = useMemo(
    () => fields.map((field, index) => ({ ...field, ...loadingOrders?.[index] })),
    [fields, loadingOrders]
  );

  const filteredLOs = useMemo(() => {
    if (!tableSearch.trim()) return loRows.map((row, i) => ({ row, originalIndex: i }));
    const q = tableSearch.toLowerCase();
    return loRows
      .map((row, i) => ({ row, originalIndex: i }))
      .filter(({ row }) => row.code?.toLowerCase().includes(q));
  }, [loRows, tableSearch]);

  const columns: FieldArrayTableColumn<(typeof filteredLOs)[number]>[] = [
    { key: 'code', label: 'Code', render: (entry) => entry.row.code },
    {
      key: 'costAllocationPercentage',
      label: 'Distribute Cost (%)',
      render: (entry) => (
        <PercentageInput
          value={entry.row.costAllocationPercentage}
          onChange={(nextValue) => {
            setValue(`loadingOrders.${entry.originalIndex}.costAllocationPercentage`, nextValue, {
              shouldDirty: true,
              shouldValidate: true,
            });
          }}
        />
      ),
    },
  ];

  return (
    <FormCard className="flex flex-col gap-4">
      <h3 className="text-base font-semibold text-foreground mb-2">
        {DELIVERY_ORDER_FORM_LABELS.TABLES.LOADING_ORDER_TITLE}
      </h3>
      {sectionError ? <p className="text-sm text-destructive">{sectionError}</p> : null}
      <div className={cn(sectionError ? 'rounded-md border border-destructive/40' : undefined)}>
        <FieldArrayTable
          columns={columns}
          rows={filteredLOs}
          emptyMessage={
            tableSearch.trim()
              ? 'Tidak ada LO yang cocok dengan pencarian'
              : DELIVERY_ORDER_FORM_LABELS.TABLES.LOADING_ORDER_EMPTY
          }
          onRemove={(idx) => remove(filteredLOs[idx].originalIndex)}
          toolbar={
            <>
              <div className="relative flex-1 max-w-xs">
                <Input
                  placeholder={DELIVERY_ORDER_FORM_LABELS.TABLES.SEARCH_LO_PLACEHOLDER}
                  value={tableSearch}
                  onChange={(e) => setTableSearch(e.target.value)}
                  className="h-8"
                />
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleOpenPopup}
                leftIcon={<Plus className="h-4 w-4" />}
              >
                {DELIVERY_ORDER_FORM_LABELS.TABLES.ADD_BUTTON}
              </Button>
            </>
          }
        />
      </div>
      <MultiSelectPopup
        open={popupOpen}
        onClose={() => {
          setPopupOpen(false);
          setSearch('');
        }}
        onSelect={handleSelect}
        onToggle={handleToggle}
        title={DELIVERY_ORDER_FORM_LABELS.TABLES.LO_POPUP_TITLE}
        items={popupItems}
        selectedIds={popupSelected.map((i) => i.id)}
        isLoading={isLoading}
        hasMore={hasMore}
        onLoadMore={loadMore}
        onSearch={setSearch}
        searchPlaceholder={DELIVERY_ORDER_FORM_LABELS.TABLES.SEARCH_LO_PLACEHOLDER}
      />
    </FormCard>
  );
}

// -- Item Section: read-only aggregated display (PO / LO sources) --
function ItemSectionReadOnly() {
  const { watch } = useFormContext<FormValues>();
  const items = watch('items');

  const columns: FieldArrayTableColumn<FormValues['items'][number]>[] = [
    { key: 'itemCode', label: 'Code', render: (row) => row.itemCode || '-' },
    { key: 'itemName', label: 'Item Name', render: (row) => row.itemName || '-' },
    { key: 'quantity', label: 'Qty', align: 'right', render: (row) => row.quantity },
    { key: 'uom', label: 'UoM', render: (row) => row.uom || '-' },
  ];

  return (
    <FormCard className="flex flex-col gap-4">
      <h3 className="text-base font-semibold text-foreground mb-2">
        {DELIVERY_ORDER_FORM_LABELS.TABLES.ITEM_TITLE}
      </h3>
      <FieldArrayTable
        columns={columns}
        rows={items}
        emptyMessage={DELIVERY_ORDER_FORM_LABELS.TABLES.ITEM_READONLY_EMPTY}
      />
    </FormCard>
  );
}

// -- Item Section: manual selection (other_source) --
function OtherSourceItemSection() {
  const { control, setValue } = useFormContext<FormValues>();
  const [itemTypeId, setItemTypeId] = useState<string>('');

  const { data: itemTypesData } = useDeliveryOrderItemTypes();
  const itemTypeOptions = itemTypesData?.data ?? [];

  const {
    fields,
    remove,
    popupOpen,
    setPopupOpen,
    search,
    setSearch,
    popupItems,
    popupSelected,
    isLoading,
    hasMore,
    loadMore,
    handleOpenPopup,
    handleSelect,
    handleToggle,
  } = useMultiSelectPopupField<FormValues['items'][number], any>({
    control: control as any,
    fieldArrayName: 'items',
    selectIdKey: 'itemCatalogId',
    useInfiniteHook: (opts) =>
      // biome-ignore lint/correctness/useHookAtTopLevel: Hook is called synchronously during render through callback
      useItemCatalogsInfinite({
        search: opts.search,
        enabled: opts.enabled,
        itemTypeId: itemTypeId || undefined,
      }),
    mapApiItemToPopupItem: (ci: any) => ({
      id: ci.id,
      label: `${ci.code} - ${ci.name}`,
      description: ci.uom?.name,
    }),
    mapApiItemToFieldValue: (ci: any) => ({
      itemType: 'material',
      itemCatalogId: ci.id,
      resourceUnitId: '',
      itemCode: ci.code ?? '',
      itemName: ci.name ?? '',
      uom: ci.uom?.code ?? '',
      quantity: 1,
    }),
  });

  const columns: FieldArrayTableColumn<(typeof fields)[number]>[] = [
    { key: 'item', label: 'Item', render: (row) => row.itemName || row.itemCode || '-' },
    {
      key: 'quantity',
      label: 'Qty',
      render: (row, idx) => (
        <QuantityInput
          value={row.quantity}
          onChange={(nextValue) =>
            setValue(`items.${idx}.quantity`, nextValue, {
              shouldDirty: true,
              shouldValidate: true,
            })
          }
        />
      ),
    },
    { key: 'uom', label: 'UoM', render: (row) => row.uom || '-' },
  ];

  return (
    <FormCard className="flex flex-col gap-4">
      <h3 className="text-base font-semibold text-foreground mb-2">
        {DELIVERY_ORDER_FORM_LABELS.TABLES.ITEM_TITLE}
      </h3>
      <FieldArrayTable
        columns={columns}
        rows={fields}
        emptyMessage={DELIVERY_ORDER_FORM_LABELS.TABLES.ITEM_EMPTY}
        onRemove={remove}
        toolbar={
          <>
            <div className="relative flex-1 max-w-xs">
              <Input
                placeholder={DELIVERY_ORDER_FORM_LABELS.TABLES.SEARCH_ITEM_PLACEHOLDER}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-8"
              />
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleOpenPopup}
              leftIcon={<Plus className="h-4 w-4" />}
            >
              {DELIVERY_ORDER_FORM_LABELS.TABLES.ADD_BUTTON}
            </Button>
          </>
        }
      />
      <MultiSelectPopup
        open={popupOpen}
        onClose={() => {
          setPopupOpen(false);
          setSearch('');
        }}
        onSelect={handleSelect}
        onToggle={handleToggle}
        title={DELIVERY_ORDER_FORM_LABELS.TABLES.ITEM_POPUP_TITLE}
        items={popupItems}
        selectedIds={popupSelected.map((i) => i.id)}
        isLoading={isLoading}
        hasMore={hasMore}
        onLoadMore={loadMore}
        onSearch={setSearch}
        searchPlaceholder={DELIVERY_ORDER_FORM_LABELS.TABLES.SEARCH_ITEM_PLACEHOLDER}
        filterSlot={
          <Select
            value={itemTypeId || '__all__'}
            onValueChange={(v) => setItemTypeId(v === '__all__' ? '' : v)}
          >
            <SelectTrigger className="h-9 w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">
                {DELIVERY_ORDER_FORM_LABELS.TABLES.ITEM_TYPE_PLACEHOLDER}
              </SelectItem>
              {itemTypeOptions.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  {t.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
      />
    </FormCard>
  );
}

// -- Main Form --
export function DeliveryOrderForm({
  defaultData,
  sourceType: externalSourceType,
  onSubmit,
  isSubmitting = false,
  onCancel,
  serverErrors,
}: DeliveryOrderFormProps) {
  const companyId = useCompanyId();
  const defaultValues = useMemo<FormValues>(() => {
    const values = toFormDefaults(defaultData);

    if (externalSourceType === 'purchase_order') {
      return {
        ...values,
        sourceType: 'purchase_order',
        sourceShippingType: 'vendor',
        sourceWarehouseId: null,
      };
    }

    if (externalSourceType === 'transfer_warehouse') {
      return {
        ...values,
        sourceType: 'transfer_warehouse',
        sourceShippingType: 'warehouse',
        sourceVendorId: null,
      };
    }

    if (externalSourceType === 'other_source') {
      return {
        ...values,
        sourceType: 'other_source',
      };
    }

    return values;
  }, [defaultData, externalSourceType]);

  const [vendorSearch, setVendorSearch] = useState('');
  const debouncedVendorSearch = useDebounce(vendorSearch, 300);
  const {
    options: vendorOptions,
    isLoading: isLoadingVendors,
    hasMore: hasMoreVendors,
    loadMore: loadMoreVendors,
  } = useVendorCatalogsInfinite({ search: debouncedVendorSearch });

  const [sourceWhSearch, setSourceWhSearch] = useState('');
  const debouncedSourceWhSearch = useDebounce(sourceWhSearch, 300);
  const {
    options: sourceWhOptions,
    isLoading: isLoadingSourceWh,
    hasMore: hasMoreSourceWh,
    loadMore: loadMoreSourceWh,
  } = useWarehousesInfinite({ search: debouncedSourceWhSearch, companyId });

  const [destSearch, setDestSearch] = useState('');
  const debouncedDestSearch = useDebounce(destSearch, 300);
  const {
    options: destWarehouseOptions,
    isLoading: isLoadingDestWarehouses,
    hasMore: hasMoreDestWarehouses,
    loadMore: loadMoreDestWarehouses,
  } = useWarehousesInfinite({ search: debouncedDestSearch, companyId });

  const [sourceType, setSourceType] = useState(defaultValues.sourceType);

  const fields = useMemo<FormFieldConfig<FormValues>[]>(() => {
    const tableSection: FormFieldConfig<FormValues> | null =
      sourceType === 'purchase_order'
        ? { type: 'custom', colSpan: 12, content: <PurchaseOrderSection companyId={companyId} /> }
        : sourceType === 'transfer_warehouse'
          ? { type: 'custom', colSpan: 12, content: <LoadingOrderSection companyId={companyId} /> }
          : sourceType === 'other_source'
            ? { type: 'custom', colSpan: 12, content: <OtherSourceItemSection /> }
            : null;

    const itemSection: FormFieldConfig<FormValues> | null =
      sourceType === 'purchase_order' || sourceType === 'transfer_warehouse'
        ? { type: 'custom', colSpan: 12, content: <ItemSectionReadOnly /> }
        : null;

    return [
      {
        type: 'custom',
        colSpan: 12,
        content: (
          <FormCard className="flex flex-col gap-4">
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12 md:col-span-6">
                <FormFieldRenderer<FormValues>
                  field={{
                    type: 'text',
                    name: 'resi',
                    label: DELIVERY_ORDER_FORM_LABELS.FIELDS.RESI,
                    placeholder: DELIVERY_ORDER_FORM_LABELS.PLACEHOLDERS.RESI,
                  }}
                />
              </div>
            </div>
          </FormCard>
        ),
      },
      {
        type: 'custom',
        colSpan: 12,
        content: (
          <FormCard className="flex flex-col gap-4">
            <h3 className="text-base font-semibold text-foreground mb-2">
              {DELIVERY_ORDER_FORM_LABELS.SECTIONS.SET_SHIPPING}
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12 md:col-span-6 lg:col-span-4">
                <FormFieldRenderer<FormValues>
                  field={{
                    type: 'select',
                    name: 'sourceShippingType',
                    label: DELIVERY_ORDER_FORM_LABELS.FIELDS.SOURCE_SHIPPING_TYPE,
                    placeholder: DELIVERY_ORDER_FORM_LABELS.PLACEHOLDERS.SOURCE_SHIPPING_TYPE,
                    required: true,
                    isSearchable: false,
                    options: SOURCE_SHIPPING_TYPE_OPTIONS,
                    disabled: sourceType !== 'other_source',
                  }}
                />
              </div>
              <div className="col-span-12 md:col-span-6 lg:col-span-4">
                <SourceShippingFields
                  vendorOptions={vendorOptions}
                  isLoadingVendors={isLoadingVendors}
                  hasMoreVendors={hasMoreVendors}
                  loadMoreVendors={loadMoreVendors}
                  sourceWhOptions={sourceWhOptions}
                  isLoadingSourceWh={isLoadingSourceWh}
                  hasMoreSourceWh={hasMoreSourceWh}
                  loadMoreSourceWh={loadMoreSourceWh}
                  setVendorSearch={setVendorSearch}
                  setSourceWhSearch={setSourceWhSearch}
                />
              </div>
              <div className="col-span-12 md:col-span-6 lg:col-span-4">
                <FormFieldRenderer<FormValues>
                  field={{
                    type: 'select',
                    name: 'destinationWarehouseId',
                    label: DELIVERY_ORDER_FORM_LABELS.FIELDS.DESTINATION,
                    placeholder: DELIVERY_ORDER_FORM_LABELS.PLACEHOLDERS.DESTINATION,
                    required: true,
                    options: destWarehouseOptions,
                    isLoading: isLoadingDestWarehouses,
                    onScrollToBottom: hasMoreDestWarehouses ? loadMoreDestWarehouses : undefined,
                    onSearchChange: setDestSearch,
                  }}
                />
              </div>
              <div className="col-span-12 md:col-span-6 lg:col-span-4">
                <FormFieldRenderer<FormValues>
                  field={{
                    type: 'text',
                    name: 'carrier',
                    label: DELIVERY_ORDER_FORM_LABELS.FIELDS.COURIER,
                    placeholder: DELIVERY_ORDER_FORM_LABELS.PLACEHOLDERS.COURIER,
                  }}
                />
              </div>
              <div className="col-span-12 md:col-span-6 lg:col-span-4">
                <FormFieldRenderer<FormValues>
                  field={{
                    type: 'date',
                    name: 'etd',
                    label: DELIVERY_ORDER_FORM_LABELS.FIELDS.ETD,
                    placeholder: DELIVERY_ORDER_FORM_LABELS.PLACEHOLDERS.DATE,
                    required: true,
                  }}
                />
              </div>
              <div className="col-span-12 md:col-span-6 lg:col-span-4">
                <FormFieldRenderer<FormValues>
                  field={{
                    type: 'date',
                    name: 'eta',
                    label: DELIVERY_ORDER_FORM_LABELS.FIELDS.ETA,
                    placeholder: DELIVERY_ORDER_FORM_LABELS.PLACEHOLDERS.DATE,
                    required: true,
                  }}
                />
              </div>
              <div className="col-span-12 md:col-span-6 lg:col-span-4">
                <FormFieldRenderer<FormValues>
                  field={{
                    type: 'input-currency',
                    name: 'shippingCost',
                    label: DELIVERY_ORDER_FORM_LABELS.FIELDS.SHIPPING_COST,
                    placeholder: DELIVERY_ORDER_FORM_LABELS.PLACEHOLDERS.SHIPPING_COST,
                  }}
                />
              </div>
              <div className="col-span-12 md:col-span-6 lg:col-span-4">
                <FormFieldRenderer<FormValues>
                  field={{
                    type: 'number',
                    name: 'weight',
                    label: DELIVERY_ORDER_FORM_LABELS.FIELDS.WEIGHT,
                    placeholder: DELIVERY_ORDER_FORM_LABELS.PLACEHOLDERS.WEIGHT,
                    decimalPlaces: 1,
                  }}
                />
              </div>
              <div className="col-span-12">
                <FormFieldRenderer<FormValues>
                  field={{
                    type: 'textarea',
                    name: 'notes',
                    label: DELIVERY_ORDER_FORM_LABELS.FIELDS.NOTES,
                    placeholder: DELIVERY_ORDER_FORM_LABELS.PLACEHOLDERS.NOTES,
                  }}
                />
              </div>
            </div>
          </FormCard>
        ),
      },
      ...(tableSection ? [tableSection] : []),
      ...(itemSection ? [itemSection] : []),
    ];
  }, [
    sourceType,
    companyId,
    vendorOptions,
    isLoadingVendors,
    hasMoreVendors,
    loadMoreVendors,
    sourceWhOptions,
    isLoadingSourceWh,
    hasMoreSourceWh,
    loadMoreSourceWh,
    destWarehouseOptions,
    isLoadingDestWarehouses,
    hasMoreDestWarehouses,
    loadMoreDestWarehouses,
  ]);

  const handleSubmit = (values: FormValues) => {
    onSubmit(toPayload(values, companyId));
  };

  return (
    <FormCard>
      <FormGenerator<FormValues>
        id="delivery-order-form"
        schema={deliveryOrderSchema}
        fields={fields}
        defaultValues={defaultValues}
        mode="onBlur"
        externalErrors={serverErrors}
        onSubmit={handleSubmit}
        actions={
          <DeliveryOrderFormActions
            isSubmitting={isSubmitting}
            onCancel={onCancel}
            onSourceTypeChange={setSourceType}
            externalSourceType={externalSourceType}
          />
        }
      />
    </FormCard>
  );
}

// -- Actions: also drives sourceType sync (external prop + purchaseOrders/loadingOrders → items aggregation) --
// All form-state writes happen inside useEffect, never during render — writing via setValue()
// directly in the render body would trigger React's "setState during render" warning/loop.
function DeliveryOrderFormActions({
  isSubmitting,
  onCancel,
  onSourceTypeChange,
  externalSourceType,
}: {
  isSubmitting: boolean;
  onCancel?: () => void;
  onSourceTypeChange: (sourceType: string) => void;
  externalSourceType?: string;
}) {
  const { control, setValue, formState } = useFormContext<FormValues>();

  const sourceType = useWatch({ control, name: 'sourceType' });
  const purchaseOrders = useWatch({ control, name: 'purchaseOrders' });
  const loadingOrders = useWatch({ control, name: 'loadingOrders' });

  useEffect(() => {
    onSourceTypeChange(sourceType);
  }, [sourceType, onSourceTypeChange]);

  useEffect(() => {
    if (sourceType === 'purchase_order') {
      setValue('sourceShippingType', 'vendor', { shouldDirty: false, shouldValidate: true });
      setValue('sourceWarehouseId', null, { shouldDirty: false, shouldValidate: false });
      return;
    }

    if (sourceType === 'transfer_warehouse') {
      setValue('sourceShippingType', 'warehouse', { shouldDirty: false, shouldValidate: true });
      setValue('sourceVendorId', null, { shouldDirty: false, shouldValidate: false });
    }
  }, [sourceType, setValue]);

  useEffect(() => {
    if (externalSourceType !== undefined && externalSourceType !== sourceType) {
      setValue('sourceType', externalSourceType, { shouldValidate: false });
      setValue('purchaseOrders', []);
      setValue('items', []);
    }
  }, [externalSourceType, sourceType, setValue]);

  useEffect(() => {
    if (sourceType === 'purchase_order' || sourceType === 'transfer_warehouse') {
      const aggregated = aggregateItemsFromPOsAndLOs(purchaseOrders, loadingOrders);
      setValue('items', aggregated, { shouldDirty: false });
    } else {
      setValue('purchaseOrders', [], { shouldDirty: false });
      setValue('loadingOrders', [], { shouldDirty: false });
    }
  }, [purchaseOrders, loadingOrders, sourceType, setValue]);

  return (
    <div className="flex gap-3 justify-end">
      <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
        {DELIVERY_ORDER_FORM_LABELS.BUTTONS.CANCEL}
      </Button>
      <Button
        type="submit"
        form="delivery-order-form"
        disabled={!formState.isValid || isSubmitting}
      >
        {isSubmitting ? (
          <span className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            {DELIVERY_ORDER_FORM_LABELS.BUTTONS.SUBMITTING}
          </span>
        ) : (
          DELIVERY_ORDER_FORM_LABELS.BUTTONS.SUBMIT
        )}
      </Button>
    </div>
  );
}
