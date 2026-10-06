'use client';

import { Loader2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { DetailDrawerTemplate } from '@/components/templates';
import { ConfirmDialog } from '@/shared/components/molecules/AlertDialog';
import { Label } from '@/shared/components/ui/label';
import { Switch } from '@/shared/components/ui/switch';
import { PROJECT_TYPE_LABELS } from '../constants';
import { useProjectType } from '../hooks/use-project-type';
import { useUpdateProjectType } from '../hooks/use-update-project-type';

interface ProjectTypeDetailDrawerProps {
  open: boolean;
  onClose: () => void;
  onEdit?: () => void;
  id: string | null;
  onSuccess?: () => void;
}

export function ProjectTypeDetailDrawer({
  open,
  onClose,
  onEdit,
  id,
  onSuccess,
}: ProjectTypeDetailDrawerProps) {
  const { data: projectType, isLoading } = useProjectType(id ?? '');
  const labels = PROJECT_TYPE_LABELS.DETAIL;
  const [localActive, setLocalActive] = useState(false);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [pendingStatus, setPendingStatus] = useState(false);
  const initialValueRef = useRef<boolean | null>(null);

  const { mutate: updateStatus, isPending: isUpdatingStatus } = useUpdateProjectType(id ?? '');

  useEffect(() => {
    if (open && !isLoading && projectType != null && initialValueRef.current === null) {
      initialValueRef.current = projectType?.isActive ?? false;
      setLocalActive(initialValueRef.current);
    }
    if (!open) {
      initialValueRef.current = null;
    }
  }, [open, isLoading, projectType?.isActive, projectType]);

  const handleStatusToggle = (checked: boolean) => {
    setPendingStatus(checked);
    setIsStatusDialogOpen(true);
  };

  const handleStatusCancel = () => {
    setIsStatusDialogOpen(false);
  };

  const handleStatusConfirm = () => {
    if (!projectType) return;
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
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-1.5">
            <Label className="text-sm font-normal text-slate-500">{labels.FIELDS.CODE}</Label>
            <p className="text-sm font-medium text-slate-950">{projectType?.code ?? '-'}</p>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label className="text-sm font-normal text-slate-500">{labels.FIELDS.NAME}</Label>
            <p className="text-sm font-medium text-slate-950">{projectType?.name ?? '-'}</p>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label className="text-sm font-normal text-slate-500">
              {labels.FIELDS.DESCRIPTION}
            </Label>
            <p className="text-sm font-medium text-slate-950">{projectType?.description || '-'}</p>
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
        </>
      )}
    </DetailDrawerTemplate>
  );
}
