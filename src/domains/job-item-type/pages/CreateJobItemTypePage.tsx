'use client';

import { ConfirmDialog } from '@/shared/components/molecules/AlertDialog';
import { PageHeader } from '@/shared/components/molecules/PageHeader';

import { JobItemTypeForm } from '../components/JobItemTypeForm';
import { JOB_ITEM_TYPE_LABELS } from '../constants';
import { useCreateJobItemTypePage } from '../hooks/use-create-job-item-type-page';

export function CreateJobItemTypePage() {
  const {
    isDialogOpen,
    setIsDialogOpen,
    isPending,
    serverErrors,
    handleCancel,
    handleBeforeSubmit,
    handleConfirmSubmit,
    handleDialogCancel,
  } = useCreateJobItemTypePage();

  return (
    <div className="flex flex-col gap-6 p-6">
      <PageHeader title={JOB_ITEM_TYPE_LABELS.CREATE.PAGE_TITLE} onBack={handleCancel} />

      <JobItemTypeForm
        onSubmit={handleBeforeSubmit as (payload: unknown) => void}
        onCancel={handleCancel}
        isSubmitting={isPending}
        serverErrors={serverErrors}
      />

      <ConfirmDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        variant="default"
        title={JOB_ITEM_TYPE_LABELS.CREATE.DIALOG.TITLE}
        description={JOB_ITEM_TYPE_LABELS.CREATE.DIALOG.DESCRIPTION}
        cancelText={JOB_ITEM_TYPE_LABELS.CREATE.DIALOG.CANCEL}
        confirmText={JOB_ITEM_TYPE_LABELS.CREATE.DIALOG.CONFIRM}
        onCancel={handleDialogCancel}
        onConfirm={handleConfirmSubmit}
        isLoading={isPending}
      />
    </div>
  );
}
