'use client';

import { Loader2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { ConfirmDialog } from '@/shared/components/molecules/AlertDialog';
import { DetailDrawerTemplate } from '@/shared/components/templates/DetailDrawerTemplate';
import { Label } from '@/shared/components/ui/label';
import { Switch } from '@/shared/components/ui/switch';
import { SKILL_CATALOG_LABELS } from '../constants';
import { useSkillCatalog } from '../hooks/use-skill-catalog';
import { useUpdateSkillCatalog } from '../hooks/use-update-skill-catalog';

interface SkillCatalogDetailDrawerProps {
  open: boolean;
  onClose: () => void;
  onEdit?: () => void;
  id: string | null;
  onSuccess?: () => void;
}

export function SkillCatalogDetailDrawer({
  open,
  onClose,
  onEdit,
  id,
  onSuccess,
}: SkillCatalogDetailDrawerProps) {
  const { data: response, isLoading } = useSkillCatalog(id ?? '');
  const skillCatalog = response?.data ?? null;
  const labels = SKILL_CATALOG_LABELS.DETAIL;
  const [localActive, setLocalActive] = useState(false);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [pendingStatus, setPendingStatus] = useState(false);
  const initialValueRef = useRef<boolean | null>(null);

  const { mutate: updateStatus, isPending: isUpdatingStatus } = useUpdateSkillCatalog(
    skillCatalog?.id ?? ''
  );

  useEffect(() => {
    if (open && !isLoading && skillCatalog != null && initialValueRef.current === null) {
      initialValueRef.current = skillCatalog.isActive ?? false;
      setLocalActive(initialValueRef.current);
    }
    if (!open) {
      initialValueRef.current = null;
    }
  }, [open, isLoading, skillCatalog]);

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
      {
        code: skillCatalog?.code ?? '',
        name: skillCatalog?.name ?? '',
        skillCategoryId: skillCatalog?.skillCategoryId ?? '',
        skillLevelId: skillCatalog?.skillLevelId ?? '',
        description: skillCatalog?.description ?? '',
        isActive: pendingStatus,
      },
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
          title={labels.DIALOG.TITLE}
          description={labels.DIALOG.DESCRIPTION}
          cancelText={labels.DIALOG.CANCEL}
          confirmText={labels.DIALOG.CONFIRM}
          onCancel={handleStatusCancel}
          onConfirm={handleStatusConfirm}
          isLoading={isUpdatingStatus}
        />
      }
    >
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label className="text-sm font-normal text-slate-500">
            {labels.FIELDS.SKILL_CATEGORY}
          </Label>
          <p className="text-sm font-medium text-slate-950">
            {skillCatalog?.skillCategory?.name ?? '-'}
          </p>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label className="text-sm font-normal text-slate-500">{labels.FIELDS.SKILL_LEVEL}</Label>
          <p className="text-sm font-medium text-slate-950">
            {skillCatalog?.skillLevel?.name ?? '-'}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label className="text-sm font-normal text-slate-500">{labels.FIELDS.CODE}</Label>
        <p className="text-sm font-medium text-slate-950">{skillCatalog?.code ?? '-'}</p>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label className="text-sm font-normal text-slate-500">{labels.FIELDS.NAME}</Label>
        <p className="text-sm font-medium text-slate-950">{skillCatalog?.name ?? '-'}</p>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label className="text-sm font-normal text-slate-500">{labels.FIELDS.DESCRIPTION}</Label>
        <p className="text-sm font-medium text-slate-950">{skillCatalog?.description || '-'}</p>
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
