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

import { CompanyForm } from '../components/CompanyForm';
import { COMPANY_LABELS } from '../constants';
import { useEditCompanyPage } from '../hooks/use-edit-company-page';

export function EditCompanyPage() {
  const { id: companyId } = useParams<{ id: string }>();
  const {
    company,
    isLoading,
    isDialogOpen,
    setIsDialogOpen,
    isPending,
    serverErrors,
    handleCancel,
    handleBeforeSubmit,
    handleConfirmSubmit,
    handleDialogCancel,
  } = useEditCompanyPage(companyId);

  if (isLoading) {
    return <FormPageSkeleton />;
  }

  if (!company) {
    return <ItemNotFound message={COMPANY_LABELS.EDIT.NOT_FOUND} />;
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <PageHeader title={COMPANY_LABELS.EDIT.PAGE_TITLE} onBack={handleCancel} />

      <CompanyForm
        mode="edit"
        company={company}
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
            title={COMPANY_LABELS.EDIT.DIALOG.TITLE}
            description={COMPANY_LABELS.EDIT.DIALOG.DESCRIPTION}
            cancelText={COMPANY_LABELS.EDIT.DIALOG.CANCEL}
            confirmText={COMPANY_LABELS.EDIT.DIALOG.CONFIRM}
            onCancel={handleDialogCancel}
            onConfirm={handleConfirmSubmit}
            isLoading={isPending}
          />
        </Suspense>
      )}
    </div>
  );
}
