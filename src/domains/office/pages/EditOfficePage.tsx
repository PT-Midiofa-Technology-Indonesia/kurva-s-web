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

import { OfficeForm } from '../components/OfficeForm';
import { OFFICE_LABELS } from '../constants';
import { useEditOfficePage } from '../hooks/use-edit-office-page';

export function EditOfficePage() {
  const { id: officeId } = useParams<{ id: string }>();
  const {
    office,
    isLoading,
    isDialogOpen,
    setIsDialogOpen,
    isPending,
    serverErrors,
    handleCancel,
    handleBeforeSubmit,
    handleConfirmSubmit,
    handleDialogCancel,
  } = useEditOfficePage(officeId);

  if (isLoading) {
    return <FormPageSkeleton />;
  }

  if (!office) {
    return <ItemNotFound message={OFFICE_LABELS.EDIT.NOT_FOUND} />;
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <PageHeader title={OFFICE_LABELS.EDIT.PAGE_TITLE} onBack={handleCancel} />

      <OfficeForm
        mode="edit"
        office={office}
        onSubmit={handleBeforeSubmit as (payload: unknown) => void}
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
            title={OFFICE_LABELS.EDIT.DIALOG.TITLE}
            description={OFFICE_LABELS.EDIT.DIALOG.DESCRIPTION}
            cancelText={OFFICE_LABELS.EDIT.DIALOG.CANCEL}
            confirmText={OFFICE_LABELS.EDIT.DIALOG.CONFIRM}
            onCancel={handleDialogCancel}
            onConfirm={handleConfirmSubmit}
            isLoading={isPending}
          />
        </Suspense>
      )}
    </div>
  );
}
