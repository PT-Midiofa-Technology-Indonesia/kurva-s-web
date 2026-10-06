'use client';

import { Trash2 } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useParams, useRouter } from 'next/navigation';
import { Suspense, useState } from 'react';
import { Button } from '@/components/atoms';
import { ItemNotFound, PageHeader } from '@/shared/components/molecules';
import { AddDepartmentDrawer } from '../components/AddDepartmentDrawer';
import { CompanyDepartments } from '../components/CompanyDepartments';
import { CompanyDetailInfo } from '../components/CompanyDetailInfo';
import { COMPANY_LABELS } from '../constants';
import { useCompany } from '../hooks/use-company';
import { useDeleteCompany } from '../hooks/use-delete-company';
import { useUpdateCompany } from '../hooks/use-update-company';

const ConfirmDialogDynamic = dynamic(
  () =>
    import('@/shared/components/molecules/AlertDialog').then((m) => ({ default: m.ConfirmDialog })),
  { ssr: false, loading: () => null }
);

export function DetailCompanyPage() {
  const router = useRouter();
  const { id: companyId } = useParams<{ id: string }>();
  const { data: company, isLoading } = useCompany(companyId);
  const { mutate: updateCompany } = useUpdateCompany(companyId);
  const { mutate: deleteCompany } = useDeleteCompany();
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isAddDeptOpen, setIsAddDeptOpen] = useState(false);

  const handleBack = () => router.push('/organization/company');
  const handleEdit = () => router.push(`/organization/company/${companyId}/edit`);

  const handleStatusChange = (isActive: boolean) => {
    updateCompany({ isActive });
  };

  const handleDelete = () => {
    deleteCompany(companyId, {
      onSuccess: () => router.push('/organization/company'),
    });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 p-6">
        <div className="h-10 w-32 animate-pulse rounded bg-slate-200" />
        <div className="h-96 animate-pulse rounded-lg bg-slate-100" />
      </div>
    );
  }

  if (!company) {
    return <ItemNotFound message={COMPANY_LABELS.DETAIL.NOT_FOUND} onBack={handleBack} />;
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <PageHeader
        title={COMPANY_LABELS.DETAIL.PAGE_TITLE}
        onBack={handleBack}
        actions={
          <Button
            variant="destructive"
            onClick={() => setIsDeleteOpen(true)}
            className="h-9 px-4 text-sm gap-2"
          >
            <Trash2 className="h-4 w-4" />
            {COMPANY_LABELS.DETAIL.DELETE_BUTTON}
          </Button>
        }
      />

      <CompanyDetailInfo
        company={company}
        onEdit={handleEdit}
        onStatusChange={handleStatusChange}
      />

      <CompanyDepartments
        companyId={companyId}
        departments={company.departments ?? []}
        onAdd={() => setIsAddDeptOpen(true)}
      />

      <AddDepartmentDrawer
        open={isAddDeptOpen}
        onClose={() => setIsAddDeptOpen(false)}
        companyId={companyId}
        companyName={company.name}
        existingDepartments={company.departments ?? []}
      />

      <Suspense fallback={null}>
        {isDeleteOpen && (
          <ConfirmDialogDynamic
            open={isDeleteOpen}
            onOpenChange={setIsDeleteOpen}
            variant="danger"
            title={COMPANY_LABELS.DETAIL.DIALOG.DELETE_DIALOG.TITLE}
            description={COMPANY_LABELS.DETAIL.DIALOG.DELETE_DIALOG.DESCRIPTION}
            cancelText={COMPANY_LABELS.DETAIL.DIALOG.DELETE_DIALOG.CANCEL}
            confirmText={COMPANY_LABELS.DETAIL.DIALOG.DELETE_DIALOG.CONFIRM}
            onCancel={() => setIsDeleteOpen(false)}
            onConfirm={handleDelete}
          />
        )}
      </Suspense>
    </div>
  );
}
