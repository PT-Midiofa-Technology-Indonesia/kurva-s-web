'use client';

import { ConfirmDialog } from '@/shared/components/molecules/AlertDialog';
import { PageHeader } from '@/shared/components/molecules/PageHeader';

import { WarehouseForm } from '../components/WarehouseForm';
import { WAREHOUSE_LABELS } from '../constants';
import { useCreateWarehousePage } from '../hooks/use-create-warehouse-page';

export function CreateWarehousePage() {
  const {
    isDialogOpen,
    setIsDialogOpen,
    isPending,
    serverErrors,
    handleCancel,
    handleBeforeSubmit,
    handleConfirmSubmit,
    handleDialogCancel,
  } = useCreateWarehousePage();

  return (
    <div className="flex flex-col gap-6 p-6">
      <PageHeader title={WAREHOUSE_LABELS.CREATE.PAGE_TITLE} onBack={handleCancel} />

      <WarehouseForm
        onSubmit={handleBeforeSubmit as (payload: unknown) => void}
        onCancel={handleCancel}
        isSubmitting={isPending}
        serverErrors={serverErrors}
      />

      <ConfirmDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        variant="default"
        title={WAREHOUSE_LABELS.CREATE.DIALOG.TITLE}
        description={WAREHOUSE_LABELS.CREATE.DIALOG.DESCRIPTION}
        cancelText={WAREHOUSE_LABELS.CREATE.DIALOG.CANCEL}
        confirmText={WAREHOUSE_LABELS.CREATE.DIALOG.CONFIRM}
        onCancel={handleDialogCancel}
        onConfirm={handleConfirmSubmit}
        isLoading={isPending}
      />
    </div>
  );
}
