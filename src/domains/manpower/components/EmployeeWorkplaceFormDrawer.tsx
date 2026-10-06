'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { X } from 'lucide-react';
import { useEffect } from 'react';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import { z } from 'zod';

import { AsyncSelect, Button, SegmentedControl } from '@/components/atoms';
import { Label } from '@/components/ui/label';
import { useOfficesInfinite } from '@/domains/office/hooks/use-offices-infinite';
import { useWarehouseInfinite } from '@/domains/project-control/hooks/use-warehouse-infinite';
import { DatePicker } from '@/shared/components/molecules';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/shared/components/ui/drawer';
import { useCreateEmployeeWorkplace } from '../hooks/use-create-employee-workplace';
import { useUpdateEmployeeWorkplace } from '../hooks/use-update-employee-workplace';
import type { EmployeeWorkplace } from '../types';

const workplaceFormSchema = z.object({
  workplaceType: z.string().min(1, 'Tipe harus dipilih'),
  workplaceId: z.string().min(1, 'Lokasi harus dipilih'),
  assignedAt: z.string().min(1, 'Tanggal harus diisi'),
  notes: z.string().nullable().optional(),
});

type WorkplaceFormInput = z.infer<typeof workplaceFormSchema>;

interface EmployeeWorkplaceFormDrawerProps {
  open: boolean;
  onClose: () => void;
  employeeId: string;
  companyId?: string;
  editTarget?: EmployeeWorkplace | null;
  onSuccess?: () => void;
}

const FORM_ID = 'employee-workplace-form';

const WORKPLACE_TYPE_OPTIONS = [
  { label: 'Office', value: 'office' },
  { label: 'Warehouse', value: 'warehouse' },
];

export function EmployeeWorkplaceFormDrawer({
  open,
  onClose,
  employeeId,
  companyId,
  editTarget,
  onSuccess,
}: EmployeeWorkplaceFormDrawerProps) {
  const isEdit = !!editTarget;
  const form = useForm<WorkplaceFormInput>({
    resolver: zodResolver(workplaceFormSchema),
    defaultValues: {
      workplaceType: '',
      workplaceId: '',
      assignedAt: '',
      notes: '',
    },
  });

  const selectedType = form.watch('workplaceType');

  const {
    options: officeOptions,
    isLoading: officesLoading,
    hasMore: officesHasMore,
    isFetchingNextPage: officesFetching,
    loadMore: officesLoadMore,
  } = useOfficesInfinite({ perPage: 50, enabled: selectedType === 'office' });

  const {
    options: warehouseOptions,
    isLoading: warehousesLoading,
    hasMore: warehousesHasMore,
    isFetchingNextPage: warehousesFetching,
    loadMore: warehousesLoadMore,
  } = useWarehouseInfinite({ perPage: 50, enabled: selectedType === 'warehouse' });

  const { mutate: createWorkplace, isPending: isCreating } = useCreateEmployeeWorkplace(
    employeeId,
    companyId
  );
  const { mutate: updateWorkplace, isPending: isUpdating } = useUpdateEmployeeWorkplace(
    employeeId,
    editTarget?.id ?? '',
    companyId
  );

  const isSubmitting = isCreating || isUpdating;
  const locationOptions = selectedType === 'warehouse' ? warehouseOptions : officeOptions;
  const locationLoading = selectedType === 'warehouse' ? warehousesLoading : officesLoading;
  const locationHasMore = selectedType === 'warehouse' ? warehousesHasMore : officesHasMore;
  const locationFetching = selectedType === 'warehouse' ? warehousesFetching : officesFetching;
  const locationLoadMore = selectedType === 'warehouse' ? warehousesLoadMore : officesLoadMore;

  useEffect(() => {
    if (open) {
      form.reset({
        workplaceType: editTarget?.workplaceType ?? 'office',
        workplaceId: editTarget?.workplaceId ?? '',
        assignedAt: editTarget?.assignedAt ?? '',
        notes: editTarget?.notes ?? '',
      });
    }
  }, [open, editTarget, form]);

  const handleSubmit = form.handleSubmit((data) => {
    const payload = {
      workplaceType: data.workplaceType,
      workplaceId: data.workplaceId,
      assignedAt: data.assignedAt,
      notes: data.notes || null,
    };

    if (isEdit && editTarget) {
      updateWorkplace(payload, {
        onSuccess: () => {
          onSuccess?.();
          onClose();
        },
      });
    } else {
      createWorkplace(payload, {
        onSuccess: () => {
          onSuccess?.();
          onClose();
        },
      });
    }
  });

  const handleClose = () => {
    form.reset();
    onClose();
  };

  return (
    <Drawer open={open} onOpenChange={(v) => !v && handleClose()} direction="right">
      <DrawerContent className="w-lg max-w-lg inset-y-0! right-0! left-auto! mt-0! rounded-l-xl! rounded-r-none! border-l! flex flex-col">
        <DrawerHeader className="pb-2">
          <div className="flex items-center justify-between">
            <DrawerTitle className="text-lg font-semibold">
              {isEdit ? 'Edit Work Place' : 'Tambah Work Place'}
            </DrawerTitle>
            <DrawerClose asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={handleClose}>
                <X className="h-4 w-4" />
              </Button>
            </DrawerClose>
          </div>
        </DrawerHeader>

        <FormProvider {...form}>
          <form
            id={FORM_ID}
            onSubmit={handleSubmit}
            className="flex flex-1 flex-col gap-5 overflow-y-auto px-4 py-4"
          >
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="workplaceType">Tipe Workplace</Label>
              <Controller
                name="workplaceType"
                control={form.control}
                render={({ field }) => (
                  <SegmentedControl
                    value={field.value}
                    onChange={(v) => {
                      field.onChange(v);
                      form.setValue('workplaceId', '');
                    }}
                    options={WORKPLACE_TYPE_OPTIONS}
                  />
                )}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="workplaceId">
                {selectedType === 'warehouse' ? 'Warehouse' : 'Office'}
              </Label>
              <Controller
                name="workplaceId"
                control={form.control}
                render={({ field, fieldState }) => (
                  <div>
                    <AsyncSelect
                      id="workplaceId"
                      value={field.value || null}
                      onChange={(v) => field.onChange(v ?? '')}
                      options={locationOptions}
                      placeholder={
                        selectedType === 'warehouse' ? 'Pilih warehouse' : 'Pilih office'
                      }
                      isDisabled={!selectedType || locationLoading}
                      isSearchable
                      isLoading={locationFetching}
                      onScrollToBottom={locationHasMore ? locationLoadMore : undefined}
                      onSearchChange={() => {}}
                    />
                    {fieldState.error && (
                      <p className="text-sm text-destructive mt-1">{fieldState.error.message}</p>
                    )}
                  </div>
                )}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="assignedAt">Tanggal Assign</Label>
              <Controller
                name="assignedAt"
                control={form.control}
                render={({ field, fieldState }) => (
                  <div>
                    <DatePicker
                      value={field.value ? new Date(field.value) : undefined}
                      onChange={(date) => {
                        if (date instanceof Date) {
                          field.onChange(formatDateToInput(date));
                        } else {
                          field.onChange('');
                        }
                      }}
                      placeholder="Pilih tanggal assign"
                    />
                    {fieldState.error && (
                      <p className="text-sm text-destructive mt-1">{fieldState.error.message}</p>
                    )}
                  </div>
                )}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="notes">Catatan</Label>
              <Controller
                name="notes"
                control={form.control}
                render={({ field }) => (
                  <input
                    id="notes"
                    type="text"
                    value={field.value ?? ''}
                    onChange={(e) => field.onChange(e.target.value || null)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Catatan (opsional)"
                  />
                )}
              />
            </div>
          </form>
        </FormProvider>

        <DrawerFooter className="border-t px-4 py-4">
          <Button type="submit" form={FORM_ID} disabled={isSubmitting}>
            {isSubmitting ? 'Menyimpan...' : 'Simpan'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
            className="w-full"
          >
            Batal
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

function formatDateToInput(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
