'use client';

import { ConfirmDialog } from '@/shared/components/molecules/AlertDialog';
import { PageHeader } from '@/shared/components/molecules/PageHeader';
import { VendorCatalogForm } from '../components/VendorCatalogForm';
import { VENDOR_CATALOG_LABELS } from '../constants';
import { useCreateVendorCatalogPage } from '../hooks/use-create-vendor-catalog-page';

export function CreateVendorCatalogPage() {
  const {
    isDialogOpen,
    setIsDialogOpen,
    isPending,
    serverErrors,
    handleCancel,
    handleBeforeSubmit,
    handleConfirmSubmit,
    handleDialogCancel,
  } = useCreateVendorCatalogPage();

  return (
    <div className="flex flex-col gap-6 p-6">
      <PageHeader title={VENDOR_CATALOG_LABELS.CREATE.PAGE_TITLE} onBack={handleCancel} />

      <VendorCatalogForm
        onSubmit={handleBeforeSubmit as (payload: unknown) => void}
        onCancel={handleCancel}
        isSubmitting={isPending}
        serverErrors={serverErrors}
      />

      <ConfirmDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        variant="default"
        title={VENDOR_CATALOG_LABELS.CREATE.DIALOG.TITLE}
        description={VENDOR_CATALOG_LABELS.CREATE.DIALOG.DESCRIPTION}
        cancelText={VENDOR_CATALOG_LABELS.CREATE.DIALOG.CANCEL}
        confirmText={VENDOR_CATALOG_LABELS.CREATE.DIALOG.CONFIRM}
        onCancel={handleDialogCancel}
        onConfirm={handleConfirmSubmit}
        isLoading={isPending}
      />
    </div>
  );
}
