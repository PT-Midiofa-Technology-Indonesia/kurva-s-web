'use client';

import { useParams } from 'next/navigation';
import { FormPageSkeleton } from '@/components/templates';
import { ItemNotFound } from '@/shared/components/molecules';
import { ConfirmDialog } from '@/shared/components/molecules/AlertDialog';
import { PageHeader } from '@/shared/components/molecules/PageHeader';

import { ProjectCapabilityForm } from '../components/ProjectCapabilityForm';
import { PROJECT_CAPABILITY_LABELS } from '../constants';
import { useEditProjectCapabilityPage } from '../hooks/use-edit-project-capability-page';

export function EditProjectCapabilityPage() {
  const { id: projectCapabilityId } = useParams<{ id: string }>();
  const {
    projectCapability,
    isLoading,
    isDialogOpen,
    setIsDialogOpen,
    isPending,
    serverErrors,
    handleCancel,
    handleBeforeSubmit,
    handleConfirmSubmit,
    handleDialogCancel,
  } = useEditProjectCapabilityPage(projectCapabilityId);

  if (isLoading) {
    return <FormPageSkeleton />;
  }

  if (!projectCapability) {
    return <ItemNotFound message={PROJECT_CAPABILITY_LABELS.EDIT.NOT_FOUND} />;
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <PageHeader title={PROJECT_CAPABILITY_LABELS.EDIT.PAGE_TITLE} onBack={handleCancel} />

      <ProjectCapabilityForm
        mode="edit"
        projectCapability={projectCapability}
        onSubmit={handleBeforeSubmit}
        onCancel={handleCancel}
        isSubmitting={isPending}
        serverErrors={serverErrors}
      />

      <ConfirmDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        variant="default"
        title={PROJECT_CAPABILITY_LABELS.EDIT.DIALOG.TITLE}
        description={PROJECT_CAPABILITY_LABELS.EDIT.DIALOG.DESCRIPTION}
        cancelText={PROJECT_CAPABILITY_LABELS.EDIT.DIALOG.CANCEL}
        confirmText={PROJECT_CAPABILITY_LABELS.EDIT.DIALOG.CONFIRM}
        onCancel={handleDialogCancel}
        onConfirm={handleConfirmSubmit}
        isLoading={isPending}
      />
    </div>
  );
}
