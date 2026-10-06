'use client';

import { useParams, useSearchParams } from 'next/navigation';
import { FormPageSkeleton } from '@/components/templates';
import { ItemNotFound } from '@/shared/components/molecules';
import { ConfirmDialog } from '@/shared/components/molecules/AlertDialog';
import { PageHeader } from '@/shared/components/molecules/PageHeader';
import { ItemCategoryForm } from '../components/ItemCategoryForm';
import { ITEM_CATEGORY_LABELS, ITEM_MASTER_TABS } from '../constants';
import { useEditItemCategoryPage } from '../hooks/use-edit-item-category-page';
import { EditItemCatalogPageContent } from './EditItemCatalogPage';

interface EditItemCategoryPageProps {
  itemCategoryId?: string;
}

export function EditItemCategoryPageContent({
  itemCategoryId: itemCategoryIdProp,
}: EditItemCategoryPageProps) {
  const { id } = useParams<{ id: string }>();
  const itemCategoryId = itemCategoryIdProp ?? id;
  const {
    itemCategory,
    isLoadingItemCategory,
    isDialogOpen,
    setIsDialogOpen,
    isPending,
    serverErrors,
    handleCancel,
    handleBeforeSubmit,
    handleConfirmSubmit,
    handleDialogCancel,
  } = useEditItemCategoryPage(itemCategoryId);

  if (isLoadingItemCategory) {
    return <FormPageSkeleton />;
  }

  if (!itemCategory) {
    return <ItemNotFound message={ITEM_CATEGORY_LABELS.FORM.NOT_FOUND} />;
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <PageHeader title={ITEM_CATEGORY_LABELS.FORM.EDIT_TITLE} onBack={handleCancel} />

      <ItemCategoryForm
        mode="edit"
        itemCategory={itemCategory as any}
        onSubmit={handleBeforeSubmit as (payload: unknown) => void}
        onCancel={handleCancel}
        isSubmitting={isPending}
        serverErrors={serverErrors}
      />

      <ConfirmDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        variant="default"
        title={ITEM_CATEGORY_LABELS.DIALOG.CONFIRM_EDIT_TITLE}
        description={ITEM_CATEGORY_LABELS.DIALOG.CONFIRM_EDIT_DESCRIPTION}
        cancelText={ITEM_CATEGORY_LABELS.DIALOG.CANCEL}
        confirmText={ITEM_CATEGORY_LABELS.DIALOG.CONFIRM_SAVE}
        onCancel={handleDialogCancel}
        onConfirm={handleConfirmSubmit}
        isLoading={isPending}
      />
    </div>
  );
}

export function EditItemCategoryPage(props: EditItemCategoryPageProps) {
  const searchParams = useSearchParams();
  const tab = searchParams.get('tab') ?? undefined;

  return tab === ITEM_MASTER_TABS.ITEM_CATALOG ? (
    <EditItemCatalogPageContent itemCatalogId={props.itemCategoryId} />
  ) : (
    <EditItemCategoryPageContent {...props} />
  );
}
