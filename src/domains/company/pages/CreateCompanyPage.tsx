'use client';

import { ConfirmDialog } from '@/shared/components/molecules/AlertDialog';
import { PageHeader } from '@/shared/components/molecules/PageHeader';

import { CompanyForm } from '../components/CompanyForm';
import { COMPANY_LABELS } from '../constants';
import { useCreateCompanyPage } from '../hooks/use-create-company-page';

export function CreateCompanyPage() {
  const {
    isDialogOpen,
    setIsDialogOpen,
    isPending,
    serverErrors,
    handleCancel,
    handleBeforeSubmit,
    handleConfirmSubmit,
    handleDialogCancel,
  } = useCreateCompanyPage();

  return (
    <div className="flex flex-col gap-6 p-6">
      <PageHeader title={COMPANY_LABELS.CREATE.PAGE_TITLE} onBack={handleCancel} />

      <CompanyForm
        onSubmit={handleBeforeSubmit as (payload: unknown) => void}
        onCancel={handleCancel}
        isSubmitting={isPending}
        serverErrors={serverErrors}
      />

      <ConfirmDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        variant="default"
        title={COMPANY_LABELS.CREATE.DIALOG.TITLE}
        description={COMPANY_LABELS.CREATE.DIALOG.DESCRIPTION}
        cancelText={COMPANY_LABELS.CREATE.DIALOG.CANCEL}
        confirmText={COMPANY_LABELS.CREATE.DIALOG.CONFIRM}
        onCancel={handleDialogCancel}
        onConfirm={handleConfirmSubmit}
        isLoading={isPending}
      />
    </div>
  );
}
