'use client';

import dynamic from 'next/dynamic';
import { useParams } from 'next/navigation';
import { Suspense } from 'react';
import { FormPageSkeleton } from '@/components/templates';
import { ItemNotFound } from '@/shared/components/molecules';
import { PageHeader } from '@/shared/components/molecules/PageHeader';

const ConfirmDialog = dynamic(
  () =>
    import('@/shared/components/molecules/AlertDialog').then((m) => ({ default: m.ConfirmDialog })),
  {
    loading: () => null,
    ssr: false,
  }
);

import { ProjectTypeForm } from '../components/ProjectTypeForm';
import { PROJECT_TYPE_LABELS } from '../constants';
import { useEditProjectTypePage } from '../hooks/use-edit-project-type-page';

export function EditProjectTypePage() {
  const { id: projectTypeId } = useParams<{ id: string }>();
  const {
    projectType,
    isLoading,
    isDialogOpen,
    setIsDialogOpen,
    isPending,
    serverErrors,
    handleCancel,
    handleBeforeSubmit,
    handleConfirmSubmit,
    handleDialogCancel,
  } = useEditProjectTypePage(projectTypeId);

  if (isLoading) {
    return <FormPageSkeleton />;
  }

  if (!projectType) {
    return <ItemNotFound message={PROJECT_TYPE_LABELS.EDIT.NOT_FOUND} />;
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <PageHeader title={PROJECT_TYPE_LABELS.EDIT.PAGE_TITLE} onBack={handleCancel} />

      <ProjectTypeForm
        mode="edit"
        projectType={projectType}
        onSubmit={handleBeforeSubmit}
        onCancel={handleCancel}
        isSubmitting={isPending}
        serverErrors={serverErrors}
      />

      {isDialogOpen && (
        <Suspense fallback={null}>
          <ConfirmDialog
            open={isDialogOpen}
            onOpenChange={setIsDialogOpen}
            variant="default"
            title={PROJECT_TYPE_LABELS.EDIT.DIALOG.TITLE}
            description={PROJECT_TYPE_LABELS.EDIT.DIALOG.DESCRIPTION}
            cancelText={PROJECT_TYPE_LABELS.EDIT.DIALOG.CANCEL}
            confirmText={PROJECT_TYPE_LABELS.EDIT.DIALOG.CONFIRM}
            onCancel={handleDialogCancel}
            onConfirm={handleConfirmSubmit}
            isLoading={isPending}
          />
        </Suspense>
      )}
    </div>
  );
}
