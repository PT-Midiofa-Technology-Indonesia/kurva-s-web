'use client';

import dynamic from 'next/dynamic';
import { useParams, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { ItemNotFound } from '@/shared/components/molecules';
import { PageHeader } from '@/shared/components/molecules/PageHeader';
import { FormPageSkeleton } from '@/shared/components/templates';
import { SkillCatalogForm } from '../components/SkillCatalogForm';
import { SKILL_CATALOG_LABELS } from '../constants';
import { useEditSkillCatalogPage } from '../hooks/use-edit-skill-catalog-page';
import { EditSkillCategoryPageContent } from './EditSkillCategoryPage';

const ConfirmDialog = dynamic(
  () =>
    import('@/shared/components/molecules/AlertDialog').then((m) => ({ default: m.ConfirmDialog })),
  {
    loading: () => null,
    ssr: false,
  }
);

interface EditSkillCatalogPageProps {
  skillCatalogId?: string;
}

export function EditSkillCatalogPageContent({
  skillCatalogId: skillCatalogIdProp,
}: EditSkillCatalogPageProps) {
  const { id } = useParams<{ id: string }>();
  const skillCatalogId = skillCatalogIdProp ?? id;
  const {
    skillCatalog,
    isDialogOpen,
    setIsDialogOpen,
    isPending,
    isLoading,
    serverErrors,
    handleCancel,
    handleBeforeSubmit,
    handleConfirmSubmit,
    handleDialogCancel,
  } = useEditSkillCatalogPage(skillCatalogId);

  const skillCatalogData = skillCatalog?.data ?? null;

  if (isLoading) {
    return <FormPageSkeleton />;
  }

  if (!skillCatalogData) {
    return <ItemNotFound message={SKILL_CATALOG_LABELS.EDIT.NOT_FOUND} />;
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <PageHeader title={SKILL_CATALOG_LABELS.EDIT.PAGE_TITLE} onBack={handleCancel} />

      <SkillCatalogForm
        mode="edit"
        skillCatalog={skillCatalogData}
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
            title={SKILL_CATALOG_LABELS.EDIT.DIALOG.TITLE}
            description={SKILL_CATALOG_LABELS.EDIT.DIALOG.DESCRIPTION}
            cancelText={SKILL_CATALOG_LABELS.EDIT.DIALOG.CANCEL}
            confirmText={SKILL_CATALOG_LABELS.EDIT.DIALOG.CONFIRM}
            onCancel={handleDialogCancel}
            onConfirm={handleConfirmSubmit}
            isLoading={isPending}
          />
        </Suspense>
      )}
    </div>
  );
}

export function EditSkillCatalogPage(props: EditSkillCatalogPageProps) {
  const searchParams = useSearchParams();
  const tab = searchParams.get('tab') ?? undefined;

  return tab === 'skill' ? (
    <EditSkillCatalogPageContent {...props} />
  ) : (
    <EditSkillCategoryPageContent skillCategoryId={props.skillCatalogId} />
  );
}
