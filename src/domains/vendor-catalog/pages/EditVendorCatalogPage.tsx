'use client';

import { useParams } from 'next/navigation';
import { ItemNotFound } from '@/shared/components/molecules';
import { ConfirmDialog } from '@/shared/components/molecules/AlertDialog';
import { PageHeader } from '@/shared/components/molecules/PageHeader';
import { FormPageSkeleton } from '@/shared/components/templates';
import { VendorCatalogForm } from '../components/VendorCatalogForm';
import { VENDOR_CATALOG_LABELS } from '../constants';
import { useEditVendorCatalogPage } from '../hooks/use-edit-vendor-catalog-page';
import { useVendorCatalog } from '../hooks/use-vendor-catalog';

export function EditVendorCatalogPage() {
  const params = useParams<{ id?: string }>();
  const resolvedId = params.id ?? '';
  const { data: vendorData, isLoading } = useVendorCatalog(resolvedId);
  const {
    isDialogOpen,
    setIsDialogOpen,
    isPending,
    serverErrors,
    handleCancel,
    handleBeforeSubmit,
    handleConfirmSubmit,
    handleDialogCancel,
  } = useEditVendorCatalogPage(resolvedId);

  if (isLoading) {
    return <FormPageSkeleton />;
  }

  const vendor = vendorData?.data ?? null;

  if (!vendor) {
    return <ItemNotFound message={VENDOR_CATALOG_LABELS.EDIT.NOT_FOUND} />;
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <PageHeader title={VENDOR_CATALOG_LABELS.EDIT.PAGE_TITLE} onBack={handleCancel} />

      <VendorCatalogForm
        mode="edit"
        vendor={vendor}
        onSubmit={handleBeforeSubmit as (payload: unknown) => void}
        onCancel={handleCancel}
        isSubmitting={isPending}
        serverErrors={serverErrors}
      />

      <ConfirmDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        variant="default"
        title={VENDOR_CATALOG_LABELS.EDIT.DIALOG.TITLE}
        description={VENDOR_CATALOG_LABELS.EDIT.DIALOG.DESCRIPTION}
        cancelText={VENDOR_CATALOG_LABELS.EDIT.DIALOG.CANCEL}
        confirmText={VENDOR_CATALOG_LABELS.EDIT.DIALOG.CONFIRM}
        onCancel={handleDialogCancel}
        onConfirm={handleConfirmSubmit}
        isLoading={isPending}
      />
    </div>
  );
}
