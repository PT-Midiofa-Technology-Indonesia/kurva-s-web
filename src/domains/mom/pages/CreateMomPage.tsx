'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { PageHeader } from '@/shared/components/molecules/PageHeader';
import { getErrorMessage } from '@/shared/lib/api-error';
import { toast } from '@/shared/lib/toast';
import { CreateMomForm } from '../components/CreateMomForm';
import { CREATE_MOM_LABELS } from '../constants';
import { useCreateMeeting } from '../hooks/use-create-meeting';
import type { CreateMomFormValues } from '../types';
import { momFormValuesToMeetingPayload } from '../utils/mom-form.utils';

export function CreateMomPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const companyId = searchParams.get('companyId') ?? undefined;
  const { mutate: createMeeting, isPending } = useCreateMeeting();

  useEffect(() => {
    if (!companyId) router.replace('/meeting/mom');
  }, [companyId, router]);

  if (!companyId) return null;

  const handleCancel = () => {
    router.push('/meeting/mom');
  };

  const handleSubmit = (values: CreateMomFormValues) => {
    createMeeting(
      { payload: momFormValuesToMeetingPayload(values), companyId: values.companyId },
      {
        onSuccess: () => {
          router.push('/meeting/mom');
        },
        onError: (error) => {
          toast.error({ title: getErrorMessage(error) });
        },
      }
    );
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <PageHeader title={CREATE_MOM_LABELS.PAGE_TITLE} onBack={handleCancel} />
      <CreateMomForm
        companyId={companyId}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isSubmitting={isPending}
      />
    </div>
  );
}
