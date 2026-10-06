'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { X } from 'lucide-react';
import { useEffect } from 'react';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import { z } from 'zod';

import { AsyncSelect, Button } from '@/components/atoms';
import { Label } from '@/components/ui/label';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/shared/components/ui/drawer';
import { MANPOWER_LABELS } from '../constants';
import { useUpdateEmployee } from '../hooks/use-update-employee';
import { useWorkPlacementEnums } from '../hooks/use-work-placement-enums';
import type { Employee } from '../types';

const labels = MANPOWER_LABELS.OTHER_SETTINGS_FORM;
const FORM_ID = 'other-settings-form';

const otherSettingsSchema = z.object({
  workPlacement: z.string().nullable().optional(),
  contractType: z.string().nullable().optional(),
});

type OtherSettingsFormInput = z.infer<typeof otherSettingsSchema>;

interface EmployeeOtherSettingsFormProps {
  open: boolean;
  onClose: () => void;
  employee: Employee;
  onSuccess?: () => void;
  companyId?: string;
}

export function EmployeeOtherSettingsForm({
  open,
  onClose,
  employee,
  onSuccess,
  companyId,
}: EmployeeOtherSettingsFormProps) {
  const { workPlacements, contractTypes, isLoading: enumsLoading } = useWorkPlacementEnums();
  const { mutate: updateEmployee, isPending: isSubmitting } = useUpdateEmployee(
    employee.id,
    companyId
  );

  const isLoading = enumsLoading || isSubmitting;

  const form = useForm<OtherSettingsFormInput>({
    resolver: zodResolver(otherSettingsSchema),
    defaultValues: {
      workPlacement: employee.workPlacement ?? null,
      contractType: employee.contractType ?? null,
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        workPlacement: employee.workPlacement ?? null,
        contractType: employee.contractType ?? null,
      });
    }
  }, [open, employee, form]);

  const handleSubmit = form.handleSubmit((data) => {
    updateEmployee(data, {
      onSuccess: () => {
        onSuccess?.();
        onClose();
      },
    });
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
            <DrawerTitle className="text-lg font-semibold">{labels.TITLE}</DrawerTitle>
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
              <Label htmlFor="workPlacement">{labels.FIELDS.ASSIGNMENT}</Label>
              <Controller
                name="workPlacement"
                control={form.control}
                render={({ field }) => (
                  <AsyncSelect
                    id="workPlacement"
                    value={field.value ?? null}
                    onChange={(v) => field.onChange(v ?? null)}
                    options={workPlacements}
                    placeholder={labels.PLACEHOLDERS.ASSIGNMENT}
                    isDisabled={isLoading}
                    isSearchable={false}
                    isClearable
                  />
                )}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="contractType">{labels.FIELDS.CONTRACT_TYPE}</Label>
              <Controller
                name="contractType"
                control={form.control}
                render={({ field }) => (
                  <AsyncSelect
                    id="contractType"
                    value={field.value ?? null}
                    onChange={(v) => field.onChange(v ?? null)}
                    options={contractTypes}
                    placeholder={labels.PLACEHOLDERS.CONTRACT_TYPE}
                    isDisabled={isLoading}
                    isSearchable={false}
                    isClearable
                  />
                )}
              />
            </div>
          </form>
        </FormProvider>

        <DrawerFooter className="border-t px-4 py-4">
          <Button type="submit" form={FORM_ID} disabled={isLoading}>
            {labels.BUTTONS.SAVE}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
            className="w-full"
          >
            {labels.BUTTONS.CANCEL}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
