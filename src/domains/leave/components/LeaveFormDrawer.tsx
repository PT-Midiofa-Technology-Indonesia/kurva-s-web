'use client';

import { Loader2 } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { useEmployeesInfinite } from '@/domains/users';
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
import { Label } from '@/shared/components/ui/label';
import { LEAVE_LABELS } from '../constants';
import { useCreateLeave } from '../hooks/use-create-leave';
import { useLeaveDetail } from '../hooks/use-leave-detail';
import { useLeaveTypes } from '../hooks/use-leave-types';
import { useLeaves } from '../hooks/use-leaves';
import { useUpdateLeave } from '../hooks/use-update-leave';
import { type LeaveFormValues, leaveFormSchema } from '../schemas';
import type { CreateLeavePayload, UpdateLeavePayload } from '../types';
import { canEditLeave } from '../utils/leave-permissions';
import {
  getLeaveConflictMessage,
  getLeaveDurationDays,
  getLeaveQuotaExceededMessage,
} from '../utils/leave-quota';

interface LeaveFormDrawerProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  editId: string | null;
  companyId: string | null;
}

function FormValidityTracker({ onValidChange }: { onValidChange: (value: boolean) => void }) {
  const { formState } = useFormContext<LeaveFormValues>();

  useEffect(() => {
    onValidChange(formState.isValid);
  }, [formState.isValid, onValidChange]);

  return null;
}

function LeaveSummaryBox({
  leaveTypeOptions,
  validationMessages,
  currentLeave,
}: {
  leaveTypeOptions: Array<SelectOption & { quota?: number }>;
  validationMessages: Array<string | null>;
  currentLeave?: {
    id: string;
    employeeId: string;
    leaveTypeId: string;
    durationDays: number;
  } | null;
}) {
  const leaveTypeId = useWatch<LeaveFormValues>({ name: 'leaveTypeId' }) as string | undefined;
  const employeeId = useWatch<LeaveFormValues>({ name: 'employeeId' }) as string | undefined;
  const startDate = useWatch<LeaveFormValues>({ name: 'startDate' }) as string | undefined;
  const endDate = useWatch<LeaveFormValues>({ name: 'endDate' }) as string | undefined;

  const duration = useMemo(() => {
    return getLeaveDurationDays(startDate, endDate);
  }, [endDate, startDate]);

  const selectedLeaveType = leaveTypeOptions.find((option) => option.value === leaveTypeId);
  const displayedQuota =
    selectedLeaveType?.quota != null
      ? currentLeave &&
        currentLeave.employeeId === employeeId &&
        currentLeave.leaveTypeId === leaveTypeId
        ? selectedLeaveType.quota + currentLeave.durationDays
        : selectedLeaveType.quota
      : null;

  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 space-y-2">
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-0.5">
          <Label className="text-xs text-slate-500">{LEAVE_LABELS.FORM.DURATION}</Label>
          <p className="text-sm font-medium text-slate-950">
            {duration > 0 ? `${duration} hari` : '-'}
          </p>
        </div>
        <div className="flex flex-col gap-0.5">
          <Label className="text-xs text-slate-500">{LEAVE_LABELS.FORM.QUOTA}</Label>
          <p className="text-sm font-medium text-slate-950">
            {displayedQuota != null ? `${displayedQuota} hari` : '-'}
          </p>
        </div>
      </div>
      <div className="space-y-1">
        {validationMessages
          .filter((message): message is string => !!message)
          .map((message) => (
            <p key={message} className="text-sm font-medium text-destructive">
              {message}
            </p>
          ))}
      </div>
    </div>
  );
}

function LeaveEligibilityTracker({
  companyId,
  onLeaveTypeOptionsChange,
  onConflictErrorChange,
  excludeLeaveId,
}: {
  companyId: string | null;
  onLeaveTypeOptionsChange: (value: Array<SelectOption & { quota?: number }>) => void;
  onConflictErrorChange: (value: string | null) => void;
  excludeLeaveId?: string | null;
}) {
  const employeeId = useWatch<LeaveFormValues>({ name: 'employeeId' }) as string | undefined;
  const startDate = useWatch<LeaveFormValues>({ name: 'startDate' }) as string | undefined;
  const endDate = useWatch<LeaveFormValues>({ name: 'endDate' }) as string | undefined;

  const year = useMemo(() => {
    if (!employeeId) return undefined;
    if (!startDate) return new Date().getFullYear();

    const parsedStart = new Date(`${startDate}T00:00:00`);
    return Number.isNaN(parsedStart.getTime()) ? undefined : parsedStart.getFullYear();
  }, [employeeId, startDate]);

  const leaveTypesParams = useMemo(
    () => ({
      companyId,
      employeeId: employeeId || undefined,
      year,
    }),
    [companyId, employeeId, year]
  );

  const { data: leaveTypesResponse } = useLeaveTypes(leaveTypesParams);
  const leaveTypeOptionsFromApi = useMemo(() => {
    const leaveTypes = leaveTypesResponse?.data ?? [];

    return leaveTypes
      .filter((item) => item.isActive !== false)
      .map((item) => ({
        value: item.id,
        label: item.name,
        quota: item.balance?.remaining ?? item.quota ?? undefined,
      }));
  }, [leaveTypesResponse?.data]);

  const leavesQueryEnabled = Boolean(companyId && employeeId && startDate && endDate);
  const { data: leaveRecordsResponse } = useLeaves({
    companyId: companyId ?? undefined,
    employeeId: employeeId || undefined,
    year,
    enabled: leavesQueryEnabled,
  });

  useEffect(() => {
    onLeaveTypeOptionsChange(leaveTypeOptionsFromApi);
  }, [leaveTypeOptionsFromApi, onLeaveTypeOptionsChange]);

  useEffect(() => {
    if (!leavesQueryEnabled) {
      onConflictErrorChange(null);
      return;
    }

    const conflictMessage = getLeaveConflictMessage({
      existingLeaves: leaveRecordsResponse?.data ?? [],
      startDate,
      endDate,
      excludeLeaveId,
    });

    onConflictErrorChange(conflictMessage);
  }, [
    endDate,
    excludeLeaveId,
    leaveRecordsResponse?.data,
    leavesQueryEnabled,
    onConflictErrorChange,
    startDate,
  ]);

  return null;
}

function LeaveQuotaTracker({
  leaveTypeOptions,
  onQuotaErrorChange,
  currentLeave,
}: {
  leaveTypeOptions: Array<SelectOption & { quota?: number }>;
  onQuotaErrorChange: (value: string | null) => void;
  currentLeave?: {
    id: string;
    employeeId: string;
    leaveTypeId: string;
    durationDays: number;
  } | null;
}) {
  const leaveTypeId = useWatch<LeaveFormValues>({ name: 'leaveTypeId' }) as string | undefined;
  const employeeId = useWatch<LeaveFormValues>({ name: 'employeeId' }) as string | undefined;
  const startDate = useWatch<LeaveFormValues>({ name: 'startDate' }) as string | undefined;
  const endDate = useWatch<LeaveFormValues>({ name: 'endDate' }) as string | undefined;

  const selectedLeaveType = useMemo(
    () => leaveTypeOptions.find((option) => option.value === leaveTypeId),
    [leaveTypeId, leaveTypeOptions]
  );

  useEffect(() => {
    const durationDays = getLeaveDurationDays(startDate, endDate);
    const adjustedQuotaRemaining =
      selectedLeaveType?.quota != null
        ? currentLeave &&
          currentLeave.employeeId === employeeId &&
          currentLeave.leaveTypeId === leaveTypeId
          ? selectedLeaveType.quota + currentLeave.durationDays
          : selectedLeaveType.quota
        : null;
    const quotaError = getLeaveQuotaExceededMessage({
      durationDays,
      quotaRemaining: adjustedQuotaRemaining,
    });

    onQuotaErrorChange(quotaError);
  }, [
    currentLeave,
    endDate,
    employeeId,
    leaveTypeId,
    onQuotaErrorChange,
    selectedLeaveType?.quota,
    startDate,
  ]);

  return null;
}

function buildFormFields({
  companyId,
  employeeOptions,
  leaveTypeOptions,
  isEmployeesLoading,
  employeesHasMore,
  employeesLoadMore,
  onValidChange,
  onLeaveTypeOptionsChange,
  onConflictErrorChange,
  onQuotaErrorChange,
  validationMessages,
  currentLeave,
}: {
  companyId: string | null;
  employeeOptions: SelectOption[];
  leaveTypeOptions: Array<SelectOption & { quota?: number }>;
  isEmployeesLoading: boolean;
  employeesHasMore: boolean;
  employeesLoadMore: () => void;
  onValidChange: (value: boolean) => void;
  onLeaveTypeOptionsChange: (value: Array<SelectOption & { quota?: number }>) => void;
  onConflictErrorChange: (value: string | null) => void;
  onQuotaErrorChange: (value: string | null) => void;
  validationMessages: Array<string | null>;
  currentLeave?: {
    id: string;
    employeeId: string;
    leaveTypeId: string;
    durationDays: number;
  } | null;
}): FormFieldConfig<LeaveFormValues>[] {
  return [
    {
      type: 'custom',
      content: <FormValidityTracker onValidChange={onValidChange} />,
      colSpan: 1,
      className: 'hidden',
    },
    {
      type: 'custom',
      content: (
        <LeaveEligibilityTracker
          companyId={companyId}
          onLeaveTypeOptionsChange={onLeaveTypeOptionsChange}
          onConflictErrorChange={onConflictErrorChange}
          excludeLeaveId={currentLeave?.id}
        />
      ),
      colSpan: 1,
      className: 'hidden',
    },
    {
      type: 'custom',
      content: (
        <LeaveQuotaTracker
          leaveTypeOptions={leaveTypeOptions}
          onQuotaErrorChange={onQuotaErrorChange}
          currentLeave={currentLeave}
        />
      ),
      colSpan: 1,
      className: 'hidden',
    },
    {
      name: 'employeeId',
      type: 'select',
      label: LEAVE_LABELS.FORM.EMPLOYEE,
      placeholder: LEAVE_LABELS.FORM.EMPLOYEE_PLACEHOLDER,
      required: true,
      options: employeeOptions,
      isSearchable: true,
      isLoading: isEmployeesLoading,
      onScrollToBottom: employeesHasMore ? employeesLoadMore : undefined,
      colSpan: 12,
    },
    {
      name: 'leaveTypeId',
      type: 'select',
      label: LEAVE_LABELS.FORM.LEAVE_TYPE,
      placeholder: LEAVE_LABELS.FORM.LEAVE_TYPE_PLACEHOLDER,
      required: true,
      options: leaveTypeOptions,
      isSearchable: true,
      colSpan: 12,
    },
    {
      name: 'startDate',
      type: 'date',
      label: LEAVE_LABELS.FORM.START_DATE,
      required: true,
      colSpan: 6,
    },
    {
      name: 'endDate',
      type: 'date',
      label: LEAVE_LABELS.FORM.END_DATE,
      required: true,
      colSpan: 6,
    },
    {
      type: 'custom',
      content: (
        <LeaveSummaryBox
          leaveTypeOptions={leaveTypeOptions}
          validationMessages={validationMessages}
          currentLeave={currentLeave}
        />
      ),
      colSpan: 12,
    },
    {
      name: 'description',
      type: 'textarea',
      label: LEAVE_LABELS.FORM.DESCRIPTION,
      placeholder: LEAVE_LABELS.FORM.DESCRIPTION_PLACEHOLDER,
      rows: 4,
      colSpan: 12,
    },
  ];
}

export function LeaveFormDrawer({
  open,
  onClose,
  onSuccess,
  editId,
  companyId,
}: LeaveFormDrawerProps) {
  const isEdit = !!editId;
  const { data: detailResponse, isLoading: detailLoading } = useLeaveDetail(editId, companyId);
  const { mutate: createLeave, isPending: isCreating } = useCreateLeave();
  const { mutate: updateLeave, isPending: isUpdating } = useUpdateLeave();
  const [isValid, setIsValid] = useState(false);
  const [quotaError, setQuotaError] = useState<string | null>(null);
  const [conflictError, setConflictError] = useState<string | null>(null);
  const [leaveTypeOptions, setLeaveTypeOptions] = useState<
    Array<SelectOption & { quota?: number }>
  >([]);

  const {
    options: employeeOptions,
    isLoading: employeesLoading,
    hasMore: employeesHasMore,
    loadMore: employeesLoadMore,
  } = useEmployeesInfinite({ companyId, perPage: 20, enabled: open });

  const defaultValues = useMemo((): LeaveFormValues => {
    const detail = detailResponse?.success ? detailResponse.data : null;

    if (isEdit && detail) {
      return {
        employeeId: detail.employeeId,
        leaveTypeId: detail.leaveTypeId,
        startDate: detail.startDate,
        endDate: detail.endDate,
        description: detail.description ?? '',
      };
    }

    return {
      employeeId: '',
      leaveTypeId: '',
      startDate: '',
      endDate: '',
      description: '',
    };
  }, [detailResponse, isEdit]);

  const currentLeave = useMemo(
    () =>
      detailResponse?.success && detailResponse.data
        ? {
            id: detailResponse.data.id,
            employeeId: detailResponse.data.employeeId,
            leaveTypeId: detailResponse.data.leaveTypeId,
            durationDays: detailResponse.data.durationDays,
          }
        : null,
    [detailResponse]
  );
  const isEditableLeave =
    !isEdit || Boolean(detailResponse?.success && canEditLeave(detailResponse.data.status));

  const fields = useMemo(
    () =>
      buildFormFields({
        companyId,
        employeeOptions,
        leaveTypeOptions,
        currentLeave,
        isEmployeesLoading: employeesLoading,
        employeesHasMore,
        employeesLoadMore,
        onValidChange: setIsValid,
        onLeaveTypeOptionsChange: setLeaveTypeOptions,
        onConflictErrorChange: setConflictError,
        onQuotaErrorChange: setQuotaError,
        validationMessages: [conflictError, quotaError],
      }),
    [
      companyId,
      employeeOptions,
      leaveTypeOptions,
      currentLeave,
      employeesLoading,
      employeesHasMore,
      employeesLoadMore,
      conflictError,
      quotaError,
    ]
  );

  const handleSubmit = useCallback(
    (values: LeaveFormValues) => {
      if (!companyId) return;

      const payload: CreateLeavePayload = {
        employeeId: values.employeeId,
        leaveTypeId: values.leaveTypeId,
        startDate: values.startDate,
        endDate: values.endDate,
        description: values.description || null,
      };

      if (isEdit && editId) {
        if (!isEditableLeave) return;

        updateLeave(
          {
            id: editId,
            companyId,
            payload: payload as UpdateLeavePayload,
          },
          {
            onSuccess: () => {
              onClose();
              onSuccess?.();
            },
          }
        );
        return;
      }

      createLeave(
        { companyId, payload },
        {
          onSuccess: () => {
            onClose();
            onSuccess?.();
          },
        }
      );
    },
    [companyId, createLeave, editId, isEdit, isEditableLeave, onClose, onSuccess, updateLeave]
  );

  const isSaving = isCreating || isUpdating;
  const showLoader = isEdit && detailLoading;
  const hasValidationError = !!quotaError || !!conflictError;

  useEffect(() => {
    if (!open) {
      setQuotaError(null);
      setConflictError(null);
    }
  }, [open]);

  if (showLoader) {
    return (
      <Drawer open={open} onOpenChange={(value) => !value && onClose()} direction="right">
        <DrawerContent className="w-lg max-w-lg inset-y-0! right-0! left-auto! mt-0! rounded-l-xl! rounded-r-none! border-l! flex flex-col">
          <DrawerHeader className="pb-2">
            <div className="flex items-center justify-between">
              <DrawerTitle className="text-2xl font-semibold text-[#0A0A0A]">
                {isEdit ? LEAVE_LABELS.FORM.EDIT_TITLE : LEAVE_LABELS.FORM.CREATE_TITLE}
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
    <Drawer open={open} onOpenChange={(value) => !value && onClose()} direction="right">
      <DrawerContent className="w-lg max-w-lg inset-y-0! right-0! left-auto! mt-0! rounded-l-xl! rounded-r-none! border-l! flex flex-col">
        <DrawerHeader className="pb-2">
          <div className="flex items-center justify-between">
            <DrawerTitle className="text-2xl font-semibold text-[#0A0A0A]">
              {isEdit ? LEAVE_LABELS.FORM.EDIT_TITLE : LEAVE_LABELS.FORM.CREATE_TITLE}
            </DrawerTitle>
            <DrawerClose asChild>
              <Button variant="ghost" size="xs" className="h-6 w-6 p-0" aria-label="Close">
                <span className="text-lg leading-none">&times;</span>
              </Button>
            </DrawerClose>
          </div>
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto px-4 py-6">
          <FormGenerator<LeaveFormValues>
            id="leave-form"
            schema={leaveFormSchema}
            fields={fields}
            defaultValues={defaultValues}
            onSubmit={handleSubmit}
            mode="onChange"
          />
        </div>

        <DrawerFooter className="px-4 py-4 border-t flex flex-col gap-3">
          <Button
            form="leave-form"
            type="submit"
            className="w-full bg-teal-600 hover:bg-teal-700 text-white"
            disabled={isSaving || !isValid || hasValidationError || !isEditableLeave}
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : isEdit ? (
              LEAVE_LABELS.FORM.SAVE_CHANGES
            ) : (
              LEAVE_LABELS.FORM.SAVE
            )}
          </Button>
          <Button variant="outline" onClick={onClose} className="w-full">
            {LEAVE_LABELS.FORM.CANCEL}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
