'use client';

import { Loader2 } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { DetailDrawerTemplate } from '@/components/templates';
import { ConfirmDialog } from '@/shared/components/molecules/AlertDialog';
import { Label } from '@/shared/components/ui/label';
import { Switch } from '@/shared/components/ui/switch';
import { useDepreciationMethods } from '@/shared/hooks/use-enums';
import { formatNumber } from '@/shared/utils/format';
import { ASSET_CATEGORY_LABELS, BOOLEAN_YES_NO_META } from '../constants';
import { useAssetCategory } from '../hooks/use-asset-category';
import { useUpdateAssetCategory } from '../hooks/use-update-asset-category';

interface AssetCategoryDetailDrawerProps {
  open: boolean;
  onClose: () => void;
  onEdit?: () => void;
  id: string | null;
}

export function AssetCategoryDetailDrawer({
  open,
  onClose,
  onEdit,
  id,
}: AssetCategoryDetailDrawerProps) {
  const { data: response, isLoading } = useAssetCategory(id ?? '');
  const assetCategory = response?.data ?? null;
  const labels = ASSET_CATEGORY_LABELS.DETAIL;
  const [localActive, setLocalActive] = useState(false);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [pendingStatus, setPendingStatus] = useState(false);
  const initialValueRef = useRef<boolean | null>(null);

  const { data: depreciationMethods } = useDepreciationMethods();
  const { mutate: updateStatus, isPending: isUpdatingStatus } = useUpdateAssetCategory(
    assetCategory?.id ?? ''
  );

  const depreciationMethodLabel = useMemo(() => {
    if (!assetCategory?.depreciationMethod) return '-';
    return (
      depreciationMethods?.find((method) => method.value === assetCategory.depreciationMethod)
        ?.label ?? assetCategory.depreciationMethod
    );
  }, [assetCategory?.depreciationMethod, depreciationMethods]);

  useEffect(() => {
    if (open && !isLoading && assetCategory != null && initialValueRef.current === null) {
      initialValueRef.current = assetCategory.isActive ?? false;
      setLocalActive(initialValueRef.current);
    }
    if (!open) {
      initialValueRef.current = null;
    }
  }, [open, isLoading, assetCategory]);

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
        <p className="text-sm font-medium text-slate-950">{assetCategory?.code ?? '-'}</p>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label className="text-sm font-normal text-slate-500">{labels.FIELDS.NAME}</Label>
        <p className="text-sm font-medium text-slate-950">{assetCategory?.name ?? '-'}</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label className="text-sm font-normal text-slate-500">
            {labels.FIELDS.USEFUL_LIFE_MONTHS}
          </Label>
          <p className="text-sm font-medium text-slate-950">
            {assetCategory?.usefulLifeMonths ? `${assetCategory.usefulLifeMonths} bulan` : '-'}
          </p>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label className="text-sm font-normal text-slate-500">
            {labels.FIELDS.DEPRECIATION_METHOD}
          </Label>
          <p className="text-sm font-medium text-slate-950">{depreciationMethodLabel}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label className="text-sm font-normal text-slate-500">
            {labels.FIELDS.SALVAGE_VALUE_PERCENT}
          </Label>
          <p className="text-sm font-medium text-slate-950">
            {assetCategory?.salvageValuePercent ? `${assetCategory.salvageValuePercent}%` : '-'}
          </p>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label className="text-sm font-normal text-slate-500">
            {labels.FIELDS.MAINTENANCE_INTERVAL_MONTHS}
          </Label>
          <p className="text-sm font-medium text-slate-950">
            {assetCategory?.maintenanceIntervalMonths
              ? `${assetCategory.maintenanceIntervalMonths} bulan`
              : '-'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label className="text-sm font-normal text-slate-500">
            {labels.FIELDS.REQUIRES_SERIAL}
          </Label>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-950">
              {BOOLEAN_YES_NO_META[assetCategory?.requiresSerial ? 'true' : 'false'].label}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label className="text-sm font-normal text-slate-500">
            {labels.FIELDS.ACTIVE_REGISTRATIONS_COUNT}
          </Label>
          <p className="text-sm font-medium text-slate-950">
            {formatNumber(assetCategory?.activeRegistrationsCount ?? 0)}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label className="text-sm font-normal text-slate-500">{labels.FIELDS.NOTES}</Label>
        <p className="text-sm font-medium text-slate-950 whitespace-pre-wrap">
          {assetCategory?.notes || '-'}
        </p>
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
