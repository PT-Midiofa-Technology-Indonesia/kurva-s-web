'use client';

import { Loader2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { DetailDrawerTemplate } from '@/components/templates';
import { toast } from '@/lib/toast';
import { ConfirmDialog } from '@/shared/components/molecules/AlertDialog';
import { Label } from '@/shared/components/ui/label';
import { Switch } from '@/shared/components/ui/switch';
import { ITEM_CATALOG_LABELS } from '../constants';
import { useItemCatalog } from '../hooks/use-item-catalog';
import { useUpdateItemCatalog } from '../hooks/use-update-item-catalog';

interface ItemCatalogDetailDrawerProps {
  open: boolean;
  onClose: () => void;
  onEdit?: () => void;
  id: string | null;
}

export function ItemCatalogDetailDrawer({
  open,
  onClose,
  onEdit,
  id,
}: ItemCatalogDetailDrawerProps) {
  const { data: itemCatalogData, isLoading } = useItemCatalog(id ?? '');
  const itemCatalog = itemCatalogData?.data ?? null;
  const labels = ITEM_CATALOG_LABELS.DETAIL;
  const initialValueRef = useRef<{
    isActive: boolean;
    isAllocatable: boolean;
    isAsset: boolean;
    isStock: boolean;
    isSensitive: boolean;
  } | null>(null);

  const [localActive, setLocalActive] = useState(false);
  const [localAllocatable, setLocalAllocatable] = useState(false);
  const [localAsset, setLocalAsset] = useState(false);
  const [localStock, setLocalStock] = useState(false);
  const [localSensitive, setLocalSensitive] = useState(false);

  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [isAllocatableDialogOpen, setIsAllocatableDialogOpen] = useState(false);
  const [isAssetDialogOpen, setIsAssetDialogOpen] = useState(false);
  const [isStockDialogOpen, setIsStockDialogOpen] = useState(false);
  const [isSensitiveDialogOpen, setIsSensitiveDialogOpen] = useState(false);

  const [pendingStatus, setPendingStatus] = useState(false);
  const [pendingAllocatable, setPendingAllocatable] = useState(false);
  const [pendingAsset, setPendingAsset] = useState(false);
  const [pendingStock, setPendingStock] = useState(false);
  const [pendingSensitive, setPendingSensitive] = useState(false);

  const { mutate: updateStatus, isPending: isUpdatingStatus } = useUpdateItemCatalog(
    itemCatalog?.id ?? ''
  );

  useEffect(() => {
    if (open && !isLoading && itemCatalog && initialValueRef.current === null) {
      initialValueRef.current = {
        isActive: itemCatalog.isActive ?? false,
        isAllocatable: itemCatalog.isAllocatable ?? false,
        isAsset: itemCatalog.isAsset ?? false,
        isStock: itemCatalog.isStock ?? false,
        isSensitive: itemCatalog.isSensitive ?? false,
      };
      setLocalActive(itemCatalog.isActive ?? false);
      setLocalAllocatable(itemCatalog.isAllocatable ?? false);
      setLocalAsset(itemCatalog.isAsset ?? false);
      setLocalStock(itemCatalog.isStock ?? false);
      setLocalSensitive(itemCatalog.isSensitive ?? false);
    }
    if (!open) {
      initialValueRef.current = null;
    }
  }, [open, isLoading, itemCatalog]);

  const handleToggleChange = (
    checked: boolean,
    dialogSetter: (value: boolean) => void,
    pendingSetter: (value: boolean) => void
  ) => {
    pendingSetter(checked);
    dialogSetter(true);
  };

  const handleConfirm = (
    payload: {
      isAllocatable: boolean;
      isAsset: boolean;
      isStock: boolean;
      isSensitive: boolean;
      isActive: boolean;
    },
    pendingValue: boolean,
    dialogSetter: (value: boolean) => void,
    stateSetter: (value: boolean) => void
  ) => {
    if (!itemCatalog) return;
    updateStatus(
      {
        itemTypeId: itemCatalog.itemTypeId,
        itemCategoryId: itemCatalog.itemCategoryId,
        uomId: itemCatalog.uomId,
        code: itemCatalog.code,
        name: itemCatalog.name,
        description: itemCatalog.description,
        ...payload,
      },
      {
        onSuccess: () => {
          stateSetter(pendingValue);
          dialogSetter(false);
          toast.success({ title: 'Item Catalog berhasil diperbarui' });
        },
        onError: () => {
          dialogSetter(false);
        },
      }
    );
  };

  const handleCancel = (dialogSetter: (value: boolean) => void) => {
    dialogSetter(false);
  };

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

  return (
    <DetailDrawerTemplate
      open={open}
      onClose={onClose}
      onEdit={onEdit}
      title={labels.TITLE}
      editLabel={labels.BUTTONS.EDIT}
      closeLabel={labels.BUTTONS.CLOSE}
      confirmDialog={
        <>
          <ConfirmDialog
            open={isStatusDialogOpen}
            onOpenChange={() => handleCancel(setIsStatusDialogOpen)}
            variant="default"
            title={labels.DIALOG.CHANGE_STATUS_TITLE}
            description={labels.DIALOG.CHANGE_STATUS_DESCRIPTION}
            cancelText={labels.DIALOG.CHANGE_STATUS_CANCEL}
            confirmText={labels.DIALOG.CHANGE_STATUS_CONFIRM}
            onCancel={() => handleCancel(setIsStatusDialogOpen)}
            onConfirm={() =>
              handleConfirm(
                {
                  isAllocatable: localAllocatable,
                  isAsset: localAsset,
                  isStock: localStock,
                  isSensitive: localSensitive,
                  isActive: pendingStatus,
                },
                pendingStatus,
                setIsStatusDialogOpen,
                setLocalActive
              )
            }
            isLoading={isUpdatingStatus}
          />
          <ConfirmDialog
            open={isAllocatableDialogOpen}
            onOpenChange={() => handleCancel(setIsAllocatableDialogOpen)}
            variant="default"
            title={labels.DIALOG.CHANGE_STATUS_TITLE}
            description="Anda akan mengubah status alokasi item."
            cancelText={labels.DIALOG.CHANGE_STATUS_CANCEL}
            confirmText={labels.DIALOG.CHANGE_STATUS_CONFIRM}
            onCancel={() => handleCancel(setIsAllocatableDialogOpen)}
            onConfirm={() =>
              handleConfirm(
                {
                  isAllocatable: pendingAllocatable,
                  isAsset: localAsset,
                  isStock: localStock,
                  isSensitive: localSensitive,
                  isActive: localActive,
                },
                pendingAllocatable,
                setIsAllocatableDialogOpen,
                setLocalAllocatable
              )
            }
            isLoading={isUpdatingStatus}
          />
          <ConfirmDialog
            open={isAssetDialogOpen}
            onOpenChange={() => handleCancel(setIsAssetDialogOpen)}
            variant="default"
            title={labels.DIALOG.CHANGE_STATUS_TITLE}
            description="Anda akan mengubah status item aset."
            cancelText={labels.DIALOG.CHANGE_STATUS_CANCEL}
            confirmText={labels.DIALOG.CHANGE_STATUS_CONFIRM}
            onCancel={() => handleCancel(setIsAssetDialogOpen)}
            onConfirm={() =>
              handleConfirm(
                {
                  isAllocatable: localAllocatable,
                  isAsset: pendingAsset,
                  isStock: localStock,
                  isSensitive: localSensitive,
                  isActive: localActive,
                },
                pendingAsset,
                setIsAssetDialogOpen,
                setLocalAsset
              )
            }
            isLoading={isUpdatingStatus}
          />
          <ConfirmDialog
            open={isStockDialogOpen}
            onOpenChange={() => handleCancel(setIsStockDialogOpen)}
            variant="default"
            title={labels.DIALOG.CHANGE_STATUS_TITLE}
            description="Anda akan mengubah status pengelolaan stok item."
            cancelText={labels.DIALOG.CHANGE_STATUS_CANCEL}
            confirmText={labels.DIALOG.CHANGE_STATUS_CONFIRM}
            onCancel={() => handleCancel(setIsStockDialogOpen)}
            onConfirm={() =>
              handleConfirm(
                {
                  isAllocatable: localAllocatable,
                  isAsset: localAsset,
                  isStock: pendingStock,
                  isSensitive: localSensitive,
                  isActive: localActive,
                },
                pendingStock,
                setIsStockDialogOpen,
                setLocalStock
              )
            }
            isLoading={isUpdatingStatus}
          />
          <ConfirmDialog
            open={isSensitiveDialogOpen}
            onOpenChange={() => handleCancel(setIsSensitiveDialogOpen)}
            variant="default"
            title={labels.DIALOG.CHANGE_STATUS_TITLE}
            description="Anda akan mengubah status item sensitif."
            cancelText={labels.DIALOG.CHANGE_STATUS_CANCEL}
            confirmText={labels.DIALOG.CHANGE_STATUS_CONFIRM}
            onCancel={() => handleCancel(setIsSensitiveDialogOpen)}
            onConfirm={() =>
              handleConfirm(
                {
                  isAllocatable: localAllocatable,
                  isAsset: localAsset,
                  isStock: localStock,
                  isSensitive: pendingSensitive,
                  isActive: localActive,
                },
                pendingSensitive,
                setIsSensitiveDialogOpen,
                setLocalSensitive
              )
            }
            isLoading={isUpdatingStatus}
          />
        </>
      }
    >
      {/* Item Type + Item Category */}
      <div className="grid grid-cols-2 gap-6">
        <div className="flex flex-col gap-1.5">
          <Label className="text-sm font-normal text-slate-500">{labels.FIELDS.ITEM_TYPE}</Label>
          <p className="text-sm font-medium text-slate-950">{itemCatalog?.itemType?.name ?? '-'}</p>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label className="text-sm font-normal text-slate-500">
            {labels.FIELDS.ITEM_CATEGORY}
          </Label>
          <p className="text-sm font-medium text-slate-950">
            {itemCatalog?.itemCategory?.name ?? '-'}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label className="text-sm font-normal text-slate-500">{labels.FIELDS.UOM}</Label>
        <p className="text-sm font-medium text-slate-950">{itemCatalog?.uom?.name ?? '-'}</p>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label className="text-sm font-normal text-slate-500">{labels.FIELDS.CODE}</Label>
        <p className="text-sm font-medium text-slate-950">{itemCatalog?.code ?? '-'}</p>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label className="text-sm font-normal text-slate-500">{labels.FIELDS.NAME}</Label>
        <p className="text-sm font-medium text-slate-950">{itemCatalog?.name ?? '-'}</p>
      </div>

      {/* Item Dapat Dialokasikan + Item Aset */}
      <div className="grid grid-cols-2 gap-6">
        <div className="flex flex-col gap-1.5">
          <Label className="text-sm font-normal text-slate-500">
            {labels.FIELDS.IS_ALLOCATABLE}
          </Label>
          <div className="flex items-center gap-2">
            <Switch
              checked={localAllocatable}
              onCheckedChange={(checked) =>
                handleToggleChange(checked, setIsAllocatableDialogOpen, setPendingAllocatable)
              }
              className="data-[state=checked]:bg-brand-600"
            />
            <span className="text-sm font-medium text-slate-950">
              {localAllocatable ? 'Ya' : 'Tidak'}
            </span>
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label className="text-sm font-normal text-slate-500">{labels.FIELDS.IS_ASSET}</Label>
          <div className="flex items-center gap-2">
            <Switch
              checked={localAsset}
              onCheckedChange={(checked) =>
                handleToggleChange(checked, setIsAssetDialogOpen, setPendingAsset)
              }
              className="data-[state=checked]:bg-brand-600"
            />
            <span className="text-sm font-medium text-slate-950">
              {localAsset ? 'Ya' : 'Tidak'}
            </span>
          </div>
        </div>
      </div>

      {/* Kelola Item Sebagai Stok + Item Sensitif */}
      <div className="grid grid-cols-2 gap-6">
        <div className="flex flex-col gap-1.5">
          <Label className="text-sm font-normal text-slate-500">{labels.FIELDS.IS_STOCK}</Label>
          <div className="flex items-center gap-2">
            <Switch
              checked={localStock}
              onCheckedChange={(checked) =>
                handleToggleChange(checked, setIsStockDialogOpen, setPendingStock)
              }
              className="data-[state=checked]:bg-brand-600"
            />
            <span className="text-sm font-medium text-slate-950">
              {localStock ? 'Ya' : 'Tidak'}
            </span>
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label className="text-sm font-normal text-slate-500">{labels.FIELDS.IS_SENSITIVE}</Label>
          <div className="flex items-center gap-2">
            <Switch
              checked={localSensitive}
              onCheckedChange={(checked) =>
                handleToggleChange(checked, setIsSensitiveDialogOpen, setPendingSensitive)
              }
              className="data-[state=checked]:bg-brand-600"
            />
            <span className="text-sm font-medium text-slate-950">
              {localSensitive ? 'Ya' : 'Tidak'}
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label className="text-sm font-normal text-slate-500">{labels.FIELDS.DESCRIPTION}</Label>
        <p className="text-sm font-medium text-slate-950">{itemCatalog?.description || '-'}</p>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label className="text-sm font-normal text-slate-500">{labels.FIELDS.STATUS}</Label>
        <div className="flex items-center gap-2">
          <Switch
            checked={localActive}
            onCheckedChange={(checked) =>
              handleToggleChange(checked, setIsStatusDialogOpen, setPendingStatus)
            }
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
