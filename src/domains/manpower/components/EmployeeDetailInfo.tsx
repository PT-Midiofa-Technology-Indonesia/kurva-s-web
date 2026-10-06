'use client';

import { Pencil } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/atoms';
import { ConfirmDialog } from '@/shared/components/molecules/AlertDialog';
import { Label } from '@/shared/components/ui/label';
import { Switch } from '@/shared/components/ui/switch';
import { COMMON_LABELS } from '@/shared/constants';
import { formatPhone } from '@/shared/utils/masks';
import { MANPOWER_LABELS } from '../constants';
import { useUpdateEmployee } from '../hooks/use-update-employee';
import { EMPLOYEE_TYPE_LABELS, type Employee, GENDER_LABELS } from '../types';

interface EmployeeDetailInfoProps {
  employee: Employee;
  onEdit: () => void;
  onStatusChanged?: () => void;
  companyId?: string;
}

export function EmployeeDetailInfo({
  employee,
  onEdit,
  onStatusChanged,
  companyId,
}: EmployeeDetailInfoProps) {
  const [localActive, setLocalActive] = useState(employee.isActive);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [pendingStatus, setPendingStatus] = useState(false);
  const labels = MANPOWER_LABELS.DETAIL;

  const { mutate: updateStatus, isPending: isUpdatingStatus } = useUpdateEmployee(
    employee.id,
    companyId
  );

  const handleStatusToggle = (checked: boolean) => {
    setPendingStatus(checked);
    setIsStatusDialogOpen(true);
  };

  const handleStatusCancel = () => {
    setIsStatusDialogOpen(false);
  };

  const handleStatusConfirm = () => {
    updateStatus(
      { isActive: pendingStatus },
      {
        onSuccess: () => {
          setLocalActive(pendingStatus);
          setIsStatusDialogOpen(false);
          onStatusChanged?.();
        },
        onError: () => {
          setIsStatusDialogOpen(false);
        },
      }
    );
  };

  return (
    <>
      <div className="rounded-lg border bg-white p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-900">{labels.INFO_CARD_TITLE}</h2>
          <Button variant="outline" size="sm" onClick={onEdit} className="gap-1.5">
            <Pencil className="h-3.5 w-3.5" />
            {labels.BUTTONS.EDIT}
          </Button>
        </div>

        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-6">
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-normal text-slate-400">
                {labels.FIELDS.FULL_NAME}
              </Label>
              <p className="text-sm font-medium text-slate-900">{employee.fullName || '-'}</p>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-normal text-slate-400">{labels.FIELDS.GENDER}</Label>
              <p className="text-sm font-medium text-slate-900">
                {employee.gender
                  ? (GENDER_LABELS[employee.gender as keyof typeof GENDER_LABELS] ??
                    employee.gender)
                  : '-'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-normal text-slate-400">
                {labels.FIELDS.BIRTH_PLACE}
              </Label>
              <p className="text-sm font-medium text-slate-900">{employee.birthPlace || '-'}</p>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-normal text-slate-400">
                {labels.FIELDS.BIRTH_DATE}
              </Label>
              <p className="text-sm font-medium text-slate-900">{employee.birthDate || '-'}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-normal text-slate-400">{labels.FIELDS.PHONE}</Label>
              <p className="text-sm font-medium text-slate-900">
                {formatPhone(employee.phone) || '-'}
              </p>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-normal text-slate-400">{labels.FIELDS.EMAIL}</Label>
              <p className="text-sm font-medium text-slate-900">{employee.email || '-'}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-normal text-slate-400">
                {labels.FIELDS.EMPLOYEE_TYPE}
              </Label>
              <p className="text-sm font-medium text-slate-900">
                {employee.employeeType
                  ? (EMPLOYEE_TYPE_LABELS[
                      employee.employeeType as keyof typeof EMPLOYEE_TYPE_LABELS
                    ] ?? employee.employeeType)
                  : '-'}
              </p>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-normal text-slate-400">{labels.FIELDS.STATUS}</Label>
              <div className="flex items-center gap-2">
                <Switch
                  checked={localActive}
                  onCheckedChange={handleStatusToggle}
                  className="data-[state=checked]:bg-brand-600"
                />
                <span className="text-sm font-medium text-slate-900">
                  {localActive ? COMMON_LABELS.STATUS.ACTIVE : COMMON_LABELS.STATUS.INACTIVE}
                </span>
              </div>
            </div>
          </div>

          <div className="border-t pt-5 space-y-5">
            <div className="grid grid-cols-2 gap-6">
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-normal text-slate-400">
                  {labels.FIELDS.PROVINCE}
                </Label>
                <p className="text-sm font-medium text-slate-900">
                  {employee.province?.name || '-'}
                </p>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-normal text-slate-400">{labels.FIELDS.CITY}</Label>
                <p className="text-sm font-medium text-slate-900">{employee.city?.name || '-'}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-normal text-slate-400">
                  {labels.FIELDS.DISTRICT}
                </Label>
                <p className="text-sm font-medium text-slate-900">
                  {employee.district?.name || '-'}
                </p>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-normal text-slate-400">
                  {labels.FIELDS.VILLAGE}
                </Label>
                <p className="text-sm font-medium text-slate-900">
                  {employee.village?.name || '-'}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-normal text-slate-400">
                {labels.FIELDS.ADDRESS_DETAIL}
              </Label>
              <p className="text-sm font-medium text-slate-900">{employee.addressDetail || '-'}</p>
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={isStatusDialogOpen}
        onOpenChange={handleStatusCancel}
        variant="default"
        title={labels.DIALOG.CHANGE_STATUS_TITLE}
        description={labels.DIALOG.CHANGE_STATUS_DESCRIPTION}
        cancelText={labels.DIALOG.CHANGE_STATUS_CANCEL}
        confirmText={labels.DIALOG.CHANGE_STATUS_CONFIRM}
        onCancel={handleStatusCancel}
        onConfirm={handleStatusConfirm}
        isLoading={isUpdatingStatus}
      />
    </>
  );
}
