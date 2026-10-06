'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useQueryParams } from '@/hooks/use-query-params';
import { PageHeader, Stepper } from '@/shared/components/molecules';
import type { BaseQueryParams } from '@/shared/types/query-params';
import { Step1Info } from '../components/create-steps/Step1Info';
import { Step2Progress } from '../components/create-steps/Step2Progress';
import { Step3Document } from '../components/create-steps/Step3Document';
import { Step4Payment } from '../components/create-steps/Step4Payment';
import { BILLING_LABELS } from '../constants';
import { useBilling } from '../hooks/use-billing';
import { useBillingDetail } from '../hooks/use-billing-detail';
import { useBillingProgress } from '../hooks/use-billing-progress';
import { useSaveBillingInformation } from '../hooks/use-save-billing-information';
import { useUpdateBillingInformation } from '../hooks/use-update-billing-information';
import { useUpdateBillingProgress } from '../hooks/use-update-billing-progress';
import { type CreateBillingFormValues, createBillingSchema } from '../schemas';

type BillingCreateUrlParams = BaseQueryParams & {
  companyId?: string;
  billingRecordId?: string;
};

const STEP_KEYS = ['step-1', 'step-2', 'step-3', 'step-4'] as const;
type StepKey = (typeof STEP_KEYS)[number];

export function BillingCreatePage() {
  const params = useParams<Record<string, string>>();
  const router = useRouter();
  const { queryParams } = useQueryParams<BillingCreateUrlParams>();
  const companyId = queryParams.companyId ?? '';
  const projectId = params.id ?? '';
  const billingRecordId = queryParams.billingRecordId ?? '';

  const listUrl = `/finance/billings${companyId ? `?companyId=${companyId}` : ''}`;
  const handleCancel = useCallback(() => {
    if (projectId) {
      router.push(`/finance/billings/${projectId}${companyId ? `?companyId=${companyId}` : ''}`);
      return;
    }
    router.push(listUrl);
  }, [projectId, companyId, router, listUrl]);

  const form = useForm<CreateBillingFormValues>({
    resolver: zodResolver(createBillingSchema),
    defaultValues: {
      projectId: '',
      billingType: '',
      percentage: undefined,
      billedAt: '',
      dueDate: '',
      notes: '',
      paymentMethods: ['transfer'],
      paymentTermDays: 14,
      invoiceNumber: '',
      vatPercentage: 11,
      withholdingPercentage: 2,
      reviewNotes: '',
      progressItems: [],
    },
  });

  const [activeStep, setActiveStep] = useState<StepKey>('step-1');
  const [createdBillingId, setCreatedBillingId] = useState<string | null>(null);
  const selectedProjectId = form.watch('projectId');

  const { mutate: saveBillingInformation } = useSaveBillingInformation();
  const { mutate: updateBillingInformation } = useUpdateBillingInformation();
  const { mutate: updateBillingProgress, isPending: isUpdatingBillingProgress } =
    useUpdateBillingProgress(createdBillingId ?? '');

  const { data: selectedProjectDetailData } = useBilling({
    billingId: selectedProjectId,
    companyId,
  });
  const selectedProjectDetail = selectedProjectDetailData?.data;
  const selectedBillingRecord = useMemo(
    () =>
      selectedProjectDetail && billingRecordId
        ? ([...selectedProjectDetail.billing.active, ...selectedProjectDetail.billing.history].find(
            (item) => item.id === billingRecordId
          ) ?? null)
        : null,
    [selectedProjectDetail, billingRecordId]
  );

  const { data: billingData } = useBillingDetail({
    billingId: createdBillingId ?? '',
    companyId,
  });
  const billingDetail = billingData?.data as any;

  const { data: billingProgressData, isLoading: isBillingProgressLoading } = useBillingProgress({
    billingId: createdBillingId ?? '',
    companyId: companyId || undefined,
  });
  const billingProgressDetail = billingProgressData?.data;

  useEffect(() => {
    if (!billingRecordId) return;
    setCreatedBillingId(billingRecordId);
  }, [billingRecordId]);

  useEffect(() => {
    if (!projectId) return;

    form.setValue('projectId', projectId);
  }, [form, projectId]);

  useEffect(() => {
    if (!selectedBillingRecord) return;

    form.setValue('billedAt', selectedBillingRecord.billedAt || '');
    form.setValue('dueDate', selectedBillingRecord.dueDate || '');
    form.setValue('notes', selectedBillingRecord.notes || '');
    form.setValue(
      'paymentMethods',
      selectedBillingRecord.paymentMethod ? [selectedBillingRecord.paymentMethod] : ['transfer']
    );
    form.setValue('reviewNotes', selectedBillingRecord.notes || '');
  }, [form, selectedBillingRecord]);

  useEffect(() => {
    const billingType =
      selectedProjectDetail?.project?.projectType?.code ??
      selectedProjectDetail?.project?.projectType?.name?.toLowerCase().replace(/\s+/g, '_');

    if (!billingType) return;

    form.setValue('billingType', billingType);
  }, [form, selectedProjectDetail]);

  const handleStep1Submit = useCallback(async () => {
    const isValid = await form.trigger(['projectId', 'billedAt', 'dueDate']);

    if (!isValid) return;

    const values = form.getValues();
    const targetBillingId = createdBillingId ?? billingRecordId;

    if (targetBillingId) {
      updateBillingInformation(
        {
          billingId: targetBillingId,
          companyId,
          billedAt: values.billedAt,
          dueDate: values.dueDate,
          notes: values.notes,
        },
        {
          onSuccess: () => {
            setCreatedBillingId(targetBillingId);
            setActiveStep('step-2');
          },
        }
      );

      return;
    }

    saveBillingInformation(
      {
        companyId,
        projectId: values.projectId,
        billedAt: values.billedAt,
        dueDate: values.dueDate,
        notes: values.notes,
      },
      {
        onSuccess: (response) => {
          const id = response.data?.id;
          if (id) {
            setCreatedBillingId(id);
            setActiveStep('step-2');
          }
        },
      }
    );
  }, [
    billingRecordId,
    companyId,
    createdBillingId,
    form,
    saveBillingInformation,
    updateBillingInformation,
  ]);

  const handleStep2Submit = useCallback(
    (progressItems: Array<{ boqItemId: string; progress: number }>) => {
      if (!createdBillingId) return;

      updateBillingProgress(
        {
          companyId: companyId || undefined,
          progressItems,
        },
        {
          onSuccess: () => {
            setActiveStep('step-3');
          },
        }
      );
    },
    [companyId, createdBillingId, updateBillingProgress]
  );

  const steps = useMemo(
    () => [
      {
        key: 'step-1',
        label: BILLING_LABELS.CREATE.STEP_1,
        content: (
          <Step1Info
            projectDetail={selectedProjectDetail}
            billingRecord={selectedBillingRecord}
            handleNext={handleStep1Submit}
            handleCancel={handleCancel}
          />
        ),
      },
      {
        key: 'step-2',
        label: BILLING_LABELS.CREATE.STEP_2,
        content: (
          <Step2Progress
            billingDetail={billingProgressDetail}
            isLoading={isBillingProgressLoading}
            isSubmitting={isUpdatingBillingProgress}
            handleNext={handleStep2Submit}
            handleBack={() => setActiveStep('step-1')}
          />
        ),
      },
      {
        key: 'step-3',
        label: BILLING_LABELS.CREATE.STEP_3,
        content: (
          <Step3Document
            billingDetail={billingDetail}
            billingId={createdBillingId}
            companyId={companyId}
            handleNext={() => setActiveStep('step-4')}
            handleBack={() => setActiveStep('step-2')}
          />
        ),
      },
      {
        key: 'step-4',
        label: BILLING_LABELS.CREATE.STEP_4,
        content: (
          <Step4Payment
            billingDetail={billingDetail}
            billingId={createdBillingId}
            companyId={companyId}
            handleBack={() => setActiveStep('step-3')}
          />
        ),
      },
    ],
    [
      handleCancel,
      handleStep1Submit,
      handleStep2Submit,
      billingDetail,
      billingProgressDetail,
      isBillingProgressLoading,
      isUpdatingBillingProgress,
      selectedProjectDetail,
      selectedBillingRecord,
      companyId,
      createdBillingId,
    ]
  );

  return (
    <div className="flex min-h-[calc(100vh-64px)] flex-col gap-6 bg-white p-6">
      <PageHeader title={BILLING_LABELS.CREATE.TITLE} onBack={handleCancel} />

      <FormProvider {...form}>
        <form onSubmit={(event) => event.preventDefault()} className="flex flex-col gap-6">
          <Stepper
            items={steps}
            activeKey={activeStep}
            onChange={(key) => setActiveStep(key as StepKey)}
            stepClickable
            variant="tab"
          />
        </form>
      </FormProvider>
    </div>
  );
}
