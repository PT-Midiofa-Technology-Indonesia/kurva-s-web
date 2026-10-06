'use client';

import { useParams } from 'next/navigation';
import { FormPageSkeleton } from '@/components/templates';
import { ItemNotFound } from '@/shared/components/molecules';
import { ConfirmDialog } from '@/shared/components/molecules/AlertDialog';
import { PageHeader } from '@/shared/components/molecules/PageHeader';
import { AssetCategoryForm } from '../components/AssetCategoryForm';
import { ASSET_CATEGORY_LABELS } from '../constants';
import { useEditAssetCategoryPage } from '../hooks/use-edit-asset-category-page';

export function EditAssetCategoryPage() {
  const params = useParams<{ id?: string }>();
  const resolvedAssetCategoryId = params.id ?? '';
  const {
    assetCategory,
    isLoadingAssetCategory,
    isDialogOpen,
    setIsDialogOpen,
    isPending,
    serverErrors,
    handleCancel,
    handleBeforeSubmit,
    handleConfirmSubmit,
    handleDialogCancel,
  } = useEditAssetCategoryPage(resolvedAssetCategoryId);

  if (isLoadingAssetCategory) {
    return <FormPageSkeleton />;
  }

  if (!assetCategory) {
    return <ItemNotFound message={ASSET_CATEGORY_LABELS.FORM.NOT_FOUND} />;
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <PageHeader title={ASSET_CATEGORY_LABELS.FORM.EDIT_TITLE} onBack={handleCancel} />

      <AssetCategoryForm
        mode="edit"
        assetCategory={assetCategory}
        onSubmit={handleBeforeSubmit as (payload: unknown) => void}
        onCancel={handleCancel}
        isSubmitting={isPending}
        serverErrors={serverErrors}
      />

      <ConfirmDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        variant="default"
        title={ASSET_CATEGORY_LABELS.DIALOG.CONFIRM_EDIT_TITLE}
        description={ASSET_CATEGORY_LABELS.DIALOG.CONFIRM_EDIT_DESCRIPTION}
        cancelText={ASSET_CATEGORY_LABELS.DIALOG.CANCEL}
        confirmText={ASSET_CATEGORY_LABELS.DIALOG.CONFIRM_SAVE}
        onCancel={handleDialogCancel}
        onConfirm={handleConfirmSubmit}
        isLoading={isPending}
      />
    </div>
  );
}
