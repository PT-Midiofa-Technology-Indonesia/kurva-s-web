'use client';

import { useParams } from 'next/navigation';
import { FormPageSkeleton } from '@/components/templates';
import { ItemNotFound } from '@/shared/components/molecules';
import { ConfirmDialog } from '@/shared/components/molecules/AlertDialog';
import { PageHeader } from '@/shared/components/molecules/PageHeader';

import { CostItemTypeForm } from '../components/CostItemTypeForm';
import { COST_ITEM_TYPE_LABELS } from '../constants';
import { useEditCostItemTypePage } from '../hooks/use-edit-cost-item-type-page';

export function EditCostItemTypePage() {
  const { id: resolvedCostItemTypeId } = useParams<{ id: string }>();
  const {
    costItemType,
    isLoading,
    isDialogOpen,
    setIsDialogOpen,
    isPending,
    serverErrors,
    handleCancel,
    handleBeforeSubmit,
    handleConfirmSubmit,
    handleDialogCancel,
  } = useEditCostItemTypePage(resolvedCostItemTypeId);

  if (isLoading) {
    return <FormPageSkeleton />;
  }

  if (!costItemType) {
    return <ItemNotFound message={COST_ITEM_TYPE_LABELS.EDIT.NOT_FOUND} />;
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <PageHeader title={COST_ITEM_TYPE_LABELS.EDIT.PAGE_TITLE} onBack={handleCancel} />

      <CostItemTypeForm
        mode="edit"
        costItemType={costItemType}
        onSubmit={handleBeforeSubmit as (payload: unknown) => void}
        onCancel={handleCancel}
        isSubmitting={isPending}
        serverErrors={serverErrors}
      />

      <ConfirmDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        variant="default"
        title={COST_ITEM_TYPE_LABELS.EDIT.DIALOG.TITLE}
        description={COST_ITEM_TYPE_LABELS.EDIT.DIALOG.DESCRIPTION}
        cancelText={COST_ITEM_TYPE_LABELS.EDIT.DIALOG.CANCEL}
        confirmText={COST_ITEM_TYPE_LABELS.EDIT.DIALOG.CONFIRM}
        onCancel={handleDialogCancel}
        onConfirm={handleConfirmSubmit}
        isLoading={isPending}
      />
    </div>
  );
}
