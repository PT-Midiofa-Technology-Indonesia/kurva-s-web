'use client';

import { useSearchParams } from 'next/navigation';
import { ConfirmDialog } from '@/shared/components/molecules/AlertDialog';
import { PageHeader } from '@/shared/components/molecules/PageHeader';
import { ItemCatalogForm } from '../components/ItemCatalogForm';
import { ITEM_CATALOG_LABELS, ITEM_MASTER_TABS } from '../constants';
import { useCreateItemCatalogPage } from '../hooks/use-create-item-catalog-page';
import { CreateItemCategoryPageContent } from './CreateItemCategoryPage';

export function CreateItemCatalogPageContent() {
  const {
    isDialogOpen,
    setIsDialogOpen,
    isPending,
    serverErrors,
    handleCancel,
    handleBeforeSubmit,
    handleConfirmSubmit,
    handleDialogCancel,
  } = useCreateItemCatalogPage();

  return (
    <div className="flex flex-col gap-6 p-6">
      <PageHeader title={ITEM_CATALOG_LABELS.FORM.CREATE_TITLE} onBack={handleCancel} />

      <ItemCatalogForm
        onSubmit={handleBeforeSubmit as (payload: unknown) => void}
        onCancel={handleCancel}
        isSubmitting={isPending}
        serverErrors={serverErrors}
      />

      <ConfirmDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        variant="default"
        title={ITEM_CATALOG_LABELS.DIALOG.CONFIRM_SAVE_TITLE}
        description={ITEM_CATALOG_LABELS.DIALOG.CONFIRM_SAVE_DESCRIPTION}
        cancelText={ITEM_CATALOG_LABELS.DIALOG.CANCEL}
        confirmText={ITEM_CATALOG_LABELS.DIALOG.CONFIRM_SAVE}
        onCancel={handleDialogCancel}
        onConfirm={handleConfirmSubmit}
        isLoading={isPending}
      />
    </div>
  );
}

export function CreateItemCatalogPage() {
  const searchParams = useSearchParams();
  const tab = searchParams.get('tab') ?? undefined;

  return tab === ITEM_MASTER_TABS.ITEM_CATALOG ? (
    <CreateItemCatalogPageContent />
  ) : (
    <CreateItemCategoryPageContent />
  );
}
