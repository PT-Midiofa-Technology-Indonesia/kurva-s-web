'use client';

import { Loader2 } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { DetailDrawerTemplate } from '@/components/templates';
import { ConfirmDialog } from '@/shared/components/molecules/AlertDialog';
import { Badge } from '@/shared/components/ui/badge';
import { Label } from '@/shared/components/ui/label';
import { Switch } from '@/shared/components/ui/switch';
import { DOCUMENT_TYPE_LABELS } from '../constants';
import { useDocumentType } from '../hooks/use-document-type';
import { useUpdateDocumentType } from '../hooks/use-update-document-type';
import { parseFileTypesString } from '../services/file-types';

interface DocumentTypeDetailDrawerProps {
  open: boolean;
  onClose: () => void;
  onEdit?: () => void;
  id: string | null;
  onSuccess?: () => void;
}

export function DocumentTypeDetailDrawer({
  open,
  onClose,
  onEdit,
  id,
  onSuccess,
}: DocumentTypeDetailDrawerProps) {
  const { data: documentType, isLoading } = useDocumentType(id ?? '');
  const labels = DOCUMENT_TYPE_LABELS.DETAIL;
  const [localActive, setLocalActive] = useState(false);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [pendingStatus, setPendingStatus] = useState(false);
  const initialValueRef = useRef<boolean | null>(null);

  const { mutate: updateStatus, isPending: isUpdatingStatus } = useUpdateDocumentType(
    documentType?.id ?? ''
  );

  const fileTypeList = useMemo(
    () => parseFileTypesString(documentType?.allowedFileTypes ?? null),
    [documentType?.allowedFileTypes]
  );

  useEffect(() => {
    if (open && !isLoading && documentType != null && initialValueRef.current === null) {
      initialValueRef.current = documentType.isActive ?? false;
      setLocalActive(initialValueRef.current);
    }
    if (!open) {
      initialValueRef.current = null;
    }
  }, [open, isLoading, documentType]);

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
        <p className="text-sm font-medium text-slate-950">{documentType?.code ?? '-'}</p>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label className="text-sm font-normal text-slate-500">{labels.FIELDS.NAME}</Label>
        <p className="text-sm font-medium text-slate-950">{documentType?.name ?? '-'}</p>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label className="text-sm font-normal text-slate-500">{labels.FIELDS.DESCRIPTION}</Label>
        <p className="text-sm font-medium text-slate-950 whitespace-pre-line">
          {documentType?.description || '-'}
        </p>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label className="text-sm font-normal text-slate-500">{labels.FIELDS.FILE_TYPES}</Label>
        {fileTypeList.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {fileTypeList.map((ft) => (
              <Badge key={ft} variant="secondary" className="rounded-md">
                {ft}
              </Badge>
            ))}
          </div>
        ) : (
          <p className="text-sm font-medium text-slate-950">-</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label className="text-sm font-normal text-slate-500">{labels.FIELDS.FILE_SIZE}</Label>
        <p className="text-sm font-medium text-slate-950">
          {documentType?.allowedFileSize != null ? `${documentType.allowedFileSize} KB` : '-'}
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
