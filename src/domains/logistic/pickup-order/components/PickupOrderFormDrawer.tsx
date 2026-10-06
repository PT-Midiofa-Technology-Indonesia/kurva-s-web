'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { Loader2 } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Controller,
  FormProvider,
  type Path,
  useForm,
  useFormContext,
  useWatch,
} from 'react-hook-form';
import { applyFormApiErrors } from '@/domains/logistic/utils/apply-form-errors';
import { useWarehousesInfinite } from '@/domains/warehouse';
import { AsyncSelect, Button, Input, type SelectOption } from '@/shared/components/atoms';
import { DatePicker } from '@/shared/components/molecules/DatePicker/DatePicker';
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
import { usePickupOrderTypes } from '@/shared/hooks/use-enums';
import { ApiErrorClass, getErrorMessage } from '@/shared/lib/api-error';
import { toast } from '@/shared/lib/toast';
import { PICKUP_ORDER_LABELS } from '../constants';
import {
  useCreatePickupOrder,
  usePickupOrderAvailableEmployeesQuery,
  usePickupOrderSelectableDeliveryOrdersQuery,
} from '../hooks';
import { type PickupOrderFormValues, pickupOrderFormSchema } from '../schemas';
import type { PickupOrderSelectableDeliveryOrder } from '../types';

interface PickupOrderFormDrawerProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  companyId: string | null;
}

function FieldError({ name }: { name: Path<PickupOrderFormValues> | `deliveryOrderIds` }) {
  const { getFieldState, formState } = useFormContext<PickupOrderFormValues>();
  const error = getFieldState(name as Path<PickupOrderFormValues>, formState).error;
  if (!error?.message) return null;
  return <p className="text-xs text-destructive">{error.message}</p>;
}

function toDeliveryOrderOption(order: PickupOrderSelectableDeliveryOrder): SelectOption {
  return {
    value: order.id,
    label: `${order.code} - ${order.sourceWarehouseName} → ${order.destinationWarehouseName}`,
  };
}

function hasDeliveryOrderItems(order: PickupOrderSelectableDeliveryOrder) {
  if (!order.sourceWarehouseName || !order.destinationWarehouseName) return false;
  if (!('items' in order)) return true;
  return Array.isArray(order.items) && order.items.length > 0;
}

export function PickupOrderFormDrawer({
  open,
  onClose,
  onSuccess,
  companyId,
}: PickupOrderFormDrawerProps) {
  const { mutateAsync: createPickupOrder, isPending } = useCreatePickupOrder();
  const { data: typeOptions = [] } = usePickupOrderTypes();
  const [warehouseSearch, setWarehouseSearch] = useState('');
  const [employeeSearch, setEmployeeSearch] = useState('');
  const [deliverySearch, setDeliverySearch] = useState('');
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
    search: warehouseSearch,
  });
  const prevWarehouseRef = useRef<string>('');

  const form = useForm<PickupOrderFormValues>({
    resolver: zodResolver(pickupOrderFormSchema) as any,
    defaultValues: {
      type: 'pickup',
      warehouseId: '',
      assignedToEmployeeId: '',
      pickupLocation: '',
      scheduledDate: '',
      deliveryOrderIds: [],
      notes: '',
    },
    mode: 'onChange',
  });

  const {
    control,
    handleSubmit,
    register,
    reset,
    setValue,
    formState: { isSubmitting },
  } = form;

  const warehouseId = useWatch({ control, name: 'warehouseId' });

  const { data: employeeOptions = [] } = usePickupOrderAvailableEmployeesQuery(
    warehouseId,
    { companyId: companyId ?? undefined, search: employeeSearch },
    open && !!warehouseId
  );
  const { data: deliveryOrderOptions = [] } = usePickupOrderSelectableDeliveryOrdersQuery(
    { companyId: companyId ?? undefined, search: deliverySearch },
    open
  );

  const warehouseSelectOptions = useMemo(() => warehouseOptions.slice(), [warehouseOptions]);
  const employeeSelectOptions = useMemo(
    () => employeeOptions.map((employee) => ({ value: employee.id, label: employee.name })),
    [employeeOptions]
  );
  const deliveryOrderSelectOptions = useMemo(
    () => deliveryOrderOptions.filter(hasDeliveryOrderItems).map(toDeliveryOrderOption),
    [deliveryOrderOptions]
  );

  useEffect(() => {
    if (!open) {
      setWarehouseSearch('');
      setEmployeeSearch('');
      setDeliverySearch('');
      reset({
        type: 'pickup',
        warehouseId: '',
        assignedToEmployeeId: '',
        pickupLocation: '',
        scheduledDate: '',
        deliveryOrderIds: [],
        notes: '',
      });
    }
  }, [open, reset]);

  useEffect(() => {
    if (prevWarehouseRef.current && prevWarehouseRef.current !== warehouseId) {
      setValue('assignedToEmployeeId', '');
      setEmployeeSearch('');
    }
    prevWarehouseRef.current = warehouseId;
  }, [setValue, warehouseId]);

  const onSubmit = handleSubmit(async (values) => {
    if (!companyId) return;

    try {
      await createPickupOrder({
        payload: {
          type: values.type,
          warehouseId: values.warehouseId,
          assignedToEmployeeId: values.assignedToEmployeeId,
          pickupLocation: values.pickupLocation,
          scheduledDate: values.scheduledDate,
          deliveryOrderIds: values.deliveryOrderIds,
          notes: values.notes || null,
        },
        companyId,
      });
      onClose();
      onSuccess?.();
    } catch (error) {
      if (applyFormApiErrors(error, form.setError)) return;
      if (error instanceof ApiErrorClass) {
        toast.error({ title: error.message });
        return;
      }
      toast.error({ title: getErrorMessage(error) });
    }
  });

  const isSaving = isPending || isSubmitting;

  return (
    <Drawer open={open} onOpenChange={(value) => !value && onClose()} direction="right">
      <DrawerContent className="w-xl max-w-xl inset-y-0! right-0! left-auto! mt-0! rounded-l-xl! rounded-r-none! border-l! flex flex-col">
        <DrawerHeader className="pb-2">
          <div className="flex items-center justify-between">
            <DrawerTitle className="text-2xl font-semibold text-[#0A0A0A]">
              {PICKUP_ORDER_LABELS.FORM.CREATE_TITLE}
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
            <form id="pickup-order-form" onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-slate-700">
                  {PICKUP_ORDER_LABELS.FORM.TYPE}
                </Label>
                <Controller
                  control={control}
                  name="type"
                  render={({ field }) => (
                    <AsyncSelect
                      options={typeOptions}
                      value={field.value}
                      onChange={(selected) => {
                        const value = Array.isArray(selected) ? selected[0] : selected;
                        field.onChange((value as string) || 'pickup');
                      }}
                      isSearchable={false}
                      isClearable={false}
                      placeholder="Pilih type"
                    />
                  )}
                />
                <FieldError name="type" />
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-slate-700">
                  {PICKUP_ORDER_LABELS.FORM.WAREHOUSE}
                </Label>
                <Controller
                  control={control}
                  name="warehouseId"
                  render={({ field }) => (
                    <AsyncSelect
                      options={warehouseSelectOptions}
                      value={field.value}
                      onChange={(selected) => {
                        const value = Array.isArray(selected) ? selected[0] : selected;
                        field.onChange(value || '');
                      }}
                      isSearchable
                      onSearchChange={setWarehouseSearch}
                      placeholder="Pilih warehouse"
                      isLoading={warehouseLoading}
                      onScrollToBottom={warehouseHasMore ? () => warehouseLoadMore() : undefined}
                    />
                  )}
                />
                <FieldError name="warehouseId" />
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-slate-700">
                  {PICKUP_ORDER_LABELS.FORM.EMPLOYEE}
                </Label>
                <Controller
                  control={control}
                  name="assignedToEmployeeId"
                  render={({ field }) => (
                    <AsyncSelect
                      options={employeeSelectOptions}
                      value={field.value}
                      onChange={(selected) => {
                        const value = Array.isArray(selected) ? selected[0] : selected;
                        field.onChange(value || '');
                      }}
                      isSearchable
                      onSearchChange={setEmployeeSearch}
                      placeholder={warehouseId ? 'Pilih PIC' : 'Pilih warehouse dulu'}
                      isDisabled={!warehouseId}
                    />
                  )}
                />
                <FieldError name="assignedToEmployeeId" />
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-slate-700">
                  {PICKUP_ORDER_LABELS.FORM.PICKUP_LOCATION}
                </Label>
                <Input
                  {...register('pickupLocation')}
                  placeholder="Masukkan pickup location"
                  className="h-10"
                />
                <FieldError name="pickupLocation" />
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-slate-700">
                  {PICKUP_ORDER_LABELS.FORM.SCHEDULED_DATE}
                </Label>
                <Controller
                  control={control}
                  name="scheduledDate"
                  render={({ field }) => (
                    <DatePicker
                      value={field.value ? new Date(`${field.value}T00:00:00`) : null}
                      minDate={new Date()}
                      onChange={(selected) => {
                        if (!selected || Array.isArray(selected) || !(selected instanceof Date)) {
                          field.onChange('');
                          return;
                        }
                        field.onChange(format(selected, 'yyyy-MM-dd'));
                      }}
                      placeholder="Pilih tanggal"
                    />
                  )}
                />
                <FieldError name="scheduledDate" />
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-slate-700">
                  {PICKUP_ORDER_LABELS.FORM.DELIVERY_ORDERS}
                </Label>
                <Controller
                  control={control}
                  name="deliveryOrderIds"
                  render={({ field }) => (
                    <AsyncSelect
                      options={deliveryOrderSelectOptions}
                      value={field.value}
                      onChange={(selected) => {
                        if (Array.isArray(selected)) {
                          field.onChange(selected);
                          return;
                        }
                        field.onChange(selected ? [selected] : []);
                      }}
                      isSearchable
                      isMulti
                      onSearchChange={setDeliverySearch}
                      placeholder="Pilih delivery order"
                    />
                  )}
                />
                <FieldError name="deliveryOrderIds" />
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-slate-700">
                  {PICKUP_ORDER_LABELS.FORM.NOTES}
                </Label>
                <Textarea rows={4} placeholder="Catatan tambahan" {...register('notes')} />
                <FieldError name="notes" />
              </div>
            </form>
          </FormProvider>
        </div>

        <DrawerFooter className="px-4 py-4 border-t flex flex-col gap-3">
          <Button
            form="pickup-order-form"
            type="submit"
            className="w-full bg-teal-600 hover:bg-teal-700 text-white"
            disabled={isSaving}
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              PICKUP_ORDER_LABELS.FORM.SAVE
            )}
          </Button>
          <Button variant="outline" onClick={onClose} className="w-full">
            {PICKUP_ORDER_LABELS.FORM.CANCEL}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
