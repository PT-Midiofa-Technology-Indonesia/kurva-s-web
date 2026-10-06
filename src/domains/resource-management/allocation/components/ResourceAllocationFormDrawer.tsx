'use client';

import { Loader2 } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { useItemCatalogsInfinite } from '@/domains/item-master';
import { useResourceUnitsInfinite } from '@/domains/resource-management/catalog';
import { useWarehousesInfinite } from '@/domains/warehouse';
import type { Warehouse } from '@/domains/warehouse/types';
import { Button, type SelectOption } from '@/shared/components/atoms';
import type { FormFieldConfig } from '@/shared/components/organisms/FormGenerator';
import { FormGenerator } from '@/shared/components/organisms/FormGenerator';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/shared/components/ui/drawer';
import { RESOURCE_ALLOCATION_LABELS, RESOURCE_ALLOCATION_TYPE_OPTIONS } from '../constants';
import { useCreateResourceAllocation } from '../hooks/use-create-resource-allocation';
import { useResourceAllocation } from '../hooks/use-resource-allocation';
import { useUpdateResourceAllocation } from '../hooks/use-update-resource-allocation';
import { type CreateResourceAllocationForm, createResourceAllocationSchema } from '../schemas';
import type { CreateResourceAllocationPayload, UpdateResourceAllocationPayload } from '../types';

interface ResourceAllocationFormDrawerProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  editId: string | null;
  projectId: string;
}

function FormValidityTracker({ onValidChange }: { onValidChange: (v: boolean) => void }) {
  const { formState } = useFormContext<CreateResourceAllocationForm>();
  useEffect(() => {
    onValidChange(formState.isValid);
  }, [formState.isValid, onValidChange]);
  return null;
}

function WarehouseWatcher({
  onWarehouseChange,
}: {
  onWarehouseChange: (id: string | null) => void;
}) {
  const { watch } = useFormContext<CreateResourceAllocationForm>();
  useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (name === 'warehouseId') {
        onWarehouseChange(value.warehouseId || null);
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, onWarehouseChange]);
  return null;
}

function buildFormFields(
  allocationType: string,
  selectedWarehouseId: string | null,
  warehouseOptions: SelectOption[],
  resourceUnitOptions: SelectOption[],
  itemOptions: SelectOption[],
  warehousesLoading: boolean,
  resourceUnitsLoading: boolean,
  itemsLoading: boolean,
  warehousesHasMore: boolean,
  resourceUnitsHasMore: boolean,
  itemsHasMore: boolean,
  warehousesLoadMore: () => void,
  resourceUnitsLoadMore: () => void,
  itemsLoadMore: () => void,
  onValidChange: (v: boolean) => void,
  onWarehouseChange: (id: string | null) => void
): FormFieldConfig<CreateResourceAllocationForm>[] {
  const fields: FormFieldConfig<CreateResourceAllocationForm>[] = [
    {
      type: 'custom',
      content: <FormValidityTracker onValidChange={onValidChange} />,
      colSpan: 1,
      className: 'hidden',
    },
    {
      type: 'custom',
      content: <WarehouseWatcher onWarehouseChange={onWarehouseChange} />,
      colSpan: 1,
      className: 'hidden',
    },
    {
      name: 'allocationType',
      type: 'select',
      label: RESOURCE_ALLOCATION_LABELS.LIST.COLUMNS.TYPE,
      required: true,
      options: RESOURCE_ALLOCATION_TYPE_OPTIONS,
      isSearchable: false,
      colSpan: 12,
    },
  ];

  if (allocationType === 'unit') {
    fields.push(
      {
        name: 'warehouseId',
        type: 'select',
        label: 'Source Warehouse',
        placeholder: 'Pilih Warehouse',
        required: true,
        options: warehouseOptions,
        isSearchable: true,
        isLoading: warehousesLoading,
        onScrollToBottom: warehousesHasMore ? warehousesLoadMore : undefined,
        colSpan: 12,
      },
      {
        name: 'resourceUnitId',
        type: 'select',
        label: 'Resource Unit',
        placeholder: 'Pilih Warehouse terlebih dahulu',
        required: true,
        disabled: !selectedWarehouseId,
        options: resourceUnitOptions,
        isSearchable: true,
        isLoading: resourceUnitsLoading,
        onScrollToBottom: resourceUnitsHasMore ? resourceUnitsLoadMore : undefined,
        colSpan: 12,
      }
    );
  } else {
    fields.push(
      {
        name: 'itemCatalogId',
        type: 'select',
        label: 'Item Catalog',
        placeholder: 'Pilih Item Catalog',
        required: true,
        options: itemOptions,
        isSearchable: true,
        isLoading: itemsLoading,
        onScrollToBottom: itemsHasMore ? itemsLoadMore : undefined,
        colSpan: 8,
      },
      {
        name: 'quantity',
        type: 'number',
        label: 'Quantity',
        required: true,
        colSpan: 4,
      },
      {
        name: 'warehouseId',
        type: 'select',
        label: 'Source Warehouse',
        placeholder: 'Pilih Warehouse',
        required: true,
        options: warehouseOptions,
        isSearchable: true,
        isLoading: warehousesLoading,
        onScrollToBottom: warehousesHasMore ? warehousesLoadMore : undefined,
        colSpan: 12,
      }
    );
  }

  fields.push(
    {
      name: 'allocationFromDate',
      type: 'date',
      label: 'Tanggal Mulai',
      required: true,
      colSpan: 6,
    },
    {
      name: 'allocationToDate',
      type: 'date',
      label: 'Tanggal Akhir',
      required: true,
      colSpan: 6,
    },
    {
      name: 'notes',
      type: 'textarea',
      label: 'Catatan',
      required: false,
      colSpan: 12,
    }
  );

  return fields;
}

export function ResourceAllocationFormDrawer({
  open,
  onClose,
  onSuccess,
  editId,
  projectId,
}: ResourceAllocationFormDrawerProps) {
  const isEdit = !!editId;

  // ── Detail fetch for edit mode ──
  const { data: detailData, isLoading: detailLoading } = useResourceAllocation(
    editId ?? '',
    projectId
  );

  // ── Mutations ──
  const { mutate: createMutate, isPending: createPending } = useCreateResourceAllocation(projectId);
  const { mutate: updateMutate, isPending: updatePending } = useUpdateResourceAllocation(
    editId ?? '',
    projectId
  );
  const isSaving = createPending || updatePending;

  // ── Form validity tracker ──
  const [isValid, setIsValid] = useState(false);

  // ── Allocation type watcher for conditional fields ──
  const [allocationType, setAllocationType] = useState<string>('unit');

  // ── Selected warehouse for resource unit fetch ──
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string | null>(null);

  // ── Item catalog options ──
  const {
    options: itemOptions,
    isLoading: itemsLoading,
    hasMore: itemsHasMore,
    loadMore: itemsLoadMore,
  } = useItemCatalogsInfinite({ perPage: 20, enabled: open, isAllocatable: true });

  // ── Warehouse options (with warehouses array for company lookup) ──
  const {
    options: warehouseOptions,
    warehouses,
    isLoading: warehousesLoading,
    hasMore: warehousesHasMore,
    loadMore: warehousesLoadMore,
  } = useWarehousesInfinite({ perPage: 20, enabled: open });

  // ── Selected warehouse data (for companyId) ──
  const selectedWarehouse = useMemo<Warehouse | null>(
    () => warehouses.find((w) => w.id === selectedWarehouseId) ?? null,
    [warehouses, selectedWarehouseId]
  );

  // ── Resource unit options (enabled only when warehouse selected) ──
  const {
    options: resourceUnitOptions,
    isLoading: resourceUnitsLoading,
    hasMore: resourceUnitsHasMore,
    loadMore: resourceUnitsLoadMore,
  } = useResourceUnitsInfinite({
    perPage: 20,
    enabled: open && !!selectedWarehouseId && !!selectedWarehouse?.company?.id,
    companyId: selectedWarehouse?.company?.id,
    warehouseId: selectedWarehouseId ?? undefined,
    isAllocatable: true,
  });

  // ── Sync allocationType and warehouseId from detail in edit mode ──
  useEffect(() => {
    if (isEdit && detailData) {
      setAllocationType(detailData.allocationType);
      if (detailData.sourceWarehouse?.id) {
        setSelectedWarehouseId(detailData.sourceWarehouse.id);
      }
    }
  }, [isEdit, detailData]);

  // ── Default values ──
  const defaultValues = useMemo((): CreateResourceAllocationForm => {
    if (isEdit && detailData) {
      return {
        allocationType: detailData.allocationType as 'unit' | 'quantity',
        warehouseId: detailData.sourceWarehouse?.id ?? '',
        resourceUnitId: detailData.resourceUnit?.id ?? '',
        itemCatalogId: detailData.itemCatalog?.id ?? '',
        quantity: detailData.quantity ?? undefined,
        allocationFromDate: detailData.allocatedFromDate,
        allocationToDate: detailData.allocatedToDate,
        notes: detailData.notes ?? '',
      };
    }
    return {
      allocationType: 'unit' as const,
      warehouseId: '',
      resourceUnitId: '',
      itemCatalogId: '',
      quantity: undefined,
      allocationFromDate: '',
      allocationToDate: '',
      notes: '',
    };
  }, [isEdit, detailData]);

  // ── Form fields ──
  const fields = useMemo(
    () =>
      buildFormFields(
        allocationType,
        selectedWarehouseId,
        warehouseOptions,
        resourceUnitOptions,
        itemOptions,
        warehousesLoading,
        resourceUnitsLoading,
        itemsLoading,
        warehousesHasMore,
        resourceUnitsHasMore,
        itemsHasMore,
        warehousesLoadMore,
        resourceUnitsLoadMore,
        itemsLoadMore,
        setIsValid,
        setSelectedWarehouseId
      ),
    [
      allocationType,
      selectedWarehouseId,
      warehouseOptions,
      resourceUnitOptions,
      itemOptions,
      warehousesLoading,
      resourceUnitsLoading,
      itemsLoading,
      warehousesHasMore,
      resourceUnitsHasMore,
      itemsHasMore,
      warehousesLoadMore,
      resourceUnitsLoadMore,
      itemsLoadMore,
    ]
  );

  // ── Submit handler ──
  const handleSubmit = useCallback(
    (formValues: CreateResourceAllocationForm) => {
      const basePayload: CreateResourceAllocationPayload = {
        allocationType: formValues.allocationType,
        warehouseId: formValues.warehouseId,
        resourceUnitId: formValues.resourceUnitId || undefined,
        itemCatalogId: formValues.itemCatalogId || undefined,
        quantity: formValues.quantity || undefined,
        allocationFromDate: formValues.allocationFromDate,
        allocationToDate: formValues.allocationToDate,
        notes: formValues.notes || undefined,
      };

      if (isEdit && editId) {
        const payload = basePayload as UpdateResourceAllocationPayload;
        updateMutate(payload, {
          onSuccess: () => {
            onClose();
            onSuccess?.();
          },
        });
      } else {
        createMutate(basePayload, {
          onSuccess: () => {
            onClose();
            onSuccess?.();
          },
        });
      }
    },
    [isEdit, editId, updateMutate, createMutate, onClose, onSuccess]
  );

  // ── Loading detail in edit mode ──
  const showLoader = isEdit && detailLoading;

  if (showLoader) {
    return (
      <Drawer open={open} onOpenChange={(v) => !v && onClose()} direction="right">
        <DrawerContent className="w-lg max-w-lg inset-y-0! right-0! left-auto! mt-0! rounded-l-xl! rounded-r-none! border-l! flex flex-col">
          <DrawerHeader className="pb-2">
            <div className="flex items-center justify-between">
              <DrawerTitle className="text-2xl font-semibold text-[#0A0A0A]">
                {isEdit ? 'Edit Resource Allocation' : 'Allocate Resource'}
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
    <Drawer open={open} onOpenChange={(v) => !v && onClose()} direction="right">
      <DrawerContent className="w-lg max-w-lg inset-y-0! right-0! left-auto! mt-0! rounded-l-xl! rounded-r-none! border-l! flex flex-col">
        <DrawerHeader className="pb-2">
          <div className="flex items-center justify-between">
            <DrawerTitle className="text-2xl font-semibold text-[#0A0A0A]">
              {isEdit ? 'Edit Resource Allocation' : 'Allocate Resource'}
            </DrawerTitle>
            <DrawerClose asChild>
              <Button variant="ghost" size="xs" className="h-6 w-6 p-0" aria-label="Close">
                <span className="text-lg leading-none">&times;</span>
              </Button>
            </DrawerClose>
          </div>
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto">
          <FormGenerator<CreateResourceAllocationForm>
            id="form-resource-allocation"
            fields={fields}
            defaultValues={defaultValues}
            schema={createResourceAllocationSchema}
            onSubmit={handleSubmit}
            className="px-6 py-4"
            mode="onChange"
          />
        </div>

        <DrawerFooter className="flex-col gap-3 border-t pt-4">
          <Button
            type="submit"
            form="form-resource-allocation"
            disabled={!isValid || isSaving}
            isLoading={isSaving}
          >
            {isSaving ? 'Menyimpan...' : 'Simpan'}
          </Button>
          <DrawerClose asChild>
            <Button variant="outline" disabled={isSaving}>
              Batal
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
