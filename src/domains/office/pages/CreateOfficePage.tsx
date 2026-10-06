'use client';

import { ConfirmDialog } from '@/shared/components/molecules/AlertDialog';
import { PageHeader } from '@/shared/components/molecules/PageHeader';

import { OfficeForm } from '../components/OfficeForm';
import { OFFICE_LABELS } from '../constants';
import { useCreateOfficePage } from '../hooks/use-create-office-page';

export function CreateOfficePage() {
  const {
    isDialogOpen,
    setIsDialogOpen,
    isPending,
    serverErrors,
    handleCancel,
    handleBeforeSubmit,
    handleConfirmSubmit,
    handleDialogCancel,
  } = useCreateOfficePage();

  return (
    <div className="flex flex-col gap-6 p-6">
      <PageHeader title={OFFICE_LABELS.CREATE.PAGE_TITLE} onBack={handleCancel} />

      <OfficeForm
        onSubmit={handleBeforeSubmit as (payload: unknown) => void}
        onCancel={handleCancel}
        isSubmitting={isPending}
        serverErrors={serverErrors}
      />

      <ConfirmDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        variant="default"
        title={OFFICE_LABELS.CREATE.DIALOG.TITLE}
        description={OFFICE_LABELS.CREATE.DIALOG.DESCRIPTION}
        cancelText={OFFICE_LABELS.CREATE.DIALOG.CANCEL}
        confirmText={OFFICE_LABELS.CREATE.DIALOG.CONFIRM}
        onCancel={handleDialogCancel}
        onConfirm={handleConfirmSubmit}
        isLoading={isPending}
      />
    </div>
  );
}
