'use client';

import { Loader2 } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { useOfficesInfinite } from '@/domains/office/hooks/use-offices-infinite';
import { useOvertimeEmployeeProjects } from '@/domains/overtime/hooks/use-overtime-employee-projects';
import { useOvertimeEmployees } from '@/domains/overtime/hooks/use-overtime-employees';
import { useWarehousesInfinite } from '@/domains/warehouse/hooks/use-warehouses-infinite';
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
import { formatIDR } from '@/shared/utils/currency';
import { OVERTIME_LABELS } from '../constants';
import { useCalculateOvertime } from '../hooks/use-calculate-overtime';
import { useCreateOvertime } from '../hooks/use-create-overtime';
import { useOvertimeDetail } from '../hooks/use-overtime-detail';
import { useOvertimeSettings } from '../hooks/use-overtime-settings';
import { useUpdateOvertime } from '../hooks/use-update-overtime';
import { type OvertimeFormValues, overtimeFormSchema } from '../schemas';
import type { CreateOvertimePayload, UpdateOvertimePayload } from '../types';

interface OvertimeFormDrawerProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  editId: string | null;
  companyId: string | null;
}

const LOCATION_OPTIONS: SelectOption[] = [
  { value: 'Office', label: 'Office' },
  { value: 'Warehouse', label: 'Warehouse' },
];

const STATUS_OPTIONS: SelectOption[] = [
  { value: 'done', label: 'Done' },
  { value: 'cancelled', label: 'Cancelled' },
];

const OVERTIME_CALCULATION_DEBOUNCE_MS = 500;

function FormValidityTracker({ onValidChange }: { onValidChange: (v: boolean) => void }) {
  const { formState } = useFormContext<OvertimeFormValues>();
  useEffect(() => {
    onValidChange(formState.isValid);
  }, [formState.isValid, onValidChange]);
  return null;
}

function EmployeeIdWatcher({ onChange }: { onChange: (value: string) => void }) {
  const employeeId = useWatch<OvertimeFormValues>({ name: 'employeeId' }) as string | undefined;
  useEffect(() => {
    onChange(employeeId ?? '');
  }, [employeeId, onChange]);
  return null;
}

function ProjectIdWatcher({ onChange }: { onChange: (value: string) => void }) {
  const projectId = useWatch<OvertimeFormValues>({ name: 'projectId' }) as string | undefined;
  useEffect(() => {
    onChange(projectId ?? '');
  }, [projectId, onChange]);
  return null;
}

function LocationTypeWatcher({ onChange }: { onChange: (value: string) => void }) {
  const locationType = useWatch<OvertimeFormValues>({ name: 'locationType' }) as string | undefined;
  useEffect(() => {
    onChange(locationType ?? '');
  }, [locationType, onChange]);
  return null;
}

function LocationAutoFillWatcher({
  autoLocationType,
  autoLocationId,
  isEdit,
}: {
  autoLocationType: string;
  autoLocationId: string;
  isEdit: boolean;
}) {
  const { setValue } = useFormContext<OvertimeFormValues>();
  useEffect(() => {
    if (!isEdit && autoLocationType) {
      setValue('locationType', autoLocationType, { shouldValidate: true });
      if (autoLocationId) setValue('locationId', autoLocationId, { shouldValidate: true });
    }
  }, [autoLocationType, autoLocationId, isEdit, setValue]);
  return null;
}

function OvertimeSummaryBox({
  companyId,
  editId,
}: {
  companyId: string | null;
  editId: string | null;
}) {
  const { getValues, setValue } = useFormContext<OvertimeFormValues>();
  const startTime = useWatch<OvertimeFormValues>({ name: 'startTime' }) as string | undefined;
  const endTime = useWatch<OvertimeFormValues>({ name: 'endTime' }) as string | undefined;
  const rate = useWatch<OvertimeFormValues>({ name: 'ratePerHourSnapshot' }) as number | undefined;
  const totalMinutes = useWatch<OvertimeFormValues>({ name: 'totalMinutes' }) as number | undefined;
  const amount = useWatch<OvertimeFormValues>({ name: 'amount' }) as number | undefined;
  const requestKeyRef = useRef('');
  const { mutate, isPending } = useCalculateOvertime();

  useEffect(() => {
    if (!(companyId && startTime && endTime && endTime > startTime)) return;

    const requestKey = `${editId ?? ''}|${startTime}|${endTime}`;
    requestKeyRef.current = requestKey;

    const timeoutId = window.setTimeout(() => {
      mutate(
        {
          companyId,
          payload: {
            ...(editId ? { overtimeId: editId } : {}),
            startTime,
            endTime,
          },
        },
        {
          onSuccess: (calculation) => {
            if (requestKeyRef.current !== requestKey) return;
            if (getValues('startTime') !== calculation.startTime) return;
            if (getValues('endTime') !== calculation.endTime) return;

            setValue('ratePerHourSnapshot', calculation.ratePerHourSnapshot, {
              shouldValidate: true,
            });
            setValue('totalMinutes', calculation.totalMinutes, { shouldValidate: true });
            setValue('roundedHours', calculation.roundedHours, { shouldValidate: true });
            setValue('amount', calculation.amount, { shouldValidate: true });
          },
        }
      );
    }, OVERTIME_CALCULATION_DEBOUNCE_MS);

    return () => window.clearTimeout(timeoutId);
  }, [companyId, editId, endTime, getValues, mutate, setValue, startTime]);

  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 space-y-2">
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-0.5">
          <Label className="text-xs text-slate-500">{OVERTIME_LABELS.FORM.DURATION}</Label>
          <p className="text-sm font-medium text-slate-950">
            {isPending
              ? OVERTIME_LABELS.FORM.CALCULATING
              : totalMinutes && totalMinutes > 0
                ? `${totalMinutes} minutes`
                : '-'}
          </p>
        </div>
        <div className="flex flex-col gap-0.5">
          <Label className="text-xs text-slate-500">{OVERTIME_LABELS.FORM.RATE}</Label>
          <p className="text-sm font-medium text-slate-950">
            {(rate ?? 0) > 0 ? `${formatIDR(rate ?? 0)}` : '-'}
          </p>
        </div>
      </div>
      <div className="flex justify-end">
        <div className="flex flex-col gap-0.5 text-right">
          <Label className="text-xs text-slate-500">{OVERTIME_LABELS.FORM.AMOUNT}</Label>
          <p className="text-sm font-bold text-slate-950">
            {(amount ?? 0) > 0 ? formatIDR(amount ?? 0) : '-'}
          </p>
        </div>
      </div>
    </div>
  );
}

interface BuildFieldsOptions {
  employeeOptions: SelectOption[];
  projectOptions: SelectOption[];
  locationOptions: SelectOption[];
  isEmployeesLoading: boolean;
  isProjectsLoading: boolean;
  isLocationsLoading: boolean;
  onValidChange: (v: boolean) => void;
  onEmployeeIdChange: (value: string) => void;
  onProjectIdChange: (value: string) => void;
  onLocationTypeChange: (value: string) => void;
  employeeId: string;
  locationType: string;
  autoLocationType: string;
  autoLocationId: string;
  isEdit: boolean;
  editId: string | null;
  companyId: string | null;
}

function buildFormFields(opts: BuildFieldsOptions): FormFieldConfig<OvertimeFormValues>[] {
  const {
    employeeOptions,
    projectOptions,
    locationOptions,
    isEmployeesLoading,
    isProjectsLoading,
    isLocationsLoading,
    onValidChange,
    onEmployeeIdChange,
    onProjectIdChange,
    onLocationTypeChange,
    employeeId,
    locationType,
    autoLocationType,
    autoLocationId,
    isEdit,
    editId,
    companyId,
  } = opts;

  const isEmployeeSelected = Boolean(employeeId);

  const fields: FormFieldConfig<OvertimeFormValues>[] = [
    {
      type: 'custom',
      content: <FormValidityTracker onValidChange={onValidChange} />,
      colSpan: 1,
      className: 'hidden',
    },
    {
      type: 'custom',
      content: <EmployeeIdWatcher onChange={onEmployeeIdChange} />,
      colSpan: 1,
      className: 'hidden',
    },
    {
      type: 'custom',
      content: <ProjectIdWatcher onChange={onProjectIdChange} />,
      colSpan: 1,
      className: 'hidden',
    },
    {
      type: 'custom',
      content: <LocationTypeWatcher onChange={onLocationTypeChange} />,
      colSpan: 1,
      className: 'hidden',
    },
    {
      type: 'custom',
      content: (
        <LocationAutoFillWatcher
          autoLocationType={autoLocationType}
          autoLocationId={autoLocationId}
          isEdit={isEdit}
        />
      ),
      colSpan: 1,
      className: 'hidden',
    },
    {
      name: 'overtimeDate',
      type: 'date',
      label: OVERTIME_LABELS.FORM.DATE,
      required: true,
      colSpan: 6,
    },
    {
      name: 'employeeId',
      type: 'select',
      label: OVERTIME_LABELS.FORM.EMPLOYEE,
      placeholder: OVERTIME_LABELS.FORM.EMPLOYEE_PLACEHOLDER,
      required: true,
      options: employeeOptions,
      isSearchable: true,
      isLoading: isEmployeesLoading,
      colSpan: 6,
    },
    {
      name: 'projectId',
      type: 'select',
      label: OVERTIME_LABELS.FORM.PROJECT,
      placeholder: OVERTIME_LABELS.FORM.PROJECT_PLACEHOLDER,
      required: false,
      options: projectOptions,
      isSearchable: true,
      isLoading: isProjectsLoading,
      isClearable: true,
      disabled: !isEmployeeSelected,
      colSpan: 6,
    },
    {
      name: 'locationType',
      type: 'select',
      label: OVERTIME_LABELS.FORM.LOCATION,
      required: true,
      options: LOCATION_OPTIONS,
      isSearchable: false,
      disabled: !isEmployeeSelected,
      colSpan: 6,
    },
  ];

  fields.push({
    name: 'locationId',
    type: 'select',
    label: OVERTIME_LABELS.FORM.LOCATION_DETAIL,
    placeholder: OVERTIME_LABELS.FORM.LOCATION_DETAIL_PLACEHOLDER,
    required: false,
    options: locationOptions,
    isSearchable: true,
    isLoading: isLocationsLoading,
    isClearable: true,
    disabled: !locationType,
    colSpan: 12,
  });

  fields.push(
    {
      name: 'status',
      type: 'select',
      label: OVERTIME_LABELS.FORM.STATUS,
      required: true,
      options: STATUS_OPTIONS,
      isSearchable: false,
      colSpan: 6,
    },
    {
      name: 'startTime',
      type: 'time',
      label: OVERTIME_LABELS.FORM.START_TIME,
      required: true,
      colSpan: 6,
    },
    {
      name: 'endTime',
      type: 'time',
      label: OVERTIME_LABELS.FORM.END_TIME,
      required: true,
      colSpan: 6,
    },
    {
      type: 'custom',
      content: <OvertimeSummaryBox companyId={companyId} editId={editId} />,
      colSpan: 12,
    },
    {
      name: 'notes',
      type: 'textarea',
      label: OVERTIME_LABELS.FORM.NOTES,
      placeholder: OVERTIME_LABELS.FORM.NOTES_PLACEHOLDER,
      required: false,
      colSpan: 12,
    },
    {
      name: 'reason',
      type: 'textarea',
      label: OVERTIME_LABELS.FORM.REASON,
      placeholder: OVERTIME_LABELS.FORM.REASON_PLACEHOLDER,
      required: false,
      colSpan: 12,
    }
  );

  return fields;
}

export function OvertimeFormDrawer({
  open,
  onClose,
  onSuccess,
  editId,
  companyId,
}: OvertimeFormDrawerProps) {
  const isEdit = !!editId;

  const { data: settingsData } = useOvertimeSettings(companyId);
  const ratePerHour = settingsData?.data?.overtimeRatePerHour ?? 0;

  const { data: detailData, isLoading: detailLoading } = useOvertimeDetail(editId, companyId);

  const { mutate: createMutate, isPending: createPending } = useCreateOvertime();
  const { mutate: updateMutate, isPending: updatePending } = useUpdateOvertime();
  const isSaving = createPending || updatePending;

  const {
    options: employeeOptions,
    isLoading: employeesLoading,
    data: employeesData,
  } = useOvertimeEmployees({ companyId, enabled: open });

  const [employeeId, setEmployeeId] = useState('');
  const [projectId, setProjectId] = useState('');
  const [locationType, setLocationType] = useState('');

  const {
    projectOptions,
    isLoading: projectsLoading,
    autoLocation,
    data: projectsData,
  } = useOvertimeEmployeeProjects({
    employeeId,
    companyId,
    enabled: open && Boolean(employeeId),
  });

  const { options: officeOptions, isLoading: officesLoading } = useOfficesInfinite({
    companyId: companyId ?? undefined,
    enabled: open && locationType === 'Office',
  });
  const { options: warehouseOptions, isLoading: warehousesLoading } = useWarehousesInfinite({
    companyId: companyId ?? undefined,
    enabled: open && locationType === 'Warehouse',
  });

  const locationOptions =
    locationType === 'Office'
      ? officeOptions
      : locationType === 'Warehouse'
        ? warehouseOptions
        : [];
  const isLocationsLoading =
    locationType === 'Office'
      ? officesLoading
      : locationType === 'Warehouse'
        ? warehousesLoading
        : false;

  const projects = projectsData?.projects ?? [];
  const selectedEmployee = (employeesData ?? []).find((e) => e.id === employeeId);

  const selectedProject = projects.find((p) => p.id === projectId);

  const workPlacementLocationType =
    selectedEmployee?.work_placement === 'office'
      ? 'Office'
      : selectedEmployee?.work_placement === 'warehouse'
        ? 'Warehouse'
        : '';

  const hasProjects = projects.length > 0;

  const autoLocationType =
    selectedProject?.location?.type ??
    autoLocation?.type ??
    (!hasProjects ? workPlacementLocationType : '');

  const autoLocationId = selectedProject?.location?.id ?? autoLocation?.id ?? '';

  const [isValid, setIsValid] = useState(false);

  const defaultValues = useMemo((): OvertimeFormValues => {
    if (isEdit && detailData) {
      return {
        employeeId: detailData.employeeId,
        overtimeDate: detailData.overtimeDate,
        startTime: detailData.startTime,
        endTime: detailData.endTime,
        ratePerHourSnapshot: detailData.ratePerHourSnapshot,
        totalMinutes: detailData.totalMinutes,
        roundedHours: detailData.roundedHours,
        amount: detailData.amount,
        locationType: detailData.locationType,
        locationId: detailData.locationId ?? '',
        status: detailData.status || 'done',
        projectId: detailData.projectId ?? '',
        notes: detailData.notes ?? '',
        reason: detailData.reason ?? '',
      };
    }
    return {
      employeeId: '',
      overtimeDate: '',
      startTime: '',
      endTime: '',
      ratePerHourSnapshot: ratePerHour,
      totalMinutes: 0,
      roundedHours: 0,
      amount: 0,
      locationType: '',
      locationId: '',
      status: 'done',
      projectId: '',
      notes: '',
      reason: '',
    };
  }, [isEdit, detailData, ratePerHour]);

  const fields = useMemo(
    () =>
      buildFormFields({
        employeeOptions,
        projectOptions,
        locationOptions,
        isEmployeesLoading: employeesLoading,
        isProjectsLoading: projectsLoading,
        isLocationsLoading,
        onValidChange: setIsValid,
        onEmployeeIdChange: setEmployeeId,
        onProjectIdChange: setProjectId,
        onLocationTypeChange: setLocationType,
        employeeId,
        locationType,
        autoLocationType,
        autoLocationId,
        isEdit,
        editId,
        companyId,
      }),
    [
      employeeOptions,
      projectOptions,
      locationOptions,
      employeesLoading,
      projectsLoading,
      isLocationsLoading,
      employeeId,
      locationType,
      autoLocationType,
      autoLocationId,
      isEdit,
      editId,
      companyId,
    ]
  );

  const handleSubmit = useCallback(
    (formValues: OvertimeFormValues) => {
      if (!companyId) return;

      const basePayload: CreateOvertimePayload = {
        employeeId: formValues.employeeId,
        overtimeDate: formValues.overtimeDate,
        startTime: formValues.startTime,
        endTime: formValues.endTime,
        ratePerHourSnapshot: formValues.ratePerHourSnapshot,
        totalMinutes: formValues.totalMinutes,
        roundedHours: formValues.roundedHours,
        amount: formValues.amount,
        status: formValues.status,
        locationType: formValues.locationType,
        locationId: formValues.locationId || null,
        projectId: formValues.projectId || null,
        notes: formValues.notes || null,
        reason: formValues.reason || null,
      };

      if (isEdit && editId) {
        const payload = basePayload as UpdateOvertimePayload;
        updateMutate(
          { id: editId, companyId, payload },
          {
            onSuccess: () => {
              onClose();
              onSuccess?.();
            },
          }
        );
      } else {
        createMutate(
          { companyId, payload: basePayload },
          {
            onSuccess: () => {
              onClose();
              onSuccess?.();
            },
          }
        );
      }
    },
    [companyId, isEdit, editId, updateMutate, createMutate, onClose, onSuccess]
  );

  const showLoader = isEdit && detailLoading;

  if (showLoader) {
    return (
      <Drawer open={open} onOpenChange={(v) => !v && onClose()} direction="right">
        <DrawerContent className="w-lg max-w-lg inset-y-0! right-0! left-auto! mt-0! rounded-l-xl! rounded-r-none! border-l! flex flex-col">
          <DrawerHeader className="pb-2">
            <div className="flex items-center justify-between">
              <DrawerTitle className="text-2xl font-semibold text-[#0A0A0A]">
                {isEdit ? OVERTIME_LABELS.FORM.EDIT_TITLE : OVERTIME_LABELS.FORM.CREATE_TITLE}
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
              {isEdit ? OVERTIME_LABELS.FORM.EDIT_TITLE : OVERTIME_LABELS.FORM.CREATE_TITLE}
            </DrawerTitle>
            <DrawerClose asChild>
              <Button variant="ghost" size="xs" className="h-6 w-6 p-0" aria-label="Close">
                <span className="text-lg leading-none">&times;</span>
              </Button>
            </DrawerClose>
          </div>
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto px-4 py-6">
          <FormGenerator<OvertimeFormValues>
            id="overtime-form"
            schema={overtimeFormSchema}
            fields={fields}
            defaultValues={defaultValues}
            onSubmit={handleSubmit}
            mode="onChange"
          />
        </div>

        <DrawerFooter className="px-4 py-4 border-t flex flex-col gap-3">
          <Button
            form="overtime-form"
            type="submit"
            className="w-full bg-teal-600 hover:bg-teal-700 text-white"
            disabled={isSaving || !isValid}
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : isEdit ? (
              OVERTIME_LABELS.FORM.SAVE_CHANGES
            ) : (
              OVERTIME_LABELS.FORM.SAVE
            )}
          </Button>
          <Button variant="outline" onClick={onClose} className="w-full">
            {OVERTIME_LABELS.FORM.CANCEL}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
