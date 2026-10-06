'use client';

import dynamic from 'next/dynamic';
import { useParams } from 'next/navigation';
import { Suspense } from 'react';
import { FormPageSkeleton } from '@/components/templates';
import { ItemNotFound } from '@/shared/components/molecules';
import { PageHeader } from '@/shared/components/molecules/PageHeader';

const ConfirmDialog = dynamic(
  () =>
    import('@/shared/components/molecules/AlertDialog').then((m) => ({ default: m.ConfirmDialog })),
  {
    loading: () => null,
    ssr: false,
  }
);

import { GroupForm } from '../components/GroupForm';
import { GROUP_LABELS } from '../constants';
import { useEditGroupPage } from '../hooks/use-edit-group-page';

export function EditGroupPage() {
  const { id: groupId } = useParams<{ id: string }>();
  const {
    group,
    isLoading,
    isDialogOpen,
    setIsDialogOpen,
    isPending,
    serverErrors,
    handleCancel,
    handleBeforeSubmit,
    handleConfirmSubmit,
    handleDialogCancel,
  } = useEditGroupPage(groupId);

  if (isLoading) {
    return <FormPageSkeleton />;
  }

  if (!group) {
    return <ItemNotFound message={GROUP_LABELS.EDIT.NOT_FOUND} />;
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <PageHeader title={GROUP_LABELS.EDIT.PAGE_TITLE} onBack={handleCancel} />

      <GroupForm
        group={group}
        onSubmit={handleBeforeSubmit}
        onCancel={handleCancel}
        isSubmitting={isPending}
        serverErrors={serverErrors}
      />

      {isDialogOpen && (
        <Suspense fallback={null}>
          <ConfirmDialog
            open={isDialogOpen}
            onOpenChange={setIsDialogOpen}
            variant="default"
            title={GROUP_LABELS.EDIT.DIALOG.TITLE}
            description={GROUP_LABELS.EDIT.DIALOG.DESCRIPTION}
            cancelText={GROUP_LABELS.EDIT.DIALOG.CANCEL}
            confirmText={GROUP_LABELS.EDIT.DIALOG.CONFIRM}
            onCancel={handleDialogCancel}
            onConfirm={handleConfirmSubmit}
            isLoading={isPending}
          />
        </Suspense>
      )}
    </div>
  );
}
