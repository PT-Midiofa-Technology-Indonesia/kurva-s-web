'use client';

import { useParams } from 'next/navigation';
import { FormPageSkeleton } from '@/components/templates';
import { ItemNotFound } from '@/shared/components/molecules';
import { ConfirmDialog } from '@/shared/components/molecules/AlertDialog';
import { PageHeader } from '@/shared/components/molecules/PageHeader';

import { RoleForm } from '../components/RoleForm';
import { ROLE_LABELS } from '../constants';
import { useEditRolePage } from '../hooks/use-edit-role-page';

export function EditRolePage() {
  const params = useParams<{ roleId?: string }>();
  const resolvedRoleId = params.roleId ?? '';
  const {
    role,
    isLoading,
    isDialogOpen,
    setIsDialogOpen,
    isPending,
    serverErrors,
    handleCancel,
    handleBeforeSubmit,
    handleConfirmSubmit,
    handleDialogCancel,
  } = useEditRolePage(resolvedRoleId);

  if (isLoading) {
    return <FormPageSkeleton />;
  }

  if (!role) {
    return <ItemNotFound message={ROLE_LABELS.EDIT.NOT_FOUND} />;
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <PageHeader title={ROLE_LABELS.EDIT.PAGE_TITLE} onBack={handleCancel} />

      <RoleForm
        mode="edit"
        role={role}
        onSubmit={handleBeforeSubmit}
        onCancel={handleCancel}
        isSubmitting={isPending}
        serverErrors={serverErrors}
      />

      <ConfirmDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        variant="default"
        title={ROLE_LABELS.EDIT.DIALOG.TITLE}
        description={ROLE_LABELS.EDIT.DIALOG.DESCRIPTION}
        cancelText={ROLE_LABELS.EDIT.DIALOG.CANCEL}
        confirmText={ROLE_LABELS.EDIT.DIALOG.CONFIRM}
        onCancel={handleDialogCancel}
        onConfirm={handleConfirmSubmit}
        isLoading={isPending}
      />
    </div>
  );
}
