'use client';

import { Loader2, Plus, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { DetailDrawerTemplate } from '@/components/templates';
import { useDocumentTypesInfinite } from '@/domains/document-type/hooks/use-document-types-infinite';
import { AsyncSelect } from '@/shared/components/atoms';
import { Button } from '@/shared/components/ui/button';
import { Label } from '@/shared/components/ui/label';
import { Switch } from '@/shared/components/ui/switch';
import { PROSPECT_DOCUMENT_LABELS } from '../constants';
import { useProspectStageDocument } from '../hooks/use-prospect-stage-document';
import { useSyncProspectStageDocument } from '../hooks/use-sync-prospect-stage-document';
import type { DocumentRequirementPayload } from '../types';

interface DocumentRequirementItem {
  documentTypeId: string;
  isMandatory: boolean;
  isActive: boolean;
}

interface ProspectDocumentSettingDrawerProps {
  open: boolean;
  onClose: () => void;
  stage: string | null;
}

export function ProspectDocumentSettingDrawer({
  open,
  onClose,
  stage,
}: ProspectDocumentSettingDrawerProps) {
  const labels = PROSPECT_DOCUMENT_LABELS.SETTING_DRAWER;

  const { data: stageDocument, isLoading: isLoadingDetail } = useProspectStageDocument(stage);
  const { mutate: sync, isPending: isSyncing } = useSyncProspectStageDocument(stage ?? '');

  const [requirements, setRequirements] = useState<DocumentRequirementItem[]>([]);
  const [selectedDocTypeId, setSelectedDocTypeId] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const {
    options,
    isLoading: isLoadingOptions,
    hasMore,
    loadMore,
  } = useDocumentTypesInfinite({
    search,
    isActive: true,
  });

  useEffect(() => {
    if (open && stageDocument) {
      setRequirements(
        stageDocument.documentRequirements.map((req) => ({
          documentTypeId: req.documentType.id,
          isMandatory: req.isMandatory,
          isActive: req.isActive,
        }))
      );
    }
    if (!open) {
      setRequirements([]);
      setSelectedDocTypeId(null);
      setSearch('');
    }
  }, [open, stageDocument]);

  const handleScrollToBottom = useCallback(() => {
    if (hasMore) {
      loadMore();
    }
  }, [hasMore, loadMore]);

  const handleAddDocument = useCallback(() => {
    if (!selectedDocTypeId) return;
    // Check if already in list
    if (requirements.some((r) => r.documentTypeId === selectedDocTypeId)) return;

    setRequirements((prev) => [
      ...prev,
      { documentTypeId: selectedDocTypeId, isMandatory: false, isActive: true },
    ]);
    setSelectedDocTypeId(null);
    setSearch('');
  }, [selectedDocTypeId, requirements]);

  const handleRemoveDocument = useCallback((documentTypeId: string) => {
    setRequirements((prev) => prev.filter((r) => r.documentTypeId !== documentTypeId));
  }, []);

  const handleToggleMandatory = useCallback((documentTypeId: string) => {
    setRequirements((prev) =>
      prev.map((r) =>
        r.documentTypeId === documentTypeId ? { ...r, isMandatory: !r.isMandatory } : r
      )
    );
  }, []);

  const handleToggleActive = useCallback((documentTypeId: string) => {
    setRequirements((prev) =>
      prev.map((r) => (r.documentTypeId === documentTypeId ? { ...r, isActive: !r.isActive } : r))
    );
  }, []);

  const handleSave = useCallback(() => {
    if (!stage) return;

    const documentRequirements: DocumentRequirementPayload[] = requirements.map((r) => ({
      documentTypeId: r.documentTypeId,
      isMandatory: r.isMandatory,
      isActive: r.isActive,
    }));

    sync(
      { documentRequirements },
      {
        onSuccess: () => {
          onClose();
        },
      }
    );
  }, [stage, sync, requirements, onClose]);

  const stageNameDisplay = useMemo(() => {
    return stageDocument?.stageName ?? '';
  }, [stageDocument]);

  const getDocTypeName = useCallback(
    (docTypeId: string) => {
      return (
        options?.find((o) => o.value === docTypeId)?.label ??
        stageDocument?.documentRequirements.find((r) => r.documentType.id === docTypeId)
          ?.documentType.name ??
        ''
      );
    },
    [options, stageDocument]
  );

  const isAddDisabled = useMemo(() => {
    if (!selectedDocTypeId) return true;
    return requirements.some((r) => r.documentTypeId === selectedDocTypeId);
  }, [selectedDocTypeId, requirements]);

  if (isLoadingDetail) {
    return (
      <DetailDrawerTemplate
        open={open}
        onClose={onClose}
        title={labels.TITLE}
        closeLabel={labels.BUTTONS.CANCEL}
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
      onEdit={handleSave}
      title={labels.TITLE}
      editLabel={labels.BUTTONS.SAVE}
      closeLabel={labels.BUTTONS.CANCEL}
    >
      {stageNameDisplay && (
        <div className="rounded-lg bg-slate-100 px-4 py-3">
          <p className="text-sm font-medium text-slate-700">{stageNameDisplay}</p>
        </div>
      )}

      <div className="flex flex-col gap-2">
        <Label className="text-sm font-medium text-slate-700">{labels.FIELDS.DOCUMENT}</Label>
        <AsyncSelect
          value={selectedDocTypeId}
          onChange={(val) => setSelectedDocTypeId((val as string) ?? null)}
          options={options}
          isSearchable
          isLoading={isLoadingOptions}
          placeholder={labels.PLACEHOLDERS.DOCUMENT}
          onScrollToBottom={handleScrollToBottom}
          onSearchChange={setSearch}
          isDisabled={isSyncing}
        />
        <Button
          type="button"
          variant="outline"
          onClick={handleAddDocument}
          disabled={isAddDisabled || isSyncing}
          className="w-full h-10 text-sm font-medium"
        >
          <Plus className="h-4 w-4 mr-1" />
          Tambah
        </Button>
      </div>

      {requirements.length > 0 && (
        <div className="flex flex-col gap-2">
          <Label className="text-sm font-medium text-slate-700">Dokumen yang Dipilih</Label>
          <div className="flex flex-col gap-2">
            {requirements.map((req) => (
              <div
                key={req.documentTypeId}
                className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3"
              >
                <span className="text-sm text-slate-700 flex-1 mr-2">
                  {getDocTypeName(req.documentTypeId)}
                </span>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <Switch
                      checked={req.isActive}
                      onCheckedChange={() => handleToggleActive(req.documentTypeId)}
                      disabled={isSyncing}
                    />
                    <span className="text-xs text-slate-500 min-w-[40px]">
                      {labels.FIELDS.DOCUMENT_ACTIVE}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Switch
                      checked={req.isMandatory}
                      onCheckedChange={() => handleToggleMandatory(req.documentTypeId)}
                      disabled={isSyncing}
                    />
                    <span className="text-xs text-slate-500 min-w-[48px]">
                      {labels.FIELDS.DOCUMENT_MANDATORY}
                    </span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-slate-400 hover:text-red-500"
                    onClick={() => handleRemoveDocument(req.documentTypeId)}
                    disabled={isSyncing}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </DetailDrawerTemplate>
  );
}
