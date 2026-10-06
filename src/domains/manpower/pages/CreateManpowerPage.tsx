'use client';

import { ConfirmDialog } from '@/shared/components/molecules/AlertDialog';
import { PageHeader } from '@/shared/components/molecules/PageHeader';

import { EmployeeForm } from '../components/EmployeeForm';
import { MANPOWER_LABELS } from '../constants';
import { useCreateEmployeePage } from '../hooks/use-create-employee-page';

export function CreateManpowerPage() {
  const {
    isDialogOpen,
    setIsDialogOpen,
    isPending,
    serverErrors,
    handleCancel,
    handleBeforeSubmit,
    handleConfirmSubmit,
    handleDialogCancel,
  } = useCreateEmployeePage();

  return (
    <div className="flex flex-col gap-6 p-6">
      <PageHeader title={MANPOWER_LABELS.CREATE.PAGE_TITLE} onBack={handleCancel} />

      <EmployeeForm
        onSubmit={handleBeforeSubmit as (payload: unknown) => void}
        onCancel={handleCancel}
        isSubmitting={isPending}
        serverErrors={serverErrors}
      />

      <ConfirmDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        variant="default"
        title={MANPOWER_LABELS.CREATE.DIALOG.TITLE}
        description={MANPOWER_LABELS.CREATE.DIALOG.DESCRIPTION}
        cancelText={MANPOWER_LABELS.CREATE.DIALOG.CANCEL}
        confirmText={MANPOWER_LABELS.CREATE.DIALOG.CONFIRM}
        onCancel={handleDialogCancel}
        onConfirm={handleConfirmSubmit}
        isLoading={isPending}
      />
    </div>
  );
}
