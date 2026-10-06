'use client';

import { useParams, useSearchParams } from 'next/navigation';
import { ConfirmDialog } from '@/shared/components/molecules/AlertDialog';
import { PageHeader } from '@/shared/components/molecules/PageHeader';
import { CreateProjectPositionForm } from '../components/CreateProjectPositionForm';
import { CREATE_POSITION_PAGE_LABELS } from '../constants';
import { useCreateProjectHierarchyNodePage } from '../hooks/use-create-project-hierarchy-node-page';

export function CreateProjectHierarchyNodePage() {
  const params = useParams<{ id?: string }>();
  const searchParams = useSearchParams();
  const projectId = params.id ?? '';
  const presetParentId = searchParams.get('parentId') ?? undefined;
  const presetParentName = searchParams.get('parentName') ?? undefined;
  const {
    presetParentId: hookPresetParentId,
    presetParentName: hookPresetParentName,
    isDialogOpen,
    setIsDialogOpen,
    isPending,
    serverErrors,
    handleBack,
    handleBeforeSubmit,
    handleConfirmSubmit,
    handleDialogCancel,
  } = useCreateProjectHierarchyNodePage({ projectId });

  return (
    <div className="flex flex-col gap-6 p-6">
      <PageHeader title={CREATE_POSITION_PAGE_LABELS.PAGE_TITLE} onBack={handleBack} />

      <CreateProjectPositionForm
        projectId={projectId}
        presetParentId={presetParentId ?? hookPresetParentId}
        presetParentName={presetParentName ?? hookPresetParentName}
        onSubmit={handleBeforeSubmit}
        onCancel={handleBack}
        isSubmitting={isPending}
        serverErrors={serverErrors}
      />

      <ConfirmDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        variant="default"
        title={CREATE_POSITION_PAGE_LABELS.DIALOG.TITLE}
        description={CREATE_POSITION_PAGE_LABELS.DIALOG.DESCRIPTION}
        cancelText={CREATE_POSITION_PAGE_LABELS.DIALOG.CANCEL}
        confirmText={CREATE_POSITION_PAGE_LABELS.DIALOG.CONFIRM}
        onCancel={handleDialogCancel}
        onConfirm={handleConfirmSubmit}
        isLoading={isPending}
      />
    </div>
  );
}
