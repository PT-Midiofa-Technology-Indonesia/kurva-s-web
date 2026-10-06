'use client';

import { CheckIcon, PencilIcon, XIcon } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useQueryParams } from '@/hooks/use-query-params';
import { Button } from '@/shared/components/atoms';
import { ItemNotFound } from '@/shared/components/molecules';
import { ConfirmDialog } from '@/shared/components/molecules/AlertDialog';
import { PageHeader } from '@/shared/components/molecules/PageHeader';
import { getErrorMessage } from '@/shared/lib/api-error';
import { toast } from '@/shared/lib/toast';
import { CancelMomDialog } from '../components/CancelMomDialog';
import { CreateMomForm } from '../components/CreateMomForm';
import { MomDetailView } from '../components/MomDetailView';
import { DETAIL_MOM_LABELS } from '../constants';
import { useCancelMeeting } from '../hooks/use-cancel-meeting';
import { useMeeting } from '../hooks/use-meeting';
import { usePublishMeeting } from '../hooks/use-publish-meeting';
import { useUpdateMeeting } from '../hooks/use-update-meeting';
import type { CreateMomFormValues } from '../types';
import { momDetailToFormValues, momFormValuesToMeetingPayload } from '../utils/mom-form.utils';

const labels = DETAIL_MOM_LABELS;

export function MomDetailPage() {
  const router = useRouter();
  const { id: momId } = useParams<{ id: string }>();
  const { queryParams } = useQueryParams<{ companyId?: string }>();
  const companyId = queryParams.companyId;

  const { data: detail, isLoading } = useMeeting(momId, companyId);
  const { mutate: updateMeeting, isPending: isUpdating } = useUpdateMeeting(momId, companyId ?? '');
  const { mutate: publishMeeting, isPending: isPublishing } = usePublishMeeting(
    momId,
    companyId ?? ''
  );
  const { mutate: cancelMeeting, isPending: isCancelling } = useCancelMeeting(
    momId,
    companyId ?? ''
  );

  const [isEditing, setIsEditing] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [publishDialogOpen, setPublishDialogOpen] = useState(false);

  const handleBack = () => router.push('/meeting/mom');

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 p-6">
        <PageHeader title={labels.PAGE_TITLE} onBack={handleBack} />
        <p className="text-sm text-muted-foreground">Memuat data...</p>
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="flex flex-col gap-6 p-6">
        <PageHeader title={labels.PAGE_TITLE} onBack={handleBack} />
        <ItemNotFound message={labels.NOT_FOUND} />
      </div>
    );
  }

  const canAct = detail.status === 'draft' && !isEditing;

  const handleSave = (values: CreateMomFormValues) => {
    updateMeeting(momFormValuesToMeetingPayload(values), {
      onSuccess: () => {
        setIsEditing(false);
        toast.success({ title: 'MoM berhasil diubah' });
      },
      onError: (error) => toast.error({ title: getErrorMessage(error) }),
    });
  };

  const handleConfirmCancelMom = (reason: string) => {
    cancelMeeting(reason, {
      onSuccess: () => {
        setCancelDialogOpen(false);
        toast.success({ title: 'MoM berhasil dibatalkan' });
      },
      onError: (error) => toast.error({ title: getErrorMessage(error) }),
    });
  };

  const handleConfirmPublish = () => {
    publishMeeting(undefined, {
      onSuccess: () => {
        setPublishDialogOpen(false);
        toast.success({ title: 'MoM berhasil dipublish' });
      },
      onError: (error) => toast.error({ title: getErrorMessage(error) }),
    });
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <PageHeader
        title={labels.PAGE_TITLE}
        onBack={isEditing ? () => setIsEditing(false) : handleBack}
        actions={
          canAct ? (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                leftIcon={<PencilIcon />}
                onClick={() => setIsEditing(true)}
              >
                {labels.ACTIONS.EDIT}
              </Button>
              <Button
                variant="destructive"
                leftIcon={<XIcon />}
                onClick={() => setCancelDialogOpen(true)}
              >
                {labels.ACTIONS.CANCEL_MOM}
              </Button>
              <Button leftIcon={<CheckIcon />} onClick={() => setPublishDialogOpen(true)}>
                {labels.ACTIONS.PUBLISH}
              </Button>
            </div>
          ) : undefined
        }
      />

      {isEditing ? (
        <CreateMomForm
          mode="edit"
          defaultValues={momDetailToFormValues(detail)}
          onSubmit={handleSave}
          onCancel={() => setIsEditing(false)}
          isSubmitting={isUpdating}
        />
      ) : (
        <MomDetailView
          detail={detail}
          companyName={detail.companyName}
          projects={detail.projects}
          participantNames={detail.participantNames}
        />
      )}

      <CancelMomDialog
        open={cancelDialogOpen}
        onOpenChange={setCancelDialogOpen}
        isLoading={isCancelling}
        onConfirm={handleConfirmCancelMom}
      />

      <ConfirmDialog
        open={publishDialogOpen}
        onOpenChange={setPublishDialogOpen}
        variant="success"
        title={labels.PUBLISH_DIALOG.TITLE}
        description={labels.PUBLISH_DIALOG.DESCRIPTION}
        cancelText={labels.PUBLISH_DIALOG.CANCEL}
        confirmText={labels.PUBLISH_DIALOG.CONFIRM}
        isLoading={isPublishing}
        onCancel={() => setPublishDialogOpen(false)}
        onConfirm={handleConfirmPublish}
      />
    </div>
  );
}
