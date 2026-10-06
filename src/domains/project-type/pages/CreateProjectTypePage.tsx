'use client';

import { ConfirmDialog } from '@/shared/components/molecules/AlertDialog';
import { PageHeader } from '@/shared/components/molecules/PageHeader';

import { ProjectTypeForm } from '../components/ProjectTypeForm';
import { PROJECT_TYPE_LABELS } from '../constants';
import { useCreateProjectTypePage } from '../hooks/use-create-project-type-page';

export function CreateProjectTypePage() {
  const {
    isDialogOpen,
    setIsDialogOpen,
    isPending,
    serverErrors,
    handleCancel,
    handleBeforeSubmit,
    handleConfirmSubmit,
    handleDialogCancel,
  } = useCreateProjectTypePage();

  return (
    <div className="flex flex-col gap-6 p-6">
      <PageHeader title={PROJECT_TYPE_LABELS.CREATE.PAGE_TITLE} onBack={handleCancel} />

      <ProjectTypeForm
        onSubmit={handleBeforeSubmit as (payload: unknown) => void}
        onCancel={handleCancel}
        isSubmitting={isPending}
        serverErrors={serverErrors}
      />

      <ConfirmDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        variant="default"
        title={PROJECT_TYPE_LABELS.CREATE.DIALOG.TITLE}
        description={PROJECT_TYPE_LABELS.CREATE.DIALOG.DESCRIPTION}
        cancelText={PROJECT_TYPE_LABELS.CREATE.DIALOG.CANCEL}
        confirmText={PROJECT_TYPE_LABELS.CREATE.DIALOG.CONFIRM}
        onCancel={handleDialogCancel}
        onConfirm={handleConfirmSubmit}
        isLoading={isPending}
      />
    </div>
  );
}
