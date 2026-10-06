'use client';

import { ConfirmDialog } from '@/shared/components/molecules/AlertDialog';
import { PageHeader } from '@/shared/components/molecules/PageHeader';
import { PositionForm } from '../components/PositionForm';
import { POSITION_LABELS } from '../constants';
import { useCreatePositionPage } from '../hooks/use-create-position-page';

export function CreatePositionPage() {
  const {
    isDialogOpen,
    setIsDialogOpen,
    isPending,
    serverErrors,
    handleCancel,
    handleBeforeSubmit,
    handleConfirmSubmit,
    handleDialogCancel,
  } = useCreatePositionPage();

  return (
    <div className="flex flex-col gap-6 p-6">
      <PageHeader title={POSITION_LABELS.CREATE.PAGE_TITLE} onBack={handleCancel} />

      <PositionForm
        onSubmit={handleBeforeSubmit as (payload: unknown) => void}
        onCancel={handleCancel}
        isSubmitting={isPending}
        serverErrors={serverErrors}
      />

      <ConfirmDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        variant="default"
        title={POSITION_LABELS.CREATE.DIALOG.TITLE}
        description={POSITION_LABELS.CREATE.DIALOG.DESCRIPTION}
        cancelText={POSITION_LABELS.CREATE.DIALOG.CANCEL}
        confirmText={POSITION_LABELS.CREATE.DIALOG.CONFIRM}
        onCancel={handleDialogCancel}
        onConfirm={handleConfirmSubmit}
        isLoading={isPending}
      />
    </div>
  );
}
