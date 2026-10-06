'use client';

import { Pencil, Trash2 } from 'lucide-react';
import { useParams } from 'next/navigation';
import { Button } from '@/shared/components/atoms';
import { ItemNotFound } from '@/shared/components/molecules';
import { ConfirmDialog } from '@/shared/components/molecules/AlertDialog';
import { PageHeader } from '@/shared/components/molecules/PageHeader';
import { FormPageSkeleton } from '@/shared/components/templates';
import { RoleForm } from '../components/RoleForm';
import { ROLE_LABELS } from '../constants';
import { useDetailRolePage } from '../hooks/use-detail-role-page';

export function DetailRolePage() {
  const params = useParams<{ roleId?: string }>();
  const resolvedRoleId = params.roleId ?? '';
  const {
    role,
    isLoading,
    isDeleting,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    handleBack,
    handleEdit,
    handleDeleteConfirm,
  } = useDetailRolePage(resolvedRoleId);

  if (isLoading) {
    return <FormPageSkeleton />;
  }

  if (!role) {
    return <ItemNotFound message={ROLE_LABELS.DETAIL.NOT_FOUND} onBack={handleBack} />;
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <PageHeader
        title={ROLE_LABELS.DETAIL.PAGE_TITLE}
        onBack={handleBack}
        actions={
          <>
            <Button variant="outline" onClick={handleEdit} className="h-9 px-4 text-sm gap-2">
              <Pencil className="h-4 w-4" />
              {ROLE_LABELS.DETAIL.BUTTONS.EDIT}
            </Button>
            <Button
              variant="destructive"
              onClick={() => setIsDeleteDialogOpen(true)}
              className="h-9 px-4 text-sm gap-2"
            >
              <Trash2 className="h-4 w-4" />
              {ROLE_LABELS.DETAIL.BUTTONS.DELETE}
            </Button>
          </>
        }
      />

      <RoleForm mode="detail" role={role} />

      <ConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        variant="danger"
        title={ROLE_LABELS.DETAIL.DELETE_DIALOG.TITLE}
        description={ROLE_LABELS.DETAIL.DELETE_DIALOG.DESCRIPTION}
        cancelText={ROLE_LABELS.DETAIL.DELETE_DIALOG.CANCEL}
        confirmText={ROLE_LABELS.DETAIL.DELETE_DIALOG.CONFIRM}
        onCancel={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        isLoading={isDeleting}
      />
    </div>
  );
}
