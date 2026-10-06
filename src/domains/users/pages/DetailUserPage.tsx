'use client';

import { Pencil, Trash2 } from 'lucide-react';
import { useParams } from 'next/navigation';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/shared/components/atoms';
import { ItemNotFound, PageHeader } from '@/shared/components/molecules';
import { ConfirmDialog } from '@/shared/components/molecules/AlertDialog';
import { FormPageSkeleton } from '@/shared/components/templates';
import { Separator } from '@/shared/components/ui';
import { formatPhone } from '@/shared/utils/masks';
import { USER_LABELS } from '../constants';
import { useDetailUserPage } from '../hooks/use-detail-user-page';

export function DetailUserPage() {
  const params = useParams<{ userId?: string }>();
  const resolvedUserId = params.userId ?? '';
  const {
    user,
    isLoading,
    isDeleting,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    isStatusDialogOpen,
    isUpdatingStatus,
    localActive,
    handleBack,
    handleEdit,
    handleDeleteConfirm,
    handleStatusToggle,
    handleStatusConfirm,
    handleStatusCancel,
  } = useDetailUserPage(resolvedUserId);

  if (isLoading) {
    return <FormPageSkeleton />;
  }

  if (!user) {
    return <ItemNotFound message={USER_LABELS.DETAIL.NOT_FOUND} onBack={handleBack} />;
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <PageHeader
        title={USER_LABELS.DETAIL.PAGE_TITLE}
        onBack={handleBack}
        actions={
          <>
            <Button variant="outline" onClick={handleEdit} className="h-9 px-4 text-sm gap-2">
              <Pencil className="h-4 w-4" />
              {USER_LABELS.DETAIL.EDIT_BUTTON}
            </Button>
            <Button
              variant="destructive"
              onClick={() => setIsDeleteDialogOpen(true)}
              className="h-9 px-4 text-sm gap-2"
            >
              <Trash2 className="h-4 w-4" />
              {USER_LABELS.DETAIL.DELETE_BUTTON}
            </Button>
          </>
        }
      />

      <div className="rounded-[14px] border border-slate-200 bg-white shadow-sm flex flex-col py-6 gap-6 px-6 w-2xl mx-auto">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-1">
            <Label className="text-sm font-normal text-slate-500 px-1">
              {USER_LABELS.DETAIL.FIELDS.NAME}
            </Label>
            <p className="text-sm font-medium text-slate-950 px-1">{user.name}</p>
          </div>
          <Separator className="h-[0.3]" />
          <div className="flex gap-6">
            <div className="flex-1 flex flex-col gap-1">
              <Label className="text-sm font-normal text-slate-500 px-1">
                {USER_LABELS.DETAIL.FIELDS.USER_TYPE}
              </Label>
              <p className="text-sm font-medium text-slate-950 px-1">{user.userType || '-'}</p>
            </div>

            <div className="flex-1 flex flex-col gap-1">
              <Label className="text-sm font-normal text-slate-500 px-1">
                {USER_LABELS.DETAIL.FIELDS.STATUS}
              </Label>
              <div className="flex items-center gap-2 px-1">
                <Switch checked={localActive} onCheckedChange={handleStatusToggle} />
                <span className="text-sm font-normal text-slate-950">
                  {localActive
                    ? USER_LABELS.DETAIL.STATUS_ACTIVE
                    : USER_LABELS.DETAIL.STATUS_INACTIVE}
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-6">
            <div className="flex-1 flex flex-col gap-1">
              <Label className="text-sm font-normal text-slate-500 px-1">
                {USER_LABELS.DETAIL.FIELDS.COMPANY}
              </Label>
              <p className="text-sm font-medium text-slate-950 px-1">{user.companyName || '-'}</p>
            </div>

            <div className="flex-1 flex flex-col gap-1">
              <Label className="text-sm font-normal text-slate-500 px-1">
                {USER_LABELS.DETAIL.FIELDS.EMPLOYEE}
              </Label>
              <p className="text-sm font-medium text-slate-950 px-1">{user.employeeName || '-'}</p>
            </div>
          </div>
          <div className="flex gap-6">
            <div className="flex-1 flex flex-col gap-1">
              <Label className="text-sm font-normal text-slate-500 px-1">
                {USER_LABELS.DETAIL.FIELDS.ROLE}
              </Label>
              <p className="text-sm font-medium text-slate-950 px-1">{user.role?.name || '-'}</p>
            </div>
          </div>
          <div className="flex gap-6">
            <div className="flex-1 flex flex-col gap-1">
              <Label className="text-sm font-normal text-slate-500 px-1">
                {USER_LABELS.DETAIL.FIELDS.EMAIL}
              </Label>
              <p className="text-sm font-medium text-slate-950 px-1">{user.email}</p>
            </div>

            <div className="flex-1 flex flex-col gap-1">
              <Label className="text-sm font-normal text-slate-500 px-1">
                {USER_LABELS.DETAIL.FIELDS.PHONE}
              </Label>
              <p className="text-sm font-medium text-slate-950 px-1">
                {formatPhone(user.phoneNumber) || '-'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        variant="danger"
        title={USER_LABELS.DETAIL.DELETE_DIALOG.TITLE}
        description={USER_LABELS.DETAIL.DELETE_DIALOG.DESCRIPTION}
        cancelText={USER_LABELS.DETAIL.DELETE_DIALOG.CANCEL}
        confirmText={USER_LABELS.DETAIL.DELETE_DIALOG.CONFIRM}
        onCancel={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        isLoading={isDeleting}
      />

      <ConfirmDialog
        open={isStatusDialogOpen}
        onOpenChange={handleStatusCancel}
        variant="default"
        title={USER_LABELS.DETAIL.STATUS_DIALOG?.TITLE ?? 'Simpan Status Baru?'}
        description={
          USER_LABELS.DETAIL.STATUS_DIALOG?.DESCRIPTION ?? 'Anda akan merubah status user ini.'
        }
        cancelText={USER_LABELS.DETAIL.STATUS_DIALOG?.CANCEL ?? 'Batal'}
        confirmText={USER_LABELS.DETAIL.STATUS_DIALOG?.CONFIRM ?? 'Simpan'}
        onCancel={handleStatusCancel}
        onConfirm={handleStatusConfirm}
        isLoading={isUpdatingStatus}
      />
    </div>
  );
}
