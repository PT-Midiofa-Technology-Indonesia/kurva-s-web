'use client';

import { ConfirmDialog } from '@/shared/components/molecules/AlertDialog';
import { PageHeader } from '@/shared/components/molecules/PageHeader';
import { AssetCategoryForm } from '../components/AssetCategoryForm';
import { ASSET_CATEGORY_LABELS } from '../constants';
import { useCreateAssetCategoryPage } from '../hooks/use-create-asset-category-page';

export function CreateAssetCategoryPage() {
  const {
    isDialogOpen,
    setIsDialogOpen,
    isPending,
    serverErrors,
    handleCancel,
    handleBeforeSubmit,
    handleConfirmSubmit,
    handleDialogCancel,
  } = useCreateAssetCategoryPage();

  return (
    <div className="flex flex-col gap-6 p-6">
      <PageHeader title={ASSET_CATEGORY_LABELS.FORM.CREATE_TITLE} onBack={handleCancel} />

      <AssetCategoryForm
        onSubmit={handleBeforeSubmit as (payload: unknown) => void}
        onCancel={handleCancel}
        isSubmitting={isPending}
        serverErrors={serverErrors}
      />

      <ConfirmDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        variant="default"
        title={ASSET_CATEGORY_LABELS.DIALOG.CONFIRM_SAVE_TITLE}
        description={ASSET_CATEGORY_LABELS.DIALOG.CONFIRM_SAVE_DESCRIPTION}
        cancelText={ASSET_CATEGORY_LABELS.DIALOG.CANCEL}
        confirmText={ASSET_CATEGORY_LABELS.DIALOG.CONFIRM_SAVE}
        onCancel={handleDialogCancel}
        onConfirm={handleConfirmSubmit}
        isLoading={isPending}
      />
    </div>
  );
}
