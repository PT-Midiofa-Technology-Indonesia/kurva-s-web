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

import { WarehouseForm } from '../components/WarehouseForm';
import { WAREHOUSE_LABELS } from '../constants';
import { useEditWarehousePage } from '../hooks/use-edit-warehouse-page';

export function EditWarehousePage() {
  const params = useParams<Record<string, string>>();
  const warehouseId = params.id;
  const {
    warehouse,
    isLoading,
    isDialogOpen,
    setIsDialogOpen,
    isPending,
    serverErrors,
    handleCancel,
    handleBeforeSubmit,
    handleConfirmSubmit,
    handleDialogCancel,
  } = useEditWarehousePage(warehouseId);

  if (isLoading) {
    return <FormPageSkeleton />;
  }

  if (!warehouse) {
    return <ItemNotFound message={WAREHOUSE_LABELS.EDIT.NOT_FOUND} />;
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <PageHeader title={WAREHOUSE_LABELS.EDIT.PAGE_TITLE} onBack={handleCancel} />

      <WarehouseForm
        mode="edit"
        warehouse={warehouse}
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
            title={WAREHOUSE_LABELS.EDIT.DIALOG.TITLE}
            description={WAREHOUSE_LABELS.EDIT.DIALOG.DESCRIPTION}
            cancelText={WAREHOUSE_LABELS.EDIT.DIALOG.CANCEL}
            confirmText={WAREHOUSE_LABELS.EDIT.DIALOG.CONFIRM}
            onCancel={handleDialogCancel}
            onConfirm={handleConfirmSubmit}
            isLoading={isPending}
          />
        </Suspense>
      )}
    </div>
  );
}
