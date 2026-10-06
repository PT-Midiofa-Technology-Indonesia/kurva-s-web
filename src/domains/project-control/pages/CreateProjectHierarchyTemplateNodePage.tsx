'use client';

import { useParams, useSearchParams } from 'next/navigation';
import { ConfirmDialog } from '@/shared/components/molecules/AlertDialog';
import { PageHeader } from '@/shared/components/molecules/PageHeader';
import { CreatePositionForm } from '../components/CreatePositionForm';
import { CREATE_POSITION_PAGE_LABELS } from '../constants';
import { useCreateProjectHierarchyTemplateNodePage } from '../hooks/use-create-project-hierarchy-template-node-page';

export function CreateProjectHierarchyTemplateNodePage() {
  const params = useParams<{ id?: string }>();
  const searchParams = useSearchParams();
  const templateId = params.id ?? '';
  const resolvedPresetParentId = searchParams.get('parentId') ?? undefined;
  const resolvedPresetParentName = searchParams.get('parentName') ?? undefined;
  const {
    presetParentId = resolvedPresetParentId,
    presetParentName = resolvedPresetParentName,
    isDialogOpen,
    setIsDialogOpen,
    isPending,
    serverErrors,
    handleBack,
    handleBeforeSubmit,
    handleConfirmSubmit,
    handleDialogCancel,
  } = useCreateProjectHierarchyTemplateNodePage({ templateId });

  return (
    <div className="flex flex-col gap-6 p-6">
      <PageHeader title={CREATE_POSITION_PAGE_LABELS.PAGE_TITLE} onBack={handleBack} />

      <CreatePositionForm
        templateId={templateId}
        presetParentId={presetParentId}
        presetParentName={presetParentName}
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
