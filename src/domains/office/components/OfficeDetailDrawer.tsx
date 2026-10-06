'use client';

import { Loader2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { DetailDrawerTemplate } from '@/components/templates';
import { ConfirmDialog } from '@/shared/components/molecules/AlertDialog';
import { Label } from '@/shared/components/ui/label';
import { Switch } from '@/shared/components/ui/switch';
import { formatNumber } from '@/shared/utils/format';
import { formatPhone } from '@/shared/utils/masks';
import { formatTimezone } from '@/shared/utils/timezone';
import { OFFICE_LABELS } from '../constants';
import { useOffice } from '../hooks/use-office';
import { useUpdateOffice } from '../hooks/use-update-office';

interface OfficeDetailDrawerProps {
  open: boolean;
  onClose: () => void;
  onEdit?: () => void;
  id: string | null;
  onSuccess?: () => void;
}

export function OfficeDetailDrawer({
  open,
  onClose,
  onEdit,
  id,
  onSuccess,
}: OfficeDetailDrawerProps) {
  const { data: office, isLoading } = useOffice(id ?? '');
  const labels = OFFICE_LABELS.DETAIL;
  const [localActive, setLocalActive] = useState(false);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [pendingStatus, setPendingStatus] = useState(false);
  const initialValueRef = useRef<boolean | null>(null);

  const { mutate: updateStatus, isPending: isUpdatingStatus } = useUpdateOffice(office?.id ?? '');

  useEffect(() => {
    if (open && !isLoading && office != null && initialValueRef.current === null) {
      initialValueRef.current = office.isActive ?? false;
      setLocalActive(initialValueRef.current);
    }
    if (!open) {
      initialValueRef.current = null;
    }
  }, [open, isLoading, office]);

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
          onSuccess?.();
        },
        onError: () => {
          setIsStatusDialogOpen(false);
        },
      }
    );
  };

  const typeLabel =
    office?.type === 'main_office'
      ? 'Kantor Pusat'
      : office?.type === 'branch_office'
        ? 'Kantor Cabang'
        : (office?.type ?? '-');

  if (isLoading) {
    return (
      <DetailDrawerTemplate
        open={open}
        onClose={onClose}
        onEdit={onEdit}
        title={labels.PAGE_TITLE}
        editLabel={labels.BUTTONS.EDIT}
        closeLabel={labels.BUTTONS.CLOSE}
      >
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
        </div>
      </DetailDrawerTemplate>
    );
  }

  return (
    <DetailDrawerTemplate
      open={open}
      onClose={onClose}
      onEdit={onEdit}
      title={labels.PAGE_TITLE}
      editLabel={labels.BUTTONS.EDIT}
      closeLabel={labels.BUTTONS.CLOSE}
      confirmDialog={
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
      }
    >
      <div className="flex flex-col gap-1.5">
        <Label className="text-sm font-normal text-slate-500">{labels.FIELDS.CODE}</Label>
        <p className="text-sm font-medium text-slate-950">{office?.code ?? '-'}</p>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label className="text-sm font-normal text-slate-500">{labels.FIELDS.NAME}</Label>
        <p className="text-sm font-medium text-slate-950">{office?.name ?? '-'}</p>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label className="text-sm font-normal text-slate-500">{labels.FIELDS.TYPE}</Label>
        <p className="text-sm font-medium text-slate-950">{typeLabel}</p>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label className="text-sm font-normal text-slate-500">{labels.FIELDS.COMPANY}</Label>
        <p className="text-sm font-medium text-slate-950">
          {office?.company ? `${office.company.name}` : '-'}
        </p>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label className="text-sm font-normal text-slate-500">{labels.FIELDS.PHONE}</Label>
        <p className="text-sm font-medium text-slate-950">{formatPhone(office?.phone) || '-'}</p>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label className="text-sm font-normal text-slate-500">
          {labels.FIELDS.WORK_START_TIME}
        </Label>
        <p className="text-sm font-medium text-slate-950">{office?.workStartTime ?? '-'}</p>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label className="text-sm font-normal text-slate-500">{labels.FIELDS.WORK_END_TIME}</Label>
        <p className="text-sm font-medium text-slate-950">{office?.workEndTime ?? '-'}</p>
      </div>

      <div className="border-t pt-5 space-y-5">
        <div className="grid grid-cols-2 gap-6">
          <div className="flex flex-col gap-1.5">
            <Label className="text-sm font-normal text-slate-500">{labels.FIELDS.LATITUDE}</Label>
            <p className="text-sm font-medium text-slate-950">
              {office?.latitude != null ? String(office.latitude) : '-'}
            </p>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-sm font-normal text-slate-500">{labels.FIELDS.LONGITUDE}</Label>
            <p className="text-sm font-medium text-slate-950">
              {office?.longitude != null ? String(office.longitude) : '-'}
            </p>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-sm font-normal text-slate-500">
              {labels.FIELDS.ATTENDANCE_RADIUS}
            </Label>
            <p className="text-sm font-medium text-slate-950">
              {office?.attendanceRadiusMeters != null
                ? formatNumber(office.attendanceRadiusMeters)
                : '-'}
            </p>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-sm font-normal text-slate-500">{labels.FIELDS.TIMEZONE}</Label>
            <p className="text-sm font-medium text-slate-950">
              {formatTimezone(office?.timezone) ?? '-'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="flex flex-col gap-1.5">
            <Label className="text-sm font-normal text-slate-500">{labels.FIELDS.PROVINCE}</Label>
            <p className="text-sm font-medium text-slate-950">{office?.province?.name ?? '-'}</p>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-sm font-normal text-slate-500">{labels.FIELDS.CITY}</Label>
            <p className="text-sm font-medium text-slate-950">{office?.city?.name ?? '-'}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="flex flex-col gap-1.5">
            <Label className="text-sm font-normal text-slate-500">{labels.FIELDS.DISTRICT}</Label>
            <p className="text-sm font-medium text-slate-950">{office?.district?.name ?? '-'}</p>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-sm font-normal text-slate-500">{labels.FIELDS.VILLAGE}</Label>
            <p className="text-sm font-medium text-slate-950">{office?.village?.name ?? '-'}</p>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label className="text-sm font-normal text-slate-500">
            {labels.FIELDS.ADDRESS_DETAIL}
          </Label>
          <p className="text-sm font-medium text-slate-950">{office?.addressDetail || '-'}</p>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label className="text-sm font-normal text-slate-500">{labels.FIELDS.STATUS}</Label>
        <div className="flex items-center gap-2">
          <Switch
            checked={localActive}
            onCheckedChange={handleStatusToggle}
            className="data-[state=checked]:bg-brand-600"
          />
          <span className="text-sm font-medium text-slate-950">
            {localActive ? labels.STATUS_ACTIVE : labels.STATUS_INACTIVE}
          </span>
        </div>
      </div>
    </DetailDrawerTemplate>
  );
}
