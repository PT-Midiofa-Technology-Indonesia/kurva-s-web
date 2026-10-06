'use client';

import { useParams } from 'next/navigation';
import { ConfirmDialog } from '@/shared/components/molecules/AlertDialog';
import { PageHeader } from '@/shared/components/molecules/PageHeader';
import { FormPageSkeleton } from '@/shared/components/templates/FormPageSkeleton/FormPageSkeleton';
import { CreateProjectPositionForm } from '../components/CreateProjectPositionForm';
import { EDIT_POSITION_PAGE_LABELS } from '../constants';
import { useEditProjectHierarchyNodePage } from '../hooks/use-edit-project-hierarchy-node-page';

export function EditProjectHierarchyNodePage() {
  const params = useParams<{ id?: string; nodeId?: string }>();
  const projectId = params.id ?? '';
  const nodeId = params.nodeId ?? '';
  const {
    initialValues,
    initialPermissions,
    isDialogOpen,
    setIsDialogOpen,
    isPending,
    isLoadingNode,
    serverErrors,
    handleBack,
    handleBeforeSubmit,
    handleConfirmSubmit,
    handleDialogCancel,
  } = useEditProjectHierarchyNodePage({ projectId, nodeId });

  if (isLoadingNode) {
    return <FormPageSkeleton fields={5} />;
  }

  if (!initialValues) {
    return (
      <div className="flex items-center justify-center py-10 text-red-500">
        Node tidak ditemukan.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <PageHeader title={EDIT_POSITION_PAGE_LABELS.PAGE_TITLE} onBack={handleBack} />

      <CreateProjectPositionForm
        projectId={projectId}
        nodeId={nodeId}
        onSubmit={handleBeforeSubmit}
        onCancel={handleBack}
        isSubmitting={isPending}
        serverErrors={serverErrors}
        initialValues={initialValues}
        initialPermissions={initialPermissions}
        submitLabel={EDIT_POSITION_PAGE_LABELS.DIALOG.CONFIRM}
      />

      <ConfirmDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        variant="default"
        title={EDIT_POSITION_PAGE_LABELS.DIALOG.TITLE}
        description={EDIT_POSITION_PAGE_LABELS.DIALOG.DESCRIPTION}
        cancelText={EDIT_POSITION_PAGE_LABELS.DIALOG.CANCEL}
        confirmText={EDIT_POSITION_PAGE_LABELS.DIALOG.CONFIRM}
        onCancel={handleDialogCancel}
        onConfirm={handleConfirmSubmit}
        isLoading={isPending}
      />
    </div>
  );
}
