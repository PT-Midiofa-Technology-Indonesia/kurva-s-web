'use client';

import { ConfirmDialog } from '@/shared/components/molecules/AlertDialog';
import { PageHeader } from '@/shared/components/molecules/PageHeader';

import { ProjectCapabilityForm } from '../components/ProjectCapabilityForm';
import { PROJECT_CAPABILITY_LABELS } from '../constants';
import { useCreateProjectCapabilityPage } from '../hooks/use-create-project-capability-page';

export function CreateProjectCapabilityPage() {
  const {
    isDialogOpen,
    setIsDialogOpen,
    isPending,
    serverErrors,
    handleCancel,
    handleBeforeSubmit,
    handleConfirmSubmit,
    handleDialogCancel,
  } = useCreateProjectCapabilityPage();

  return (
    <div className="flex flex-col gap-6 p-6">
      <PageHeader title={PROJECT_CAPABILITY_LABELS.CREATE.PAGE_TITLE} onBack={handleCancel} />

      <ProjectCapabilityForm
        onSubmit={handleBeforeSubmit as (payload: unknown) => void}
        onCancel={handleCancel}
        isSubmitting={isPending}
        serverErrors={serverErrors}
      />

      <ConfirmDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        variant="default"
        title={PROJECT_CAPABILITY_LABELS.CREATE.DIALOG.TITLE}
        description={PROJECT_CAPABILITY_LABELS.CREATE.DIALOG.DESCRIPTION}
        cancelText={PROJECT_CAPABILITY_LABELS.CREATE.DIALOG.CANCEL}
        confirmText={PROJECT_CAPABILITY_LABELS.CREATE.DIALOG.CONFIRM}
        onCancel={handleDialogCancel}
        onConfirm={handleConfirmSubmit}
        isLoading={isPending}
      />
    </div>
  );
}
