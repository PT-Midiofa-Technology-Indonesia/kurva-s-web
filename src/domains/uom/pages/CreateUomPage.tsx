'use client';

import { ConfirmDialog } from '@/shared/components/molecules/AlertDialog';
import { PageHeader } from '@/shared/components/molecules/PageHeader';
import { UomForm } from '../components/UomForm';
import { UOM_LABELS } from '../constants';
import { useCreateUomPage } from '../hooks/use-create-uom-page';

export function CreateUomPage() {
  const {
    isDialogOpen,
    setIsDialogOpen,
    isPending,
    serverErrors,
    handleCancel,
    handleBeforeSubmit,
    handleConfirmSubmit,
    handleDialogCancel,
  } = useCreateUomPage();

  return (
    <div className="flex flex-col gap-6 p-6">
      <PageHeader title={UOM_LABELS.CREATE.PAGE_TITLE} onBack={handleCancel} />

      <UomForm
        onSubmit={handleBeforeSubmit as (payload: unknown) => void}
        onCancel={handleCancel}
        isSubmitting={isPending}
        serverErrors={serverErrors}
      />

      <ConfirmDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        variant="default"
        title={UOM_LABELS.CREATE.DIALOG.TITLE}
        description={UOM_LABELS.CREATE.DIALOG.DESCRIPTION}
        cancelText={UOM_LABELS.CREATE.DIALOG.CANCEL}
        confirmText={UOM_LABELS.CREATE.DIALOG.CONFIRM}
        onCancel={handleDialogCancel}
        onConfirm={handleConfirmSubmit}
        isLoading={isPending}
      />
    </div>
  );
}
