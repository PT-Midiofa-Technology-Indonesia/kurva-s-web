'use client';

import { ConfirmDialog } from '@/shared/components/molecules/AlertDialog';
import { PageHeader } from '@/shared/components/molecules/PageHeader';

import { CostItemTypeForm } from '../components/CostItemTypeForm';
import { COST_ITEM_TYPE_LABELS } from '../constants';
import { useCreateCostItemTypePage } from '../hooks/use-create-cost-item-type-page';

export function CreateCostItemTypePage() {
  const {
    isDialogOpen,
    setIsDialogOpen,
    isPending,
    serverErrors,
    handleCancel,
    handleBeforeSubmit,
    handleConfirmSubmit,
    handleDialogCancel,
  } = useCreateCostItemTypePage();

  return (
    <div className="flex flex-col gap-6 p-6">
      <PageHeader title={COST_ITEM_TYPE_LABELS.CREATE.PAGE_TITLE} onBack={handleCancel} />

      <CostItemTypeForm
        onSubmit={handleBeforeSubmit as (payload: unknown) => void}
        onCancel={handleCancel}
        isSubmitting={isPending}
        serverErrors={serverErrors}
      />

      <ConfirmDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        variant="default"
        title={COST_ITEM_TYPE_LABELS.CREATE.DIALOG.TITLE}
        description={COST_ITEM_TYPE_LABELS.CREATE.DIALOG.DESCRIPTION}
        cancelText={COST_ITEM_TYPE_LABELS.CREATE.DIALOG.CANCEL}
        confirmText={COST_ITEM_TYPE_LABELS.CREATE.DIALOG.CONFIRM}
        onCancel={handleDialogCancel}
        onConfirm={handleConfirmSubmit}
        isLoading={isPending}
      />
    </div>
  );
}
