'use client';

import { Loader2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { DetailDrawerTemplate } from '@/components/templates';
import { ConfirmDialog } from '@/shared/components/molecules/AlertDialog';
import { Label } from '@/shared/components/ui/label';
import { Switch } from '@/shared/components/ui/switch';
import { ITEM_CATEGORY_LABELS } from '../constants';
import { useItemCategory } from '../hooks/use-item-category';
import { useUpdateItemCategory } from '../hooks/use-update-item-category';

interface ItemCategoryDetailDrawerProps {
  open: boolean;
  onClose: () => void;
  onEdit?: () => void;
  id: string | null;
}

export function ItemCategoryDetailDrawer({
  open,
  onClose,
  onEdit,
  id,
}: ItemCategoryDetailDrawerProps) {
  const { data: response, isLoading } = useItemCategory(id ?? '');
  const itemCategory = response?.data ?? null;
  const labels = ITEM_CATEGORY_LABELS.DETAIL;
  const [localActive, setLocalActive] = useState(false);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [pendingStatus, setPendingStatus] = useState(false);
  const initialValueRef = useRef<boolean | null>(null);

  const { mutate: updateStatus, isPending: isUpdatingStatus } = useUpdateItemCategory(
    itemCategory?.id ?? ''
  );

  useEffect(() => {
    if (open && !isLoading && itemCategory != null && initialValueRef.current === null) {
      initialValueRef.current = itemCategory.isActive ?? false;
      setLocalActive(initialValueRef.current);
    }
    if (!open) {
      initialValueRef.current = null;
    }
  }, [open, isLoading, itemCategory]);

  if (isLoading) {
    return (
      <DetailDrawerTemplate
        open={open}
        onClose={onClose}
        onEdit={onEdit}
        title={labels.TITLE}
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
      title={labels.TITLE}
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
        <p className="text-sm font-medium text-slate-950">{itemCategory?.code ?? '-'}</p>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label className="text-sm font-normal text-slate-500">{labels.FIELDS.NAME}</Label>
        <p className="text-sm font-medium text-slate-950">{itemCategory?.name ?? '-'}</p>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label className="text-sm font-normal text-slate-500">{labels.FIELDS.ITEM_TYPE}</Label>
        <p className="text-sm font-medium text-slate-950">{itemCategory?.itemType?.name ?? '-'}</p>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label className="text-sm font-normal text-slate-500">{labels.FIELDS.DESCRIPTION}</Label>
        <p className="text-sm font-medium text-slate-950">{itemCategory?.description || '-'}</p>
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
