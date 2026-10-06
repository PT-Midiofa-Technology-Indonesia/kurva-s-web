'use client';

import { ConfirmDialog } from '@/shared/components/molecules/AlertDialog';
import { PageHeader } from '@/shared/components/molecules/PageHeader';
import { EmployeeGradeForm } from '../components/EmployeeGradeForm';
import { EMPLOYEE_GRADE_LABELS } from '../constants';
import { useCreateEmployeeGradePage } from '../hooks/use-create-employee-grade-page';

export function CreateEmployeeGradePage() {
  const {
    isDialogOpen,
    setIsDialogOpen,
    isPending,
    serverErrors,
    handleCancel,
    handleBeforeSubmit,
    handleConfirmSubmit,
    handleDialogCancel,
  } = useCreateEmployeeGradePage();

  return (
    <div className="flex flex-col gap-6 p-6">
      <PageHeader title={EMPLOYEE_GRADE_LABELS.CREATE.PAGE_TITLE} onBack={handleCancel} />

      <EmployeeGradeForm
        onSubmit={handleBeforeSubmit as (payload: unknown) => void}
        onCancel={handleCancel}
        isSubmitting={isPending}
        serverErrors={serverErrors}
      />

      <ConfirmDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        variant="default"
        title={EMPLOYEE_GRADE_LABELS.CREATE.DIALOG.TITLE}
        description={EMPLOYEE_GRADE_LABELS.CREATE.DIALOG.DESCRIPTION}
        cancelText={EMPLOYEE_GRADE_LABELS.CREATE.DIALOG.CANCEL}
        confirmText={EMPLOYEE_GRADE_LABELS.CREATE.DIALOG.CONFIRM}
        onCancel={handleDialogCancel}
        onConfirm={handleConfirmSubmit}
        isLoading={isPending}
      />
    </div>
  );
}
