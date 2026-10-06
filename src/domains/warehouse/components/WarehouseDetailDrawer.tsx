'use client';

import { Loader2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { ConfirmDialog } from '@/shared/components/molecules/AlertDialog';
import { DetailDrawerTemplate } from '@/shared/components/templates/DetailDrawerTemplate';
import { Label } from '@/shared/components/ui/label';
import { Switch } from '@/shared/components/ui/switch';
import { formatNumber } from '@/shared/utils/format';
import { formatTimezone } from '@/shared/utils/timezone';
import { WAREHOUSE_LABELS } from '../constants';
import { useUpdateWarehouse } from '../hooks/use-update-warehouse';
import { useWarehouse } from '../hooks/use-warehouse';

interface WarehouseDetailDrawerProps {
  open: boolean;
  onClose: () => void;
  onEdit?: () => void;
  id: string | null;
  onSuccess?: () => void;
}

export function WarehouseDetailDrawer({
  open,
  onClose,
  onEdit,
  id,
  onSuccess,
}: WarehouseDetailDrawerProps) {
  const { data: warehouse, isLoading } = useWarehouse(id ?? '');
  const labels = WAREHOUSE_LABELS.DETAIL;
  const [localActive, setLocalActive] = useState(false);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [pendingStatus, setPendingStatus] = useState(false);
  const initialValueRef = useRef<boolean | null>(null);

  const { mutate: updateStatus, isPending: isUpdatingStatus } = useUpdateWarehouse(
    warehouse?.id ?? ''
  );

  useEffect(() => {
    if (open && !isLoading && warehouse != null && initialValueRef.current === null) {
      initialValueRef.current = warehouse.isActive ?? false;
      setLocalActive(initialValueRef.current);
    }
    if (!open) {
      initialValueRef.current = null;
    }
  }, [open, isLoading, warehouse]);

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
        <p className="text-sm font-medium text-slate-950">{warehouse?.code ?? '-'}</p>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label className="text-sm font-normal text-slate-500">{labels.FIELDS.NAME}</Label>
        <p className="text-sm font-medium text-slate-950">{warehouse?.name ?? '-'}</p>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label className="text-sm font-normal text-slate-500">{labels.FIELDS.TYPE}</Label>
        <p className="text-sm font-medium text-slate-950">{warehouse?.type ?? '-'}</p>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label className="text-sm font-normal text-slate-500">
          {labels.FIELDS.WORK_START_TIME}
        </Label>
        <p className="text-sm font-medium text-slate-950">{warehouse?.workStartTime ?? '-'}</p>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label className="text-sm font-normal text-slate-500">{labels.FIELDS.WORK_END_TIME}</Label>
        <p className="text-sm font-medium text-slate-950">{warehouse?.workEndTime ?? '-'}</p>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label className="text-sm font-normal text-slate-500">{labels.FIELDS.COMPANY}</Label>
        <p className="text-sm font-medium text-slate-950">
          {warehouse?.company ? `${warehouse.company.code} - ${warehouse.company.name}` : '-'}
        </p>
      </div>

      {(warehouse?.latitude || warehouse?.longitude) && (
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <Label className="text-sm font-normal text-slate-500">{labels.FIELDS.LATITUDE}</Label>
            <p className="text-sm font-medium text-slate-950">{warehouse?.latitude ?? '-'}</p>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-sm font-normal text-slate-500">{labels.FIELDS.LONGITUDE}</Label>
            <p className="text-sm font-medium text-slate-950">{warehouse?.longitude ?? '-'}</p>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-sm font-normal text-slate-500">
              {labels.FIELDS.ATTENDANCE_RADIUS}
            </Label>
            <p className="text-sm font-medium text-slate-950">
              {warehouse?.attendanceRadiusMeters != null
                ? formatNumber(warehouse.attendanceRadiusMeters)
                : '-'}
            </p>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-sm font-normal text-slate-500">{labels.FIELDS.TIMEZONE}</Label>
            <p className="text-sm font-medium text-slate-950">
              {formatTimezone(warehouse?.timezone) ?? '-'}
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label className="text-sm font-normal text-slate-500">{labels.FIELDS.PROVINCE}</Label>
          <p className="text-sm font-medium text-slate-950">{warehouse?.province?.name ?? '-'}</p>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label className="text-sm font-normal text-slate-500">{labels.FIELDS.CITY}</Label>
          <p className="text-sm font-medium text-slate-950">{warehouse?.city?.name ?? '-'}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label className="text-sm font-normal text-slate-500">{labels.FIELDS.DISTRICT}</Label>
          <p className="text-sm font-medium text-slate-950">{warehouse?.district?.name ?? '-'}</p>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label className="text-sm font-normal text-slate-500">{labels.FIELDS.VILLAGE}</Label>
          <p className="text-sm font-medium text-slate-950">{warehouse?.village?.name ?? '-'}</p>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label className="text-sm font-normal text-slate-500">{labels.FIELDS.ADDRESS_DETAIL}</Label>
        <p className="text-sm font-medium text-slate-950">{warehouse?.addressDetail || '-'}</p>
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
