'use client';

import { useParams } from 'next/navigation';
import { FormPageSkeleton } from '@/components/templates';
import { ItemNotFound } from '@/shared/components/molecules';
import { ConfirmDialog } from '@/shared/components/molecules/AlertDialog';
import { PageHeader } from '@/shared/components/molecules/PageHeader';
import { EmployeeForm } from '../components/EmployeeForm';
import { MANPOWER_LABELS } from '../constants';
import { useEditEmployeePage } from '../hooks/use-edit-employee-page';

export function EditManpowerPage() {
  const params = useParams<{ id?: string }>();
  const resolvedEmployeeId = params.id ?? '';
  const {
    employee,
    isLoading,
    isUserLinked,
    isDialogOpen,
    setIsDialogOpen,
    isPending,
    serverErrors,
    handleCancel,
    handleBeforeSubmit,
    handleConfirmSubmit,
    handleDialogCancel,
  } = useEditEmployeePage(resolvedEmployeeId);

  if (isLoading) {
    return <FormPageSkeleton />;
  }

  if (!employee) {
    return <ItemNotFound message={MANPOWER_LABELS.EDIT.NOT_FOUND} />;
  }

  const dialogTitle = isUserLinked
    ? MANPOWER_LABELS.EDIT.DIALOG.USER_SYNC_TITLE
    : MANPOWER_LABELS.EDIT.DIALOG.TITLE;
  const dialogDescription = isUserLinked
    ? MANPOWER_LABELS.EDIT.DIALOG.USER_SYNC_DESCRIPTION
    : MANPOWER_LABELS.EDIT.DIALOG.DESCRIPTION;

  return (
    <div className="flex flex-col gap-6 p-6">
      <PageHeader title={MANPOWER_LABELS.EDIT.PAGE_TITLE} onBack={handleCancel} />

      <EmployeeForm
        mode="edit"
        employee={employee}
        onSubmit={handleBeforeSubmit}
        onCancel={handleCancel}
        isSubmitting={isPending}
        serverErrors={serverErrors}
      />

      <ConfirmDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        variant="default"
        title={dialogTitle}
        description={dialogDescription}
        cancelText={MANPOWER_LABELS.EDIT.DIALOG.CANCEL}
        confirmText={MANPOWER_LABELS.EDIT.DIALOG.CONFIRM}
        onCancel={handleDialogCancel}
        onConfirm={handleConfirmSubmit}
        isLoading={isPending}
      />
    </div>
  );
}
