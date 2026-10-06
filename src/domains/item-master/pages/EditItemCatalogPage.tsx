'use client';

import { useParams, useSearchParams } from 'next/navigation';
import { FormPageSkeleton } from '@/components/templates';
import { ItemNotFound } from '@/shared/components/molecules';
import { ConfirmDialog } from '@/shared/components/molecules/AlertDialog';
import { PageHeader } from '@/shared/components/molecules/PageHeader';
import { ItemCatalogForm } from '../components/ItemCatalogForm';
import { ITEM_CATALOG_LABELS, ITEM_MASTER_TABS } from '../constants';
import { useEditItemCatalogPage } from '../hooks/use-edit-item-catalog-page';
import { EditItemCategoryPageContent } from './EditItemCategoryPage';

interface EditItemCatalogPageProps {
  itemCatalogId?: string;
}

export function EditItemCatalogPageContent({
  itemCatalogId: itemCatalogIdProp,
}: EditItemCatalogPageProps) {
  const { id } = useParams<{ id: string }>();
  const itemCatalogId = itemCatalogIdProp ?? id;
  const {
    itemCatalog,
    isLoadingItemCatalog,
    isDialogOpen,
    setIsDialogOpen,
    isPending,
    serverErrors,
    handleCancel,
    handleBeforeSubmit,
    handleConfirmSubmit,
    handleDialogCancel,
  } = useEditItemCatalogPage(itemCatalogId);

  if (isLoadingItemCatalog) {
    return <FormPageSkeleton />;
  }

  if (!itemCatalog) {
    return <ItemNotFound message={ITEM_CATALOG_LABELS.FORM.NOT_FOUND} />;
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <PageHeader title={ITEM_CATALOG_LABELS.FORM.EDIT_TITLE} onBack={handleCancel} />

      <ItemCatalogForm
        mode="edit"
        itemCatalog={itemCatalog as any}
        onSubmit={handleBeforeSubmit as (payload: unknown) => void}
        onCancel={handleCancel}
        isSubmitting={isPending}
        serverErrors={serverErrors}
      />

      <ConfirmDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        variant="default"
        title={ITEM_CATALOG_LABELS.DIALOG.CONFIRM_EDIT_TITLE}
        description={ITEM_CATALOG_LABELS.DIALOG.CONFIRM_EDIT_DESCRIPTION}
        cancelText={ITEM_CATALOG_LABELS.DIALOG.CANCEL}
        confirmText={ITEM_CATALOG_LABELS.DIALOG.CONFIRM_SAVE}
        onCancel={handleDialogCancel}
        onConfirm={handleConfirmSubmit}
        isLoading={isPending}
      />
    </div>
  );
}

export function EditItemCatalogPage(props: EditItemCatalogPageProps) {
  const searchParams = useSearchParams();
  const tab = searchParams.get('tab') ?? undefined;

  return tab === ITEM_MASTER_TABS.ITEM_CATALOG ? (
    <EditItemCatalogPageContent {...props} />
  ) : (
    <EditItemCategoryPageContent itemCategoryId={props.itemCatalogId} />
  );
}
