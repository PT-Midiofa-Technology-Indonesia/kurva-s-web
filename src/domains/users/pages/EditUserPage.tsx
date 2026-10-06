'use client';

import { useParams } from 'next/navigation';
import { FormPageSkeleton } from '@/components/templates';
import { ItemNotFound } from '@/shared/components/molecules';
import { ConfirmDialog } from '@/shared/components/molecules/AlertDialog';
import { PageHeader } from '@/shared/components/molecules/PageHeader';

import { UserForm } from '../components/UserForm';
import { USER_LABELS } from '../constants';
import { useEditUserPage } from '../hooks/use-edit-user-page';

export function EditUserPage() {
  const params = useParams<{ userId?: string }>();
  const resolvedUserId = params.userId ?? '';
  const {
    user,
    isLoading,
    isDialogOpen,
    setIsDialogOpen,
    isPending,
    serverErrors,
    handleCancel,
    handleBeforeSubmit,
    handleConfirmSubmit,
    handleDialogCancel,
  } = useEditUserPage(resolvedUserId);

  if (isLoading) {
    return <FormPageSkeleton />;
  }

  if (!user) {
    return <ItemNotFound message={USER_LABELS.EDIT.NOT_FOUND} />;
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <PageHeader title={USER_LABELS.EDIT.PAGE_TITLE} onBack={handleCancel} />

      <UserForm
        mode="edit"
        user={user}
        onSubmit={handleBeforeSubmit}
        onCancel={handleCancel}
        isSubmitting={isPending}
        serverErrors={serverErrors}
      />

      <ConfirmDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        variant="default"
        title={USER_LABELS.EDIT.DIALOG.TITLE}
        description={USER_LABELS.EDIT.DIALOG.DESCRIPTION}
        cancelText={USER_LABELS.EDIT.DIALOG.CANCEL}
        confirmText={USER_LABELS.EDIT.DIALOG.CONFIRM}
        onCancel={handleDialogCancel}
        onConfirm={handleConfirmSubmit}
        isLoading={isPending}
      />
    </div>
  );
}
