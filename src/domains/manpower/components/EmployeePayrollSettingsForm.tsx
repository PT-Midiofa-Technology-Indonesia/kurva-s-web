'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import { z } from 'zod';

import { AsyncSelect, Button, Input } from '@/components/atoms';
import { Label } from '@/components/ui/label';
import { useEmployeeGradesInfinite } from '@/domains/employee-grade';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/shared/components/ui/drawer';
import { useDebounce } from '@/shared/hooks/use-debounce';
import { useSalaryTypes } from '@/shared/hooks/use-enums';
import { MANPOWER_LABELS } from '../constants';
import { useUpdateEmployeePayrollSettings } from '../hooks/use-update-employee-payroll-settings';
import type { Employee } from '../types';

const labels = MANPOWER_LABELS.PAYROLL_SETTINGS_FORM;
const FORM_ID = 'payroll-settings-form';

const payrollSettingsSchema = z.object({
  gradeId: z.string().nullable().optional(),
  salaryType: z.string().nullable().optional(),
  bankName: z.string().trim().nullable().optional(),
  accountNumber: z.string().trim().nullable().optional(),
  accountName: z.string().trim().nullable().optional(),
});

type PayrollSettingsFormInput = z.infer<typeof payrollSettingsSchema>;

interface EmployeePayrollSettingsFormProps {
  open: boolean;
  onClose: () => void;
  employee: Employee;
  onSuccess?: () => void;
  companyId?: string;
}

export function EmployeePayrollSettingsForm({
  open,
  onClose,
  employee,
  onSuccess,
  companyId,
}: EmployeePayrollSettingsFormProps) {
  const [gradeSearch, setGradeSearch] = useState('');
  const debouncedGradeSearch = useDebounce(gradeSearch, 300);

  const {
    options: gradeOptions,
    isLoading: isLoadingGrades,
    hasMore: hasMoreGrades,
    isFetchingNextPage: isFetchingMoreGrades,
    loadMore: loadMoreGrades,
  } = useEmployeeGradesInfinite({ enabled: open, search: debouncedGradeSearch, isActive: true });

  const handleGradeScrollToBottom = useCallback(() => {
    if (hasMoreGrades && !isFetchingMoreGrades) loadMoreGrades();
  }, [hasMoreGrades, isFetchingMoreGrades, loadMoreGrades]);

  const handleGradeSearchChange = useCallback((v: string) => setGradeSearch(v), []);

  const { data: salaryTypes = [], isLoading: salaryTypesLoading } = useSalaryTypes();
  const { mutate: updatePayrollSettings, isPending: isSubmitting } =
    useUpdateEmployeePayrollSettings(employee.id, companyId);

  const isLoading = salaryTypesLoading || isSubmitting;

  const form = useForm<PayrollSettingsFormInput>({
    resolver: zodResolver(payrollSettingsSchema),
    defaultValues: {
      gradeId: employee.employeeGradeId ?? employee.gradeId ?? null,
      salaryType: employee.salaryType ?? null,
      bankName: employee.bankName ?? '',
      accountNumber: employee.accountNumber ?? '',
      accountName: employee.accountName ?? '',
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        gradeId: employee.employeeGradeId ?? employee.gradeId ?? null,
        salaryType: employee.salaryType ?? null,
        bankName: employee.bankName ?? '',
        accountNumber: employee.accountNumber ?? '',
        accountName: employee.accountName ?? '',
      });
    }
  }, [open, employee, form]);

  const handleSubmit = form.handleSubmit((data) => {
    updatePayrollSettings(
      {
        gradeId: data.gradeId ?? null,
        salaryType: (data.salaryType as 'monthly' | 'daily' | null) ?? null,
        bankName: data.bankName?.trim() || null,
        accountNumber: data.accountNumber?.trim() || null,
        accountName: data.accountName?.trim() || null,
      },
      {
        onSuccess: () => {
          onSuccess?.();
          onClose();
        },
      }
    );
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
              <Label htmlFor="gradeId">{labels.FIELDS.GRADE}</Label>
              <Controller
                name="gradeId"
                control={form.control}
                render={({ field }) => (
                  <AsyncSelect
                    id="gradeId"
                    value={field.value ?? null}
                    onChange={(v) => field.onChange(v ?? null)}
                    options={gradeOptions}
                    placeholder={labels.PLACEHOLDERS.GRADE}
                    isDisabled={isLoading}
                    isLoading={isLoadingGrades}
                    isClearable
                    onScrollToBottom={handleGradeScrollToBottom}
                    onSearchChange={handleGradeSearchChange}
                  />
                )}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="salaryType">{labels.FIELDS.SALARY_TYPE}</Label>
              <Controller
                name="salaryType"
                control={form.control}
                render={({ field }) => (
                  <AsyncSelect
                    id="salaryType"
                    value={field.value ?? null}
                    onChange={(v) => field.onChange(v ?? null)}
                    options={salaryTypes}
                    placeholder={labels.PLACEHOLDERS.SALARY_TYPE}
                    isDisabled={isLoading}
                    isSearchable={false}
                    isClearable
                  />
                )}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="bankName">{labels.FIELDS.BANK_NAME}</Label>
              <Controller
                name="bankName"
                control={form.control}
                render={({ field }) => (
                  <Input
                    {...field}
                    id="bankName"
                    value={field.value ?? ''}
                    placeholder={labels.PLACEHOLDERS.BANK_NAME}
                    disabled={isLoading}
                  />
                )}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="accountNumber">{labels.FIELDS.ACCOUNT_NUMBER}</Label>
              <Controller
                name="accountNumber"
                control={form.control}
                render={({ field }) => (
                  <Input
                    {...field}
                    id="accountNumber"
                    value={field.value ?? ''}
                    placeholder={labels.PLACEHOLDERS.ACCOUNT_NUMBER}
                    disabled={isLoading}
                  />
                )}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="accountName">{labels.FIELDS.ACCOUNT_NAME}</Label>
              <Controller
                name="accountName"
                control={form.control}
                render={({ field }) => (
                  <Input
                    {...field}
                    id="accountName"
                    value={field.value ?? ''}
                    placeholder={labels.PLACEHOLDERS.ACCOUNT_NAME}
                    disabled={isLoading}
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
