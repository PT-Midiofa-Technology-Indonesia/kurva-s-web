'use client';

import { useParams } from 'next/navigation';
import { FormPageSkeleton } from '@/components/templates';
import { ItemNotFound } from '@/shared/components/molecules';
import { ConfirmDialog } from '@/shared/components/molecules/AlertDialog';
import { PageHeader } from '@/shared/components/molecules/PageHeader';
import { EmployeeGradeForm } from '../components/EmployeeGradeForm';
import { EMPLOYEE_GRADE_LABELS } from '../constants';
import { useEditEmployeeGradePage } from '../hooks/use-edit-employee-grade-page';

export function EditEmployeeGradePage() {
  const { id: employeeGradeId } = useParams<{ id: string }>();
  const {
    employeeGrade,
    isLoading,
    isDialogOpen,
    setIsDialogOpen,
    isPending,
    serverErrors,
    handleCancel,
    handleBeforeSubmit,
    handleConfirmSubmit,
    handleDialogCancel,
  } = useEditEmployeeGradePage(employeeGradeId);

  if (isLoading) {
    return <FormPageSkeleton />;
  }

  if (!employeeGrade) {
    return <ItemNotFound message={EMPLOYEE_GRADE_LABELS.EDIT.NOT_FOUND} />;
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <PageHeader title={EMPLOYEE_GRADE_LABELS.EDIT.PAGE_TITLE} onBack={handleCancel} />

      <EmployeeGradeForm
        mode="edit"
        employeeGrade={employeeGrade}
        onSubmit={handleBeforeSubmit}
        onCancel={handleCancel}
        isSubmitting={isPending}
        serverErrors={serverErrors}
      />

      <ConfirmDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        variant="default"
        title={EMPLOYEE_GRADE_LABELS.EDIT.DIALOG.TITLE}
        description={EMPLOYEE_GRADE_LABELS.EDIT.DIALOG.DESCRIPTION}
        cancelText={EMPLOYEE_GRADE_LABELS.EDIT.DIALOG.CANCEL}
        confirmText={EMPLOYEE_GRADE_LABELS.EDIT.DIALOG.CONFIRM}
        onCancel={handleDialogCancel}
        onConfirm={handleConfirmSubmit}
        isLoading={isPending}
      />
    </div>
  );
}
