'use client';

import { useSearchParams } from 'next/navigation';
import { ConfirmDialog } from '@/shared/components/molecules/AlertDialog';
import { PageHeader } from '@/shared/components/molecules/PageHeader';
import { SkillCatalogForm } from '../components/SkillCatalogForm';
import { SKILL_CATALOG_LABELS } from '../constants';
import { useCreateSkillCatalogPage } from '../hooks/use-create-skill-catalog-page';
import { CreateSkillCategoryPageContent } from './CreateSkillCategoryPage';

export function CreateSkillCatalogPageContent() {
  const {
    isDialogOpen,
    setIsDialogOpen,
    isPending,
    serverErrors,
    handleCancel,
    handleBeforeSubmit,
    handleConfirmSubmit,
    handleDialogCancel,
  } = useCreateSkillCatalogPage();

  return (
    <div className="flex flex-col gap-6 p-6">
      <PageHeader title={SKILL_CATALOG_LABELS.CREATE.PAGE_TITLE} onBack={handleCancel} />

      <SkillCatalogForm
        onSubmit={handleBeforeSubmit}
        onCancel={handleCancel}
        isSubmitting={isPending}
        serverErrors={serverErrors}
      />

      <ConfirmDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        variant="default"
        title={SKILL_CATALOG_LABELS.CREATE.DIALOG.TITLE}
        description={SKILL_CATALOG_LABELS.CREATE.DIALOG.DESCRIPTION}
        cancelText={SKILL_CATALOG_LABELS.CREATE.DIALOG.CANCEL}
        confirmText={SKILL_CATALOG_LABELS.CREATE.DIALOG.CONFIRM}
        onCancel={handleDialogCancel}
        onConfirm={handleConfirmSubmit}
        isLoading={isPending}
      />
    </div>
  );
}

export function CreateSkillCatalogPage() {
  const searchParams = useSearchParams();
  const tab = searchParams.get('tab') ?? undefined;

  return tab === 'skill' ? <CreateSkillCatalogPageContent /> : <CreateSkillCategoryPageContent />;
}
