'use client';

import { Loader2 } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { useItemCatalogsInfinite } from '@/domains/item-master';
import { useWarehousesInfinite } from '@/domains/warehouse';
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
import { RESOURCE_UNIT_LABELS, RESOURCE_UNIT_STATUS_OPTIONS } from '../constants';
import { useCreateResourceUnit } from '../hooks/use-create-resource-unit';
import { useResourceUnit } from '../hooks/use-resource-unit';
import { useUpdateResourceUnit } from '../hooks/use-update-resource-unit';
import { type CreateResourceUnitForm, createResourceUnitSchema } from '../schemas';
import type { CreateResourceUnitPayload, UpdateResourceUnitPayload } from '../types';

interface ResourceUnitFormDrawerProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  editId: string | null;
  companyId: string | null;
}

function FormValidityTracker({ onValidChange }: { onValidChange: (v: boolean) => void }) {
  const { formState } = useFormContext<CreateResourceUnitForm>();
  useEffect(() => {
    onValidChange(formState.isValid);
  }, [formState.isValid, onValidChange]);
  return null;
}

function buildFormFields(
  itemOptions: SelectOption[],
  warehouseOptions: SelectOption[],
  isItemsLoading: boolean,
  isWarehousesLoading: boolean,
  itemsHasMore: boolean,
  warehousesHasMore: boolean,
  itemsLoadMore: () => void,
  warehousesLoadMore: () => void,
  onValidChange: (v: boolean) => void,
  popoverContainer: HTMLElement | null
): FormFieldConfig<CreateResourceUnitForm>[] {
  return [
    {
      type: 'custom',
      content: <FormValidityTracker onValidChange={onValidChange} />,
      colSpan: 1,
      className: 'hidden',
    },
    {
      name: 'itemCatalogId',
      type: 'select',
      label: RESOURCE_UNIT_LABELS.CREATE.FIELDS.ITEM_CATALOG,
      placeholder: 'Pilih Item Catalog',
      required: true,
      options: itemOptions,
      isSearchable: true,
      isLoading: isItemsLoading,
      onScrollToBottom: itemsHasMore ? itemsLoadMore : undefined,
      popoverContainer,
      colSpan: 12,
    },
    {
      name: 'warehouseId',
      type: 'select',
      label: RESOURCE_UNIT_LABELS.CREATE.FIELDS.WAREHOUSE,
      placeholder: 'Pilih Warehouse',
      required: true,
      options: warehouseOptions,
      isSearchable: true,
      isLoading: isWarehousesLoading,
      onScrollToBottom: warehousesHasMore ? warehousesLoadMore : undefined,
      popoverContainer,
      colSpan: 12,
    },
    {
      name: 'status',
      type: 'select',
      label: RESOURCE_UNIT_LABELS.CREATE.FIELDS.STATUS,
      required: true,
      options: RESOURCE_UNIT_STATUS_OPTIONS,
      isSearchable: false,
      popoverContainer,
      colSpan: 12,
    },
    {
      name: 'acquisitionDate',
      type: 'date',
      label: RESOURCE_UNIT_LABELS.CREATE.FIELDS.ACQUISITION_DATE,
      required: true,
      colSpan: 12,
    },
    {
      name: 'acquisitionCost',
      type: 'currency',
      label: RESOURCE_UNIT_LABELS.CREATE.FIELDS.ACQUISITION_COST,
      required: true,
      colSpan: 12,
    },
    {
      name: 'notes',
      type: 'textarea',
      label: RESOURCE_UNIT_LABELS.CREATE.FIELDS.NOTES,
      required: false,
      colSpan: 12,
    },
  ];
}

export function ResourceUnitFormDrawer({
  open,
  onClose,
  onSuccess,
  editId,
  companyId,
}: ResourceUnitFormDrawerProps) {
  const isEdit = !!editId;

  // ── Detail fetch for edit mode ──
  const { data: detailData, isLoading: detailLoading } = useResourceUnit(
    editId ?? '',
    companyId ?? undefined
  );

  // ── Mutations ──
  const { mutate: createMutate, isPending: createPending } = useCreateResourceUnit(
    companyId ?? undefined
  );
  const { mutate: updateMutate, isPending: updatePending } = useUpdateResourceUnit(
    editId ?? '',
    companyId ?? undefined
  );
  const isSaving = createPending || updatePending;

  // ── Item catalog options ──
  const {
    options: itemOptions,
    isLoading: itemsLoading,
    hasMore: itemsHasMore,
    loadMore: itemsLoadMore,
  } = useItemCatalogsInfinite({ perPage: 20, enabled: open, isAllocatable: true });

  // ── Warehouse options ──
  const {
    options: warehouseOptions,
    isLoading: warehousesLoading,
    hasMore: warehousesHasMore,
    loadMore: warehousesLoadMore,
  } = useWarehousesInfinite({ perPage: 20, enabled: open });

  // ── Form validity tracker ──
  const [isValid, setIsValid] = useState(false);

  // ── Popover container (fixes dropdown scroll being blocked by Drawer's scroll lock) ──
  const [scrollContainer, setScrollContainer] = useState<HTMLDivElement | null>(null);

  // ── Default values ──
  const defaultValues = useMemo((): CreateResourceUnitForm => {
    if (isEdit && detailData) {
      return {
        itemCatalogId: detailData.itemCatalog?.id ?? '',
        warehouseId: detailData.warehouse?.id ?? '',
        status: detailData.status,
        acquisitionDate: detailData.acquisitionDate,
        acquisitionCost: detailData.acquisitionCost,
        notes: detailData.notes ?? '',
      };
    }
    return {
      itemCatalogId: '',
      warehouseId: '',
      status: 'available',
      acquisitionDate: '',
      acquisitionCost: '',
      notes: '',
    };
  }, [isEdit, detailData]);

  // ── Form fields ──
  const fields = useMemo(
    () =>
      buildFormFields(
        itemOptions,
        warehouseOptions,
        itemsLoading,
        warehousesLoading,
        itemsHasMore,
        warehousesHasMore,
        itemsLoadMore,
        warehousesLoadMore,
        setIsValid,
        scrollContainer
      ),
    [
      itemOptions,
      warehouseOptions,
      itemsLoading,
      warehousesLoading,
      itemsHasMore,
      warehousesHasMore,
      itemsLoadMore,
      warehousesLoadMore,
      scrollContainer,
    ]
  );

  // ── Submit handler ──
  const handleSubmit = useCallback(
    (formValues: CreateResourceUnitForm) => {
      if (!companyId) return;

      const basePayload: CreateResourceUnitPayload = {
        itemCatalogId: formValues.itemCatalogId,
        warehouseId: formValues.warehouseId,
        status: formValues.status,
        acquisitionDate: formValues.acquisitionDate,
        acquisitionCost: formValues.acquisitionCost,
        notes: formValues.notes || undefined,
      };

      if (isEdit && editId) {
        const payload = basePayload as UpdateResourceUnitPayload;
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
    [companyId, isEdit, editId, updateMutate, createMutate, onClose, onSuccess]
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
                {isEdit
                  ? RESOURCE_UNIT_LABELS.EDIT.PAGE_TITLE
                  : RESOURCE_UNIT_LABELS.CREATE.PAGE_TITLE}
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
              {isEdit
                ? RESOURCE_UNIT_LABELS.EDIT.PAGE_TITLE
                : RESOURCE_UNIT_LABELS.CREATE.PAGE_TITLE}
            </DrawerTitle>
            <DrawerClose asChild>
              <Button variant="ghost" size="xs" className="h-6 w-6 p-0" aria-label="Close">
                <span className="text-lg leading-none">&times;</span>
              </Button>
            </DrawerClose>
          </div>
        </DrawerHeader>

        <div ref={setScrollContainer} className="flex-1 overflow-y-auto">
          <FormGenerator<CreateResourceUnitForm>
            id="form-resource-unit"
            fields={fields}
            defaultValues={defaultValues}
            schema={createResourceUnitSchema}
            onSubmit={handleSubmit}
            className="px-6 py-4"
            mode="onChange"
          />
        </div>

        <DrawerFooter className="flex-col gap-3 border-t pt-4">
          <Button
            type="submit"
            form="form-resource-unit"
            disabled={!isValid || isSaving}
            isLoading={isSaving}
          >
            {isSaving
              ? RESOURCE_UNIT_LABELS.CREATE.BUTTONS.SAVING
              : RESOURCE_UNIT_LABELS.CREATE.BUTTONS.SAVE}
          </Button>
          <DrawerClose asChild>
            <Button variant="outline" disabled={isSaving}>
              {RESOURCE_UNIT_LABELS.CREATE.BUTTONS.CANCEL}
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
