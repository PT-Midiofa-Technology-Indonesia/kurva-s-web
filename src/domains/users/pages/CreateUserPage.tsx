'use client';

import { ConfirmDialog } from '@/shared/components/molecules/AlertDialog';
import { PageHeader } from '@/shared/components/molecules/PageHeader';

import { UserForm } from '../components/UserForm';
import { USER_LABELS } from '../constants';
import { useCreateUserPage } from '../hooks/use-create-user-page';

export function CreateUserPage() {
  const {
    isDialogOpen,
    setIsDialogOpen,
    isPending,
    serverErrors,
    handleCancel,
    handleBeforeSubmit,
    handleConfirmSubmit,
    handleDialogCancel,
  } = useCreateUserPage();

  return (
    <div className="flex flex-col gap-6 p-6">
      <PageHeader title={USER_LABELS.CREATE.PAGE_TITLE} onBack={handleCancel} />

      <UserForm
        onSubmit={handleBeforeSubmit}
        onCancel={handleCancel}
        isSubmitting={isPending}
        serverErrors={serverErrors}
      />

      <ConfirmDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        variant="default"
        title={USER_LABELS.CREATE.DIALOG.TITLE}
        description={USER_LABELS.CREATE.DIALOG.DESCRIPTION}
        cancelText={USER_LABELS.CREATE.DIALOG.CANCEL}
        confirmText={USER_LABELS.CREATE.DIALOG.CONFIRM}
        onCancel={handleDialogCancel}
        onConfirm={handleConfirmSubmit}
        isLoading={isPending}
      />
    </div>
  );
}
