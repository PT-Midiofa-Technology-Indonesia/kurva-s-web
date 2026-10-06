'use client';

import { Loader2, Trash2, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { type Path, useFieldArray, useFormContext } from 'react-hook-form';
import { AsyncSelect, Button } from '@/components/atoms';
import {
  FormFieldRenderer,
  FormGenerator,
  type SelectFieldConfig,
} from '@/components/organisms/FormGenerator';
import type { SelectOption } from '@/shared/components/atoms';
import { InputCurrency } from '@/shared/components/atoms/Input/InputCurrency';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/shared/components/ui/drawer';
import { Label } from '@/shared/components/ui/label';
import { Switch } from '@/shared/components/ui/switch';
import { APPROVAL_WORKFLOW_LABELS } from '../constants';
import { useApprovalWorkflow } from '../hooks/use-approval-workflow';
import { useApproverOptions } from '../hooks/use-approver-options';
import { usePicOptionsInfinite } from '../hooks/use-pic-options-infinite';
import { useUpdateApprovalWorkflow } from '../hooks/use-update-approval-workflow';
import {
  type ApprovalWorkflowSettingsFormValues,
  approvalWorkflowSettingsSchema,
} from '../schemas';
import type { ApprovalWorkflow, ApprovalWorkflowStep } from '../types';

const FORM_ID = 'approval-workflow-settings-form';
const labels = APPROVAL_WORKFLOW_LABELS.SETTINGS_DRAWER;

interface StepRowProps {
  index: number;
  fieldId: string;
  canRemove: boolean;
  onRemove: (index: number) => void;
  tipeApproverOptions: SelectOption[];
  roleOptions: SelectOption[];
  departmentOptions: SelectOption[];
  isLoadingApprovers: boolean;
  companyId: string;
}

interface StepRowPropsInternal extends StepRowProps {
  initialApproverType?: string;
  initialApproverId?: string;
}

function StepRow({
  index,
  fieldId,
  canRemove,
  onRemove,
  tipeApproverOptions,
  roleOptions,
  departmentOptions,
  isLoadingApprovers,
  companyId,
  initialApproverType,
  initialApproverId,
}: StepRowPropsInternal) {
  const form = useFormContext<ApprovalWorkflowSettingsFormValues>();
  const isFinance = form.watch('isFinance');
  const approverType = form.watch(`steps.${index}.approverType`);
  const approverId = form.watch(`steps.${index}.approverId`);
  const picId = form.watch(`steps.${index}.picId`);

  const bagianOptions = useMemo(() => {
    if (!approverType) return [];
    if (approverType.toLowerCase() === 'role') return roleOptions;
    return departmentOptions;
  }, [approverType, roleOptions, departmentOptions]);

  const [committedBagianId, setCommittedBagianId] = useState(
    initialApproverType && initialApproverId ? initialApproverId : ''
  );

  const { options: picOptions, isLoading: isLoadingPic } = usePicOptionsInfinite({
    enabled: !!approverType && !!committedBagianId,
    approverType,
    approverId: committedBagianId,
    companyId,
  });

  useEffect(() => {
    if (initialApproverType && initialApproverId && !committedBagianId) {
      setCommittedBagianId(initialApproverId);
    }
  }, [initialApproverType, initialApproverId, committedBagianId]);

  const prevApproverTypeRef = useRef<string | undefined>(undefined);
  useEffect(() => {
    if (prevApproverTypeRef.current !== undefined && prevApproverTypeRef.current !== approverType) {
      form.setValue(`steps.${index}.approverId`, '');
      form.setValue(`steps.${index}.picId`, '');
      setCommittedBagianId('');
    }
    prevApproverTypeRef.current = approverType;
  }, [approverType, form, index]);

  const prevApproverIdRef = useRef<string | undefined>(undefined);
  useEffect(() => {
    if (prevApproverIdRef.current !== undefined && prevApproverIdRef.current !== approverId) {
      form.setValue(`steps.${index}.picId`, '');
      if (approverId) {
        setCommittedBagianId(approverId);
      }
    }
    prevApproverIdRef.current = approverId;
  }, [approverId, form, index]);

  const approverTypeField: SelectFieldConfig<ApprovalWorkflowSettingsFormValues> = {
    type: 'select',
    name: `steps.${index}.approverType` as Path<ApprovalWorkflowSettingsFormValues>,
    label: labels.FIELDS.APPROVER_TYPE,
    required: true,
    placeholder: labels.PLACEHOLDERS.APPROVER_TYPE,
    options: tipeApproverOptions,
    isSearchable: false,
    isLoading: isLoadingApprovers,
    colSpan: 1,
  };

  const approverIdField: SelectFieldConfig<ApprovalWorkflowSettingsFormValues> = {
    type: 'select',
    name: `steps.${index}.approverId` as Path<ApprovalWorkflowSettingsFormValues>,
    label: labels.FIELDS.APPROVER_ID,
    required: true,
    placeholder: labels.PLACEHOLDERS.APPROVER_ID,
    options: bagianOptions,
    isSearchable: false,
    disabled: !approverType,
    colSpan: 1,
  };

  const nominalThresholdValue = form.watch(`steps.${index}.nominalThreshold`);
  const parsedThreshold =
    nominalThresholdValue !== undefined && nominalThresholdValue !== null
      ? Number(nominalThresholdValue)
      : undefined;

  return (
    <div key={fieldId} className="rounded-lg border bg-white">
      <div className="flex items-center justify-between px-4 py-3 border-b bg-slate-50 rounded-t-lg">
        <span className="text-sm font-semibold text-slate-800">
          {labels.STEP_LABEL} {index + 1}
        </span>
        {canRemove && (
          <Button
            type="button"
            variant="ghost"
            size="xs"
            onClick={() => onRemove(index)}
            className="h-6 w-6 p-0"
            aria-label={`Hapus langkah ${index + 1}`}
          >
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
        )}
      </div>

      <div className="p-4 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormFieldRenderer field={approverTypeField} />
          <FormFieldRenderer field={approverIdField} />
        </div>

        {isFinance && (
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-slate-700">
              {labels.FIELDS.NOMINAL_THRESHOLD}
            </Label>
            <InputCurrency
              value={parsedThreshold}
              onChange={(val) => {
                form.setValue(
                  `steps.${index}.nominalThreshold`,
                  val !== undefined && val !== null ? Number(val) : null
                );
              }}
              placeholder={labels.PLACEHOLDERS.NOMINAL_THRESHOLD}
              decimalPlaces={0}
            />
          </div>
        )}

        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-slate-700">{labels.FIELDS.PIC}</Label>
          <AsyncSelect
            options={picOptions}
            value={picId || null}
            onChange={(val) =>
              form.setValue(`steps.${index}.picId`, typeof val === 'string' ? val : '')
            }
            placeholder={labels.PLACEHOLDERS.PIC}
            isLoading={isLoadingPic}
            isDisabled={!approverType || !approverId}
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
}

interface StepsSectionProps {
  tipeApproverOptions: SelectOption[];
  roleOptions: SelectOption[];
  departmentOptions: SelectOption[];
  isLoadingApprovers: boolean;
  companyId: string;
  initialSteps?: ApprovalWorkflowStep[];
}

function StepsSection({
  tipeApproverOptions,
  roleOptions,
  departmentOptions,
  isLoadingApprovers,
  companyId,
  initialSteps,
}: StepsSectionProps) {
  const form = useFormContext<ApprovalWorkflowSettingsFormValues>();
  // Watch isFinance to trigger re-render when toggle changes
  form.watch('isFinance');
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'steps',
  });

  const handleAddStep = () => {
    const nextOrder = fields.length + 1;
    append({
      stepOrder: nextOrder,
      name: `Langkah ${nextOrder}`,
      approverType: '',
      approverId: '',
      nominalThreshold: null,
      isActive: true,
    });
  };

  return (
    <div className="flex flex-col gap-4">
      {fields.map((field, index) => {
        const initialStep = initialSteps?.[index];
        return (
          <StepRow
            key={field.id}
            index={index}
            fieldId={field.id}
            canRemove={fields.length > 1}
            onRemove={remove}
            tipeApproverOptions={tipeApproverOptions}
            roleOptions={roleOptions}
            departmentOptions={departmentOptions}
            isLoadingApprovers={isLoadingApprovers}
            companyId={companyId}
            initialApproverType={initialStep?.approverType}
            initialApproverId={initialStep?.approverId}
          />
        );
      })}
      <div className="flex justify-end">
        <Button type="button" onClick={handleAddStep} className="bg-slate-900 hover:bg-slate-800">
          {labels.BUTTONS.ADD_STEP}
        </Button>
      </div>
    </div>
  );
}

interface ApprovalWorkflowSettingsDrawerProps {
  open: boolean;
  workflow: ApprovalWorkflow | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export function ApprovalWorkflowSettingsDrawer({
  open,
  workflow,
  onClose,
  onSuccess,
}: ApprovalWorkflowSettingsDrawerProps) {
  const companyId = workflow?.companyId ?? '';

  const { data: detail, isLoading: isLoadingDetail } = useApprovalWorkflow(
    open ? (workflow?.id ?? null) : null,
    companyId
  );

  const { mutate: update, isPending } = useUpdateApprovalWorkflow(workflow?.id ?? '', companyId);

  const {
    tipeApproverOptions,
    roleOptions,
    departmentOptions,
    isLoading: isLoadingApprovers,
  } = useApproverOptions(open ? companyId : undefined);

  const stepsFieldConfig = useMemo(
    () => [
      {
        type: 'custom' as const,
        colSpan: 12 as const,
        content: (
          <StepsSection
            tipeApproverOptions={tipeApproverOptions}
            roleOptions={roleOptions}
            departmentOptions={departmentOptions}
            isLoadingApprovers={isLoadingApprovers}
            companyId={companyId}
            initialSteps={detail?.steps}
          />
        ),
      },
    ],
    [
      tipeApproverOptions,
      roleOptions,
      departmentOptions,
      isLoadingApprovers,
      companyId,
      detail?.steps,
    ]
  );

  const defaultValues: ApprovalWorkflowSettingsFormValues = {
    isFinance: detail?.isFinance ?? false,
    steps:
      detail && detail.steps.length > 0
        ? detail.steps.map((s) => ({
            stepOrder: s.stepOrder,
            name: s.name,
            approverType: s.approverType,
            approverId: s.approverId,
            picId: s.picId,
            nominalThreshold: s.nominalThreshold,
            isActive: s.isActive,
          }))
        : [
            {
              stepOrder: 1,
              name: 'Langkah 1',
              approverType: '',
              approverId: '',
              nominalThreshold: null,
              isActive: true,
            },
          ],
  };

  const handleFormSubmit = (values: ApprovalWorkflowSettingsFormValues) => {
    if (!workflow) return;
    update(
      {
        companyId: workflow.companyId,
        code: workflow.code,
        name: workflow.name,
        module: workflow.module,
        description: workflow.description,
        isActive: workflow.isActive,
        isFinance: values.isFinance,
        steps: values.steps.map((s, i) => ({
          stepOrder: i + 1,
          name: s.name || `Langkah ${i + 1}`,
          approverType: s.approverType,
          approverId: s.approverId,
          picId: s.picId || null,
          nominalThreshold:
            values.isFinance && s.nominalThreshold ? Number(s.nominalThreshold) : null,
          isActive: s.isActive,
        })),
      },
      {
        onSuccess: () => {
          onClose();
          onSuccess?.();
        },
      }
    );
  };

  return (
    <Drawer open={open} onOpenChange={(v) => !v && onClose()} direction="right">
      <DrawerContent className="w-lg max-w-lg inset-y-0! right-0! left-auto! mt-0! rounded-l-xl! rounded-r-none! border-l! flex flex-col">
        <DrawerHeader className="pb-2">
          <div className="flex items-center justify-between">
            <DrawerTitle className="text-lg font-semibold text-[#0A0A0A]">
              {labels.TITLE}
            </DrawerTitle>
            <DrawerClose asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <X className="h-4 w-4" />
              </Button>
            </DrawerClose>
          </div>
          {workflow && (
            <div className="rounded-lg bg-slate-50 p-3 mt-2">
              <p className="text-sm font-medium text-slate-900">{workflow.name}</p>
            </div>
          )}
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto px-4 py-4">
          {isLoadingDetail ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
            </div>
          ) : open && detail ? (
            <FormGenerator
              key={detail.id}
              id={FORM_ID}
              schema={approvalWorkflowSettingsSchema}
              fields={[
                {
                  type: 'custom' as const,
                  colSpan: 12 as const,
                  content: <IsFinanceToggle />,
                },
                ...stepsFieldConfig,
              ]}
              onSubmit={handleFormSubmit}
              defaultValues={defaultValues}
              mode="onBlur"
            />
          ) : null}
        </div>

        <DrawerFooter className="border-t px-4 py-4">
          <Button type="submit" form={FORM_ID} disabled={isPending || isLoadingDetail}>
            {isPending ? labels.BUTTONS.SAVING : labels.BUTTONS.SAVE}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isPending}
            className="w-full"
          >
            {labels.BUTTONS.CANCEL}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

function IsFinanceToggle() {
  const form = useFormContext<ApprovalWorkflowSettingsFormValues>();
  const isFinance = form.watch('isFinance');

  return (
    <div className="flex items-center justify-between rounded-lg border bg-white px-4 py-3">
      <div className="flex flex-col gap-0.5">
        <Label className="text-sm font-medium text-slate-800">{labels.FIELDS.IS_FINANCE}</Label>
        <p className="text-xs text-slate-500">{labels.DESCRIPTIONS.NOMINAL_THRESHOLD}</p>
      </div>
      <Switch
        checked={isFinance}
        onCheckedChange={(checked) => form.setValue('isFinance', checked)}
      />
    </div>
  );
}
