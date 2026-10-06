'use client';

import { useParams } from 'next/navigation';
import { FormPageSkeleton } from '@/components/templates';
import { ItemNotFound } from '@/shared/components/molecules';
import { ConfirmDialog } from '@/shared/components/molecules/AlertDialog';
import { PageHeader } from '@/shared/components/molecules/PageHeader';
import { DocumentTypeForm } from '../components/DocumentTypeForm';
import { DOCUMENT_TYPE_LABELS } from '../constants';
import { useEditDocumentTypePage } from '../hooks/use-edit-document-type-page';

export function EditDocumentTypePage() {
  const { id: documentTypeId } = useParams<{ id: string }>();
  const {
    documentType,
    isLoading,
    isDialogOpen,
    setIsDialogOpen,
    isPending,
    serverErrors,
    handleCancel,
    handleBeforeSubmit,
    handleConfirmSubmit,
    handleDialogCancel,
  } = useEditDocumentTypePage(documentTypeId);

  if (isLoading) {
    return <FormPageSkeleton />;
  }

  if (!documentType) {
    return <ItemNotFound message={DOCUMENT_TYPE_LABELS.EDIT.NOT_FOUND} />;
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <PageHeader title={DOCUMENT_TYPE_LABELS.EDIT.PAGE_TITLE} onBack={handleCancel} />

      <DocumentTypeForm
        mode="edit"
        documentType={documentType}
        onSubmit={handleBeforeSubmit}
        onCancel={handleCancel}
        isSubmitting={isPending}
        serverErrors={serverErrors}
      />

      <ConfirmDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        variant="default"
        title={DOCUMENT_TYPE_LABELS.EDIT.DIALOG.TITLE}
        description={DOCUMENT_TYPE_LABELS.EDIT.DIALOG.DESCRIPTION}
        cancelText={DOCUMENT_TYPE_LABELS.EDIT.DIALOG.CANCEL}
        confirmText={DOCUMENT_TYPE_LABELS.EDIT.DIALOG.CONFIRM}
        onCancel={handleDialogCancel}
        onConfirm={handleConfirmSubmit}
        isLoading={isPending}
      />
    </div>
  );
}
