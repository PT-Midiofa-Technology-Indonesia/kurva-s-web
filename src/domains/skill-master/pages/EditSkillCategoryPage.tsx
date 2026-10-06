'use client';

import dynamic from 'next/dynamic';
import { useParams, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { ItemNotFound } from '@/shared/components/molecules';
import { PageHeader } from '@/shared/components/molecules/PageHeader';
import { FormPageSkeleton } from '@/shared/components/templates';
import { SkillCategoryForm } from '../components/SkillCategoryForm';
import { SKILL_CATEGORY_LABELS } from '../constants';
import { useEditSkillCategoryPage } from '../hooks/use-edit-skill-category-page';
import { EditSkillCatalogPageContent } from './EditSkillCatalogPage';

const ConfirmDialog = dynamic(
  () =>
    import('@/shared/components/molecules/AlertDialog').then((m) => ({ default: m.ConfirmDialog })),
  {
    loading: () => null,
    ssr: false,
  }
);

interface EditSkillCategoryPageProps {
  skillCategoryId?: string;
}

export function EditSkillCategoryPageContent({
  skillCategoryId: skillCategoryIdProp,
}: EditSkillCategoryPageProps) {
  const { id } = useParams<{ id: string }>();
  const skillCategoryId = skillCategoryIdProp ?? id;
  const {
    skillCategory,
    isDialogOpen,
    setIsDialogOpen,
    isPending,
    isLoading,
    serverErrors,
    handleCancel,
    handleBeforeSubmit,
    handleConfirmSubmit,
    handleDialogCancel,
  } = useEditSkillCategoryPage(skillCategoryId);

  const skillCategoryData = skillCategory?.data ?? null;

  if (isLoading) {
    return <FormPageSkeleton />;
  }

  if (!skillCategoryData) {
    return <ItemNotFound message={SKILL_CATEGORY_LABELS.EDIT.NOT_FOUND} />;
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <PageHeader title={SKILL_CATEGORY_LABELS.EDIT.PAGE_TITLE} onBack={handleCancel} />

      <SkillCategoryForm
        mode="edit"
        skillCategory={skillCategoryData}
        onSubmit={handleBeforeSubmit}
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
            title={SKILL_CATEGORY_LABELS.EDIT.DIALOG.TITLE}
            description={SKILL_CATEGORY_LABELS.EDIT.DIALOG.DESCRIPTION}
            cancelText={SKILL_CATEGORY_LABELS.EDIT.DIALOG.CANCEL}
            confirmText={SKILL_CATEGORY_LABELS.EDIT.DIALOG.CONFIRM}
            onCancel={handleDialogCancel}
            onConfirm={handleConfirmSubmit}
            isLoading={isPending}
          />
        </Suspense>
      )}
    </div>
  );
}

export function EditSkillCategoryPage(props: EditSkillCategoryPageProps) {
  const searchParams = useSearchParams();
  const tab = searchParams.get('tab') ?? undefined;

  return tab === 'skill' ? (
    <EditSkillCatalogPageContent skillCatalogId={props.skillCategoryId} />
  ) : (
    <EditSkillCategoryPageContent {...props} />
  );
}
