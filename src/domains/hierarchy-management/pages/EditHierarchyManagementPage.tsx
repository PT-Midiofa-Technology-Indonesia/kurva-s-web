'use client';

import { InfoIcon } from 'lucide-react';
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

import { HierarchyManagementForm } from '../components/HierarchyManagementForm';
import { HIERARCHY_MANAGEMENT_LABELS } from '../constants';
import { useEditHierarchyManagementPage } from '../hooks/use-edit-hierarchy-management-page';

export function EditHierarchyManagementPage() {
  const { id: hierarchyManagementId } = useParams<{ id: string }>();
  const {
    hierarchyManagement,
    isLoading,
    isDialogOpen,
    setIsDialogOpen,
    isPending,
    serverErrors,
    handleCancel,
    handleBeforeSubmit,
    handleConfirmSubmit,
    handleDialogCancel,
  } = useEditHierarchyManagementPage(hierarchyManagementId);

  const companyDisplayName = hierarchyManagement?.company?.name;

  if (isLoading) {
    return <FormPageSkeleton />;
  }

  if (!hierarchyManagement) {
    return <ItemNotFound message={HIERARCHY_MANAGEMENT_LABELS.EDIT.NOT_FOUND} />;
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <PageHeader title={HIERARCHY_MANAGEMENT_LABELS.EDIT.PAGE_TITLE} onBack={handleCancel} />

      {companyDisplayName && (
        <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
          <InfoIcon className="h-4 w-4 shrink-0 text-slate-400" />
          <span>
            {HIERARCHY_MANAGEMENT_LABELS.EDIT.COMPANY_BANNER} <strong>{companyDisplayName}</strong>
          </span>
        </div>
      )}

      <HierarchyManagementForm
        mode="edit"
        hierarchyManagement={hierarchyManagement}
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
            title={HIERARCHY_MANAGEMENT_LABELS.EDIT.DIALOG.TITLE}
            description={HIERARCHY_MANAGEMENT_LABELS.EDIT.DIALOG.DESCRIPTION}
            cancelText={HIERARCHY_MANAGEMENT_LABELS.EDIT.DIALOG.CANCEL}
            confirmText={HIERARCHY_MANAGEMENT_LABELS.EDIT.DIALOG.CONFIRM}
            onCancel={handleDialogCancel}
            onConfirm={handleConfirmSubmit}
            isLoading={isPending}
          />
        </Suspense>
      )}
    </div>
  );
}
