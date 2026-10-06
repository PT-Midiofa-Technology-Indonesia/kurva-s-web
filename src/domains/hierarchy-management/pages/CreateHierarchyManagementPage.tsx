'use client';

import { ConfirmDialog } from '@/shared/components/molecules/AlertDialog';
import { PageHeader } from '@/shared/components/molecules/PageHeader';
import { HierarchyManagementForm } from '../components/HierarchyManagementForm';
import { HIERARCHY_MANAGEMENT_LABELS } from '../constants';
import { useCreateHierarchyManagementPage } from '../hooks/use-create-hierarchy-management-page';

export function CreateHierarchyManagementPage() {
  const {
    isDialogOpen,
    setIsDialogOpen,
    isPending,
    serverErrors,
    handleCancel,
    handleBeforeSubmit,
    handleConfirmSubmit,
    handleDialogCancel,
  } = useCreateHierarchyManagementPage();

  return (
    <div className="flex flex-col gap-6 p-6">
      <PageHeader title={HIERARCHY_MANAGEMENT_LABELS.CREATE.PAGE_TITLE} onBack={handleCancel} />

      <HierarchyManagementForm
        onSubmit={handleBeforeSubmit as (payload: unknown) => void}
        onCancel={handleCancel}
        isSubmitting={isPending}
        serverErrors={serverErrors}
      />

      <ConfirmDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        variant="default"
        title={HIERARCHY_MANAGEMENT_LABELS.CREATE.DIALOG.TITLE}
        description={HIERARCHY_MANAGEMENT_LABELS.CREATE.DIALOG.DESCRIPTION}
        cancelText={HIERARCHY_MANAGEMENT_LABELS.CREATE.DIALOG.CANCEL}
        confirmText={HIERARCHY_MANAGEMENT_LABELS.CREATE.DIALOG.CONFIRM}
        onCancel={handleDialogCancel}
        onConfirm={handleConfirmSubmit}
        isLoading={isPending}
      />
    </div>
  );
}
