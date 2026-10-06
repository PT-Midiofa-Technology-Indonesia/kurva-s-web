'use client';

import { Loader2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { DetailDrawerTemplate } from '@/components/templates';
import { ConfirmDialog } from '@/shared/components/molecules/AlertDialog';
import { Label } from '@/shared/components/ui/label';
import { Switch } from '@/shared/components/ui/switch';
import { useSelectedCompanyStore } from '@/shared/store/selected-company';
import { HIERARCHY_MANAGEMENT_LABELS } from '../constants';
import { useHierarchyManagement } from '../hooks/use-hierarchy-management';
import { useUpdateHierarchyManagement } from '../hooks/use-update-hierarchy-management';

interface HierarchyManagementDetailDrawerProps {
  open: boolean;
  onClose: () => void;
  onEdit?: () => void;
  id: string | null;
  onSuccess?: () => void;
}

export function HierarchyManagementDetailDrawer({
  open,
  onClose,
  onEdit,
  id,
  onSuccess,
}: HierarchyManagementDetailDrawerProps) {
  const labels = HIERARCHY_MANAGEMENT_LABELS.DETAIL;
  const { data: hierarchyManagement, isLoading } = useHierarchyManagement(id ?? '');
  const selectedCompanyId = useSelectedCompanyStore((s) => s.selectedCompanyId);
  const [localActive, setLocalActive] = useState(false);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [pendingStatus, setPendingStatus] = useState(false);
  const initialValueRef = useRef<boolean | null>(null);

  const effectiveCompanyId = selectedCompanyId ?? hierarchyManagement?.company?.id ?? undefined;

  const { mutate: updateStatus, isPending: isUpdatingStatus } = useUpdateHierarchyManagement(
    id ?? '',
    effectiveCompanyId
  );

  useEffect(() => {
    if (open && initialValueRef.current === null && hierarchyManagement) {
      initialValueRef.current = hierarchyManagement.isActive ?? false;
      setLocalActive(initialValueRef.current);
    }
    if (!open) {
      initialValueRef.current = null;
    }
  }, [open, hierarchyManagement?.isActive, hierarchyManagement]);

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

  const parentLabel = hierarchyManagement?.parent
    ? `${hierarchyManagement.parent.position?.code ?? '-'} - ${hierarchyManagement.parent.position?.name ?? '-'}`
    : '-';

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
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-1.5">
            <Label className="text-sm font-normal text-slate-500">{labels.FIELDS.CODE}</Label>
            <p className="text-sm font-medium text-slate-950">
              {hierarchyManagement?.position?.code ?? '-'}
            </p>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label className="text-sm font-normal text-slate-500">{labels.FIELDS.NAME}</Label>
            <p className="text-sm font-medium text-slate-950">
              {hierarchyManagement?.position?.name ?? '-'}
            </p>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label className="text-sm font-normal text-slate-500">{labels.FIELDS.COMPANY}</Label>
            <p className="text-sm font-medium text-slate-950">
              {hierarchyManagement?.company?.name ?? '-'}
            </p>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label className="text-sm font-normal text-slate-500">{labels.FIELDS.DEPARTMENT}</Label>
            <p className="text-sm font-medium text-slate-950">
              {hierarchyManagement?.department?.name ?? '-'}
            </p>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label className="text-sm font-normal text-slate-500">{labels.FIELDS.LEVEL}</Label>
            <p className="text-sm font-medium text-slate-950">
              {hierarchyManagement?.position?.level ?? '-'}
            </p>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label className="text-sm font-normal text-slate-500">{labels.FIELDS.PARENT}</Label>
            <p className="text-sm font-medium text-slate-950">{parentLabel}</p>
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
