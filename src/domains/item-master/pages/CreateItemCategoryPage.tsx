'use client';

import { useSearchParams } from 'next/navigation';
import { ConfirmDialog } from '@/shared/components/molecules/AlertDialog';
import { PageHeader } from '@/shared/components/molecules/PageHeader';
import { ItemCategoryForm } from '../components/ItemCategoryForm';
import { ITEM_CATEGORY_LABELS, ITEM_MASTER_TABS } from '../constants';
import { useCreateItemCategoryPage } from '../hooks/use-create-item-category-page';
import { CreateItemCatalogPageContent } from './CreateItemCatalogPage';

export function CreateItemCategoryPageContent() {
  const {
    isDialogOpen,
    setIsDialogOpen,
    isPending,
    serverErrors,
    handleCancel,
    handleBeforeSubmit,
    handleConfirmSubmit,
    handleDialogCancel,
  } = useCreateItemCategoryPage();

  return (
    <div className="flex flex-col gap-6 p-6">
      <PageHeader title={ITEM_CATEGORY_LABELS.FORM.CREATE_TITLE} onBack={handleCancel} />

      <ItemCategoryForm
        onSubmit={handleBeforeSubmit as (payload: unknown) => void}
        onCancel={handleCancel}
        isSubmitting={isPending}
        serverErrors={serverErrors}
      />

      <ConfirmDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        variant="default"
        title={ITEM_CATEGORY_LABELS.DIALOG.CONFIRM_SAVE_TITLE}
        description={ITEM_CATEGORY_LABELS.DIALOG.CONFIRM_SAVE_DESCRIPTION}
        cancelText={ITEM_CATEGORY_LABELS.DIALOG.CANCEL}
        confirmText={ITEM_CATEGORY_LABELS.DIALOG.CONFIRM_SAVE}
        onCancel={handleDialogCancel}
        onConfirm={handleConfirmSubmit}
        isLoading={isPending}
      />
    </div>
  );
}

export function CreateItemCategoryPage() {
  const searchParams = useSearchParams();
  const tab = searchParams.get('tab') ?? undefined;

  return tab === ITEM_MASTER_TABS.ITEM_CATALOG ? (
    <CreateItemCatalogPageContent />
  ) : (
    <CreateItemCategoryPageContent />
  );
}
