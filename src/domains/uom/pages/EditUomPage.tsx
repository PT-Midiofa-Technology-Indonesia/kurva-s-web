'use client';

import { useParams } from 'next/navigation';
import { ItemNotFound } from '@/shared/components/molecules';
import { ConfirmDialog } from '@/shared/components/molecules/AlertDialog';
import { PageHeader } from '@/shared/components/molecules/PageHeader';
import { FormPageSkeleton } from '@/shared/components/templates';
import { UomForm } from '../components/UomForm';
import { UOM_LABELS } from '../constants';
import { useEditUomPage } from '../hooks/use-edit-uom-page';
import { useUom } from '../hooks/use-uom';

export function EditUomPage() {
  const { id: uomId } = useParams<{ id: string }>();
  const { data: uomData, isLoading } = useUom(uomId);
  const {
    isDialogOpen,
    setIsDialogOpen,
    isPending,
    serverErrors,
    handleCancel,
    handleBeforeSubmit,
    handleConfirmSubmit,
    handleDialogCancel,
  } = useEditUomPage(uomId);

  if (isLoading) {
    return <FormPageSkeleton />;
  }

  const uom = uomData?.data ?? null;

  if (!uom) {
    return <ItemNotFound message={UOM_LABELS.EDIT.NOT_FOUND} />;
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <PageHeader title={UOM_LABELS.EDIT.PAGE_TITLE} onBack={handleCancel} />

      <UomForm
        mode="edit"
        uom={uom}
        onSubmit={handleBeforeSubmit as (payload: unknown) => void}
        onCancel={handleCancel}
        isSubmitting={isPending}
        serverErrors={serverErrors}
      />

      <ConfirmDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        variant="default"
        title={UOM_LABELS.EDIT.DIALOG.TITLE}
        description={UOM_LABELS.EDIT.DIALOG.DESCRIPTION}
        cancelText={UOM_LABELS.EDIT.DIALOG.CANCEL}
        confirmText={UOM_LABELS.EDIT.DIALOG.CONFIRM}
        onCancel={handleDialogCancel}
        onConfirm={handleConfirmSubmit}
        isLoading={isPending}
      />
    </div>
  );
}
