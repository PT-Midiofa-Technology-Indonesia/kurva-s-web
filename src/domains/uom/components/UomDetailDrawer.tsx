'use client';

import { Loader2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { DetailDrawerTemplate } from '@/components/templates';
import { ConfirmDialog } from '@/shared/components/molecules/AlertDialog';
import { Label } from '@/shared/components/ui/label';
import { Switch } from '@/shared/components/ui/switch';
import { COMMON_LABELS } from '@/shared/constants';
import { UOM_LABELS } from '../constants';
import { useUom } from '../hooks/use-uom';
import { useUpdateUom } from '../hooks/use-update-uom';

interface UomDetailDrawerProps {
  open: boolean;
  onClose: () => void;
  onEdit?: () => void;
  id: string | null;
  onSuccess?: () => void;
}

export function UomDetailDrawer({ open, onClose, onEdit, id, onSuccess }: UomDetailDrawerProps) {
  const { data: uomData, isLoading } = useUom(id ?? '');
  const uom = uomData?.data ?? null;
  const labels = UOM_LABELS.DETAIL;
  const [localActive, setLocalActive] = useState(false);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [pendingStatus, setPendingStatus] = useState(false);
  const initialValueRef = useRef<boolean | null>(null);

  const { mutate: updateUom, isPending: isUpdatingStatus } = useUpdateUom();

  useEffect(() => {
    if (open && !isLoading && uom != null && initialValueRef.current === null) {
      initialValueRef.current = uom?.isActive ?? false;
      setLocalActive(initialValueRef.current);
    }
    if (!open) {
      initialValueRef.current = null;
    }
  }, [open, isLoading, uom?.isActive, uom]);

  const handleStatusToggle = (checked: boolean) => {
    setPendingStatus(checked);
    setIsStatusDialogOpen(true);
  };

  const handleStatusCancel = () => {
    setIsStatusDialogOpen(false);
  };

  const handleStatusConfirm = () => {
    if (!uom) return;
    updateUom(
      { id: uom.id, payload: { isActive: pendingStatus } },
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
        <p className="text-sm font-medium text-slate-950">{uom?.code ?? '-'}</p>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label className="text-sm font-normal text-slate-500">{labels.FIELDS.GROUP}</Label>
        <p className="text-sm font-medium text-slate-950">{uom?.group ?? '-'}</p>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label className="text-sm font-normal text-slate-500">{labels.FIELDS.NAME}</Label>
        <p className="text-sm font-medium text-slate-950">{uom?.name ?? '-'}</p>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label className="text-sm font-normal text-slate-500">{labels.FIELDS.DESCRIPTION}</Label>
        <p className="text-sm font-medium text-slate-950">{uom?.description || '-'}</p>
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
            {localActive ? COMMON_LABELS.STATUS.ACTIVE : COMMON_LABELS.STATUS.INACTIVE}
          </span>
        </div>
      </div>
    </DetailDrawerTemplate>
  );
}
