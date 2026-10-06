'use client';

import { ConfirmDialog } from '@/shared/components/molecules/AlertDialog';
import { PageHeader } from '@/shared/components/molecules/PageHeader';

import { RoleForm } from '../components/RoleForm';
import { ROLE_LABELS } from '../constants';
import { useCreateRolePage } from '../hooks/use-create-role-page';

export function CreateRolePage() {
  const {
    isDialogOpen,
    setIsDialogOpen,
    isPending,
    serverErrors,
    handleCancel,
    handleBeforeSubmit,
    handleConfirmSubmit,
    handleDialogCancel,
  } = useCreateRolePage();

  return (
    <div className="flex flex-col gap-6 p-6">
      <PageHeader title={ROLE_LABELS.CREATE.PAGE_TITLE} onBack={handleCancel} />

      <RoleForm
        mode="create"
        onSubmit={handleBeforeSubmit}
        onCancel={handleCancel}
        isSubmitting={isPending}
        serverErrors={serverErrors}
      />

      <ConfirmDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        variant="default"
        title={ROLE_LABELS.CREATE.DIALOG.TITLE}
        description={ROLE_LABELS.CREATE.DIALOG.DESCRIPTION}
        cancelText={ROLE_LABELS.CREATE.DIALOG.CANCEL}
        confirmText={ROLE_LABELS.CREATE.DIALOG.CONFIRM}
        onCancel={handleDialogCancel}
        onConfirm={handleConfirmSubmit}
        isLoading={isPending}
      />
    </div>
  );
}
