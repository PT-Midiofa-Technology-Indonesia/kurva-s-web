'use client';

import { useSearchParams } from 'next/navigation';
import { ConfirmDialog } from '@/shared/components/molecules/AlertDialog';
import { PageHeader } from '@/shared/components/molecules/PageHeader';
import { SkillCategoryForm } from '../components/SkillCategoryForm';
import { SKILL_CATEGORY_LABELS } from '../constants';
import { useCreateSkillCategoryPage } from '../hooks/use-create-skill-category-page';
import { CreateSkillCatalogPageContent } from './CreateSkillCatalogPage';

export function CreateSkillCategoryPageContent() {
  const {
    isDialogOpen,
    setIsDialogOpen,
    isPending,
    serverErrors,
    handleCancel,
    handleBeforeSubmit,
    handleConfirmSubmit,
    handleDialogCancel,
  } = useCreateSkillCategoryPage();

  return (
    <div className="flex flex-col gap-6 p-6">
      <PageHeader title={SKILL_CATEGORY_LABELS.CREATE.PAGE_TITLE} onBack={handleCancel} />

      <SkillCategoryForm
        onSubmit={handleBeforeSubmit}
        onCancel={handleCancel}
        isSubmitting={isPending}
        serverErrors={serverErrors}
      />

      <ConfirmDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        variant="default"
        title={SKILL_CATEGORY_LABELS.CREATE.DIALOG.TITLE}
        description={SKILL_CATEGORY_LABELS.CREATE.DIALOG.DESCRIPTION}
        cancelText={SKILL_CATEGORY_LABELS.CREATE.DIALOG.CANCEL}
        confirmText={SKILL_CATEGORY_LABELS.CREATE.DIALOG.CONFIRM}
        onCancel={handleDialogCancel}
        onConfirm={handleConfirmSubmit}
        isLoading={isPending}
      />
    </div>
  );
}

export function CreateSkillCategoryPage() {
  const searchParams = useSearchParams();
  const tab = searchParams.get('tab') ?? undefined;

  return tab === 'skill' ? <CreateSkillCatalogPageContent /> : <CreateSkillCategoryPageContent />;
}
