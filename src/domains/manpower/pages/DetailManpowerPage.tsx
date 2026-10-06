'use client';

import { Trash2 } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useParams, useRouter } from 'next/navigation';
import { Suspense, useState } from 'react';
import { Button } from '@/components/atoms';
import { ItemNotFound, PageHeader } from '@/shared/components/molecules';
import { Tabs } from '@/shared/components/molecules/Tabs';
import { useQueryParams } from '@/shared/hooks/use-query-params';
import { EmployeeDetailInfo } from '../components/EmployeeDetailInfo';
import { EmployeeOtherSettings } from '../components/EmployeeOtherSettings';
import { EmployeeOtherSettingsForm } from '../components/EmployeeOtherSettingsForm';
import { EmployeePayrollSettings } from '../components/EmployeePayrollSettings';
import { EmployeePayrollSettingsForm } from '../components/EmployeePayrollSettingsForm';
import { EmployeePositionAssignmentForm } from '../components/EmployeePositionAssignmentForm';
import { EmployeePositionAssignments } from '../components/EmployeePositionAssignments';
import { EmployeeRatingSummary } from '../components/EmployeeRatingSummary';
import { EmployeeRatingTab } from '../components/EmployeeRatingTab';
import { EmployeeSkillSettings } from '../components/EmployeeSkillSettings';
import { EmployeeWorkplaceSettings } from '../components/EmployeeWorkplaceSettings';
import { MANPOWER_LABELS } from '../constants';
import { useDeleteEmployee } from '../hooks/use-delete-employee';
import { useEmployee } from '../hooks/use-employee';
import { useEmployeePositionAssignments } from '../hooks/use-employee-position-assignments';

const ConfirmDialogDynamic = dynamic(
  () =>
    import('@/shared/components/molecules/AlertDialog').then((m) => ({
      default: m.ConfirmDialog,
    })),
  { ssr: false, loading: () => null }
);

export function DetailManpowerPage() {
  const params = useParams<{ id?: string }>();
  const resolvedEmployeeId = params.id ?? '';
  const router = useRouter();
  const { queryParams } = useQueryParams<{ companyId?: string }>();
  const companyId = queryParams.companyId;
  const { data: employee, isLoading, refetch } = useEmployee(resolvedEmployeeId, companyId);
  const {
    data: positionAssignments = [],
    isLoading: isLoadingAssignments,
    refetch: refetchAssignments,
  } = useEmployeePositionAssignments(resolvedEmployeeId, companyId);
  const { mutate: deleteEmployee, isPending: isDeleting } = useDeleteEmployee(companyId);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isPositionFormOpen, setIsPositionFormOpen] = useState(false);
  const [isOtherSettingsFormOpen, setIsOtherSettingsFormOpen] = useState(false);
  const [isPayrollSettingsFormOpen, setIsPayrollSettingsFormOpen] = useState(false);

  const labels = MANPOWER_LABELS.DETAIL;

  const handleBack = () => router.push('/human-resource/manpower');
  const handleEdit = () => {
    const url = companyId
      ? `/human-resource/manpower/${resolvedEmployeeId}/edit?companyId=${companyId}`
      : `/human-resource/manpower/${resolvedEmployeeId}/edit`;
    router.push(url);
  };

  const handleDelete = () => {
    deleteEmployee(resolvedEmployeeId, {
      onSuccess: () => router.push('/human-resource/manpower'),
    });
  };

  const handleFormSuccess = () => {
    refetch();
    refetchAssignments();
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 p-6">
        <div className="h-10 w-48 animate-pulse rounded bg-slate-200" />
        <div className="h-96 animate-pulse rounded-lg bg-slate-100" />
        <div className="h-48 animate-pulse rounded-lg bg-slate-100" />
        <div className="h-32 animate-pulse rounded-lg bg-slate-100" />
      </div>
    );
  }

  if (!employee) {
    return <ItemNotFound message={labels.NOT_FOUND} onBack={handleBack} />;
  }

  const tabItems = [
    {
      key: 'company-position',
      label: labels.POSITION_CARD_TITLE,
      content: (
        <div className="p-6">
          <EmployeePositionAssignments
            assignments={positionAssignments}
            isLoading={isLoadingAssignments}
            employeeId={resolvedEmployeeId}
            onSetting={() => setIsPositionFormOpen(true)}
          />
        </div>
      ),
    },
    {
      key: 'skill-settings',
      label: 'Pengaturan Skill',
      content: (
        <div className="p-6">
          <EmployeeSkillSettings employeeId={resolvedEmployeeId} companyId={companyId} />
        </div>
      ),
    },
    {
      key: 'workplace-settings',
      label: 'Pengaturan Work Place',
      content: (
        <div className="p-6">
          <EmployeeWorkplaceSettings employeeId={resolvedEmployeeId} companyId={companyId} />
        </div>
      ),
    },
    {
      key: 'payroll-settings',
      label: 'Pengaturan Payroll',
      content: (
        <div className="p-6">
          <EmployeePayrollSettings
            employee={employee}
            onSetting={() => setIsPayrollSettingsFormOpen(true)}
          />
        </div>
      ),
    },
    {
      key: 'other-settings',
      label: labels.OTHER_SETTINGS_CARD_TITLE,
      content: (
        <div className="p-6">
          <EmployeeOtherSettings
            employee={employee}
            onSetting={() => setIsOtherSettingsFormOpen(true)}
          />
        </div>
      ),
    },
    {
      key: 'rating',
      label: labels.RATING.TITLE,
      content: (
        <div className="p-6">
          <EmployeeRatingTab employeeId={resolvedEmployeeId} />
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6 p-6">
      <PageHeader
        title={labels.PAGE_TITLE}
        onBack={handleBack}
        actions={
          <Button
            variant="destructive"
            onClick={() => setIsDeleteOpen(true)}
            className="h-9 px-4 text-sm gap-2"
          >
            <Trash2 className="h-4 w-4" />
            {labels.BUTTONS.DELETE}
          </Button>
        }
      />

      <EmployeeDetailInfo
        employee={employee}
        onEdit={handleEdit}
        onStatusChanged={refetch}
        companyId={companyId}
      />

      <EmployeeRatingSummary employeeId={resolvedEmployeeId} />

      <div className="rounded-lg border bg-white">
        <Tabs items={tabItems} defaultActiveKey="company-position" />
      </div>

      <EmployeePositionAssignmentForm
        open={isPositionFormOpen}
        onClose={() => setIsPositionFormOpen(false)}
        employeeId={resolvedEmployeeId}
        existingAssignments={positionAssignments}
        onSuccess={handleFormSuccess}
        companyId={companyId}
      />

      <EmployeeOtherSettingsForm
        open={isOtherSettingsFormOpen}
        onClose={() => setIsOtherSettingsFormOpen(false)}
        employee={employee}
        onSuccess={refetch}
        companyId={companyId}
      />

      <EmployeePayrollSettingsForm
        open={isPayrollSettingsFormOpen}
        onClose={() => setIsPayrollSettingsFormOpen(false)}
        employee={employee}
        onSuccess={refetch}
        companyId={companyId}
      />

      <Suspense fallback={null}>
        {isDeleteOpen && (
          <ConfirmDialogDynamic
            open={isDeleteOpen}
            onOpenChange={setIsDeleteOpen}
            variant="danger"
            title={labels.DIALOG.DELETE_TITLE}
            description={labels.DIALOG.DELETE_DESCRIPTION}
            cancelText={labels.DIALOG.DELETE_CANCEL}
            confirmText={labels.DIALOG.DELETE_CONFIRM}
            onCancel={() => setIsDeleteOpen(false)}
            onConfirm={handleDelete}
            isLoading={isDeleting}
          />
        )}
      </Suspense>
    </div>
  );
}
