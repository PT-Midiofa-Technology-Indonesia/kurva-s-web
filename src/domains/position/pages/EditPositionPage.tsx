'use client';

import { useParams } from 'next/navigation';
import { FormPageSkeleton } from '@/components/templates';
import { ItemNotFound } from '@/shared/components/molecules';
import { ConfirmDialog } from '@/shared/components/molecules/AlertDialog';
import { PageHeader } from '@/shared/components/molecules/PageHeader';
import { PositionForm } from '../components/PositionForm';
import { POSITION_LABELS } from '../constants';
import { useEditPositionPage } from '../hooks/use-edit-position-page';

export function EditPositionPage() {
  const { id: positionId } = useParams<{ id: string }>();
  const {
    position,
    isLoading,
    isDialogOpen,
    setIsDialogOpen,
    isPending,
    serverErrors,
    handleCancel,
    handleBeforeSubmit,
    handleConfirmSubmit,
    handleDialogCancel,
  } = useEditPositionPage(positionId);

  if (isLoading) {
    return <FormPageSkeleton />;
  }

  if (!position) {
    return <ItemNotFound message={POSITION_LABELS.EDIT.NOT_FOUND} />;
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <PageHeader title={POSITION_LABELS.EDIT.PAGE_TITLE} onBack={handleCancel} />

      <PositionForm
        mode="edit"
        position={position}
        onSubmit={handleBeforeSubmit}
        onCancel={handleCancel}
        isSubmitting={isPending}
        serverErrors={serverErrors}
      />

      <ConfirmDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        variant="default"
        title={POSITION_LABELS.EDIT.DIALOG.TITLE}
        description={POSITION_LABELS.EDIT.DIALOG.DESCRIPTION}
        cancelText={POSITION_LABELS.EDIT.DIALOG.CANCEL}
        confirmText={POSITION_LABELS.EDIT.DIALOG.CONFIRM}
        onCancel={handleDialogCancel}
        onConfirm={handleConfirmSubmit}
        isLoading={isPending}
      />
    </div>
  );
}
