'use client';

import { ConfirmDialog } from '@/shared/components/molecules/AlertDialog';
import { PageHeader } from '@/shared/components/molecules/PageHeader';
import { DocumentTypeForm } from '../components/DocumentTypeForm';
import { DOCUMENT_TYPE_LABELS } from '../constants';
import { useCreateDocumentTypePage } from '../hooks/use-create-document-type-page';

export function CreateDocumentTypePage() {
  const {
    isDialogOpen,
    setIsDialogOpen,
    isPending,
    serverErrors,
    handleCancel,
    handleBeforeSubmit,
    handleConfirmSubmit,
    handleDialogCancel,
  } = useCreateDocumentTypePage();

  return (
    <div className="flex flex-col gap-6 p-6">
      <PageHeader title={DOCUMENT_TYPE_LABELS.CREATE.PAGE_TITLE} onBack={handleCancel} />

      <DocumentTypeForm
        onSubmit={handleBeforeSubmit as (payload: unknown) => void}
        onCancel={handleCancel}
        isSubmitting={isPending}
        serverErrors={serverErrors}
      />

      <ConfirmDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        variant="default"
        title={DOCUMENT_TYPE_LABELS.CREATE.DIALOG.TITLE}
        description={DOCUMENT_TYPE_LABELS.CREATE.DIALOG.DESCRIPTION}
        cancelText={DOCUMENT_TYPE_LABELS.CREATE.DIALOG.CANCEL}
        confirmText={DOCUMENT_TYPE_LABELS.CREATE.DIALOG.CONFIRM}
        onCancel={handleDialogCancel}
        onConfirm={handleConfirmSubmit}
        isLoading={isPending}
      />
    </div>
  );
}
