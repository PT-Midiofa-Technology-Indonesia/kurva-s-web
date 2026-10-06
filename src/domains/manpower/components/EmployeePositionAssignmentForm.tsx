'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Trash2, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { FormProvider, useFieldArray, useForm, useFormContext } from 'react-hook-form';
import { AsyncSelect, Button } from '@/components/atoms';
import { Alert, AlertDescription, AlertTitle } from '@/components/molecules/Alert';
import { useCompaniesInfinite } from '@/domains/company';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/shared/components/ui/drawer';
import { Label } from '@/shared/components/ui/label';
import { useDebounce } from '@/shared/hooks/use-debounce';
import { MANPOWER_LABELS } from '../constants';
import { useCompanyPositionsInfinite } from '../hooks/use-company-positions-infinite';
import { useCreateEmployeePositionAssignments } from '../hooks/use-create-employee-position-assignments';
import {
  type PositionAssignmentFormInput,
  positionAssignmentSchema,
} from '../schemas/position-assignment-form';
import type { PositionAssignment } from '../types';

const FORM_ID = 'position-assignment-form';
const labels = MANPOWER_LABELS.POSITION_ASSIGNMENT_FORM;

interface AssignmentRowProps {
  index: number;
  fieldId: string;
  canRemove: boolean;
  onRemove: (index: number) => void;
  companyOptions: { value: string; label: string }[];
  isLoadingCompanies: boolean;
  onCompanyScrollToBottom: () => void;
  onCompanySearchChange: (v: string) => void;
}

function AssignmentRow({
  index,
  fieldId,
  canRemove,
  onRemove,
  companyOptions,
  isLoadingCompanies,
  onCompanyScrollToBottom,
  onCompanySearchChange,
}: AssignmentRowProps) {
  const form = useFormContext<PositionAssignmentFormInput>();
  const companyId = form.watch(`assignments.${index}.companyId`);
  const companyPositionId = form.watch(`assignments.${index}.companyPositionId`);

  const {
    positionOptions,
    isLoading: isLoadingPositions,
    hasMore: hasMorePositions,
    isFetchingNextPage: isFetchingMorePositions,
    loadMore: loadMorePositions,
  } = useCompanyPositionsInfinite({
    enabled: !!companyId,
    isActive: true,
    companyId: companyId || undefined,
  });

  const handlePositionScrollToBottom = useCallback(() => {
    if (hasMorePositions && !isFetchingMorePositions) loadMorePositions();
  }, [hasMorePositions, isFetchingMorePositions, loadMorePositions]);

  return (
    <div key={fieldId} className="rounded-lg border bg-white p-4 space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-900">{labels.ASSIGN_LABEL}</span>
        {canRemove && (
          <Button variant="ghost" size="xs" onClick={() => onRemove(index)} className="h-6 w-6 p-0">
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
        )}
      </div>

      <div className="space-y-3">
        <div>
          <Label className="text-xs font-medium text-slate-700">
            {labels.COMPANY_LABEL}
            <span className="text-red-500 ml-0.5">*</span>
          </Label>
          <AsyncSelect
            isLoading={isLoadingCompanies}
            options={companyOptions}
            value={companyId || null}
            onChange={(value) => {
              form.setValue(
                `assignments.${index}.companyId`,
                typeof value === 'string' ? value : ''
              );
              form.setValue(`assignments.${index}.companyPositionId`, '');
            }}
            placeholder={labels.COMPANY_PLACEHOLDER}
            className="w-full"
            onScrollToBottom={onCompanyScrollToBottom}
            onSearchChange={onCompanySearchChange}
          />
          {form.formState.errors.assignments?.[index]?.companyId && (
            <p className="text-xs text-red-500 mt-1">
              {form.formState.errors.assignments[index]?.companyId?.message}
            </p>
          )}
        </div>

        <div>
          <Label className="text-xs font-medium text-slate-700">
            {labels.POSITION_LABEL}
            <span className="text-red-500 ml-0.5">*</span>
          </Label>
          <AsyncSelect
            isLoading={isLoadingPositions}
            isDisabled={!companyId}
            options={positionOptions}
            value={companyPositionId || null}
            onChange={(value) => {
              form.setValue(
                `assignments.${index}.companyPositionId`,
                typeof value === 'string' ? value : ''
              );
            }}
            placeholder={labels.POSITION_PLACEHOLDER}
            className="w-full"
            onScrollToBottom={handlePositionScrollToBottom}
          />
          {form.formState.errors.assignments?.[index]?.companyPositionId && (
            <p className="text-xs text-red-500 mt-1">
              {form.formState.errors.assignments[index]?.companyPositionId?.message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

interface EmployeePositionAssignmentFormProps {
  open: boolean;
  onClose: () => void;
  employeeId: string;
  existingAssignments?: PositionAssignment[];
  onSuccess?: () => void;
  companyId?: string;
}

export function EmployeePositionAssignmentForm({
  open,
  onClose,
  employeeId,
  existingAssignments = [],
  onSuccess,
  companyId,
}: EmployeePositionAssignmentFormProps) {
  const { mutate: saveAssignments, isPending } = useCreateEmployeePositionAssignments(
    employeeId,
    companyId
  );

  const [companySearch, setCompanySearch] = useState('');
  const debouncedCompanySearch = useDebounce(companySearch, 300);
  const [isDuplicateAlertDismissed, setIsDuplicateAlertDismissed] = useState(true);

  const {
    options: companyOptions,
    isLoading: isLoadingCompanies,
    hasMore: hasMoreCompanies,
    isFetchingNextPage: isFetchingMoreCompanies,
    loadMore: loadMoreCompanies,
  } = useCompaniesInfinite({ enabled: open, search: debouncedCompanySearch, isActive: true });

  const handleCompanyScrollToBottom = useCallback(() => {
    if (hasMoreCompanies && !isFetchingMoreCompanies) loadMoreCompanies();
  }, [hasMoreCompanies, isFetchingMoreCompanies, loadMoreCompanies]);

  const handleCompanySearchChange = useCallback((v: string) => setCompanySearch(v), []);

  const form = useForm<PositionAssignmentFormInput>({
    resolver: zodResolver(positionAssignmentSchema),
    defaultValues: {
      assignments: [{ companyId: '', companyPositionId: '' }],
    },
    mode: 'onBlur',
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'assignments',
  });

  const watchedAssignments = form.watch('assignments');

  const { reset } = form;
  useEffect(() => {
    if (!open) return;
    reset({
      assignments:
        existingAssignments.length > 0
          ? existingAssignments.map((a) => ({
              companyId: a.companyId,
              companyPositionId: a.companyPositionId,
            }))
          : [{ companyId: '', companyPositionId: '' }],
    });
  }, [open, existingAssignments, reset]);

  const handleSubmit = form.handleSubmit((data) => {
    const validAssignments = data.assignments.filter((a) => a.companyPositionId && a.companyId);
    if (validAssignments.length === 0) return;

    const uniquePairs = new Set(
      validAssignments.map((a) => `${a.companyId}|${a.companyPositionId}`)
    );
    if (uniquePairs.size !== validAssignments.length) {
      setIsDuplicateAlertDismissed(false);
      return;
    }

    saveAssignments(
      { companyPositionId: validAssignments.map((a) => a.companyPositionId) },
      {
        onSuccess: () => {
          form.reset();
          onClose();
          onSuccess?.();
        },
      }
    );
  });

  const handleClose = () => {
    form.reset();
    onClose();
  };

  const showDuplicateAlert = !isDuplicateAlertDismissed;

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

        {showDuplicateAlert && (
          <div className="px-4 pt-4">
            <Alert
              variant="destructive"
              showDismiss
              onDismiss={() => setIsDuplicateAlertDismissed(true)}
            >
              <AlertTitle className="font-semibold">Duplikat Ditemukan</AlertTitle>
              <AlertDescription>
                Tidak dapat menambahkan company position yang sama. Silakan pilih kombinasi company
                dan job position yang berbeda.
              </AlertDescription>
            </Alert>
          </div>
        )}

        <FormProvider {...form}>
          <form
            id={FORM_ID}
            onSubmit={handleSubmit}
            className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-4"
          >
            {fields.map((field, index) => (
              <AssignmentRow
                key={field.id}
                index={index}
                fieldId={field.id}
                canRemove={fields.length > 1}
                onRemove={remove}
                companyOptions={companyOptions}
                isLoadingCompanies={isLoadingCompanies}
                onCompanyScrollToBottom={handleCompanyScrollToBottom}
                onCompanySearchChange={handleCompanySearchChange}
              />
            ))}

            <div className="flex justify-end">
              <Button
                variant="default"
                onClick={() => append({ companyId: '', companyPositionId: '' })}
                type="button"
                className="bg-slate-900 hover:bg-slate-800"
              >
                {labels.ADD_ASSIGNMENT_BUTTON}
              </Button>
            </div>
          </form>
        </FormProvider>

        <DrawerFooter className="border-t px-4 py-4">
          <Button
            type="submit"
            form={FORM_ID}
            disabled={isPending || watchedAssignments.every((a) => !a.companyPositionId)}
          >
            {isPending ? labels.SAVING : labels.SAVE_BUTTON}
          </Button>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isPending}
            className="w-full"
            type="button"
          >
            {labels.CANCEL_BUTTON}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
