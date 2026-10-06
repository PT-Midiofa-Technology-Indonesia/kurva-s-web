'use client';

import { useParams } from 'next/navigation';
import { FormPageSkeleton } from '@/components/templates';
import { ItemNotFound } from '@/shared/components/molecules';
import { ConfirmDialog } from '@/shared/components/molecules/AlertDialog';
import { PageHeader } from '@/shared/components/molecules/PageHeader';

import { JobItemTypeForm } from '../components/JobItemTypeForm';
import { JOB_ITEM_TYPE_LABELS } from '../constants';
import { useEditJobItemTypePage } from '../hooks/use-edit-job-item-type-page';

export function EditJobItemTypePage() {
  const { id: jobItemTypeId } = useParams<{ id: string }>();
  const {
    jobItemType,
    isLoading,
    isDialogOpen,
    setIsDialogOpen,
    isPending,
    serverErrors,
    handleCancel,
    handleBeforeSubmit,
    handleConfirmSubmit,
    handleDialogCancel,
  } = useEditJobItemTypePage(jobItemTypeId);

  if (isLoading) {
    return <FormPageSkeleton />;
  }

  if (!jobItemType) {
    return <ItemNotFound message={JOB_ITEM_TYPE_LABELS.EDIT.NOT_FOUND} />;
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <PageHeader title={JOB_ITEM_TYPE_LABELS.EDIT.PAGE_TITLE} onBack={handleCancel} />

      <JobItemTypeForm
        mode="edit"
        jobItemType={jobItemType}
        onSubmit={handleBeforeSubmit}
        onCancel={handleCancel}
        isSubmitting={isPending}
        serverErrors={serverErrors}
      />

      <ConfirmDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        variant="default"
        title={JOB_ITEM_TYPE_LABELS.EDIT.DIALOG.TITLE}
        description={JOB_ITEM_TYPE_LABELS.EDIT.DIALOG.DESCRIPTION}
        cancelText={JOB_ITEM_TYPE_LABELS.EDIT.DIALOG.CANCEL}
        confirmText={JOB_ITEM_TYPE_LABELS.EDIT.DIALOG.CONFIRM}
        onCancel={handleDialogCancel}
        onConfirm={handleConfirmSubmit}
        isLoading={isPending}
      />
    </div>
  );
}
