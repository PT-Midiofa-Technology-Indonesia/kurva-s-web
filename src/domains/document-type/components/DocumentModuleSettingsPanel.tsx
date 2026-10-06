'use client';

import { Loader2, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { DetailDrawerTemplate } from '@/components/templates';
import { AsyncSelect, Button } from '@/shared/components/atoms';
import { ConfirmDialog } from '@/shared/components/molecules/AlertDialog';
import { Label } from '@/shared/components/ui/label';
import { Switch } from '@/shared/components/ui/switch';
import { syncDocumentModule } from '../api/document-modules';
import { useDocumentTypesInfinite } from '../hooks/use-document-types-infinite';
import type { DocumentModule, ModuleDocument, SyncModuleRequest } from '../types/document-module';

interface DocumentModuleSettingsPanelProps {
  open: boolean;
  onClose: () => void;
  module: DocumentModule | null;
  onSuccess?: () => void;
}

interface DocumentConfig extends ModuleDocument {
  isMandatory: boolean;
}

export function DocumentModuleSettingsPanel({
  open,
  onClose,
  module,
  onSuccess,
}: DocumentModuleSettingsPanelProps) {
  const [documentConfigs, setDocumentConfigs] = useState<DocumentConfig[]>([]);
  const [selectedDocId, setSelectedDocId] = useState<string>('');
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [search, setSearch] = useState('');
  const initialStateRef = useRef<DocumentConfig[] | null>(null);

  const {
    options,
    isLoading: isLoadingOptions,
    hasMore,
    loadMore,
  } = useDocumentTypesInfinite({
    search,
    isActive: true,
  });

  // Initialize from module data
  useEffect(() => {
    if (open && module && initialStateRef.current === null) {
      const configs: DocumentConfig[] = [
        ...module.mandatoryDocs.map((doc) => ({ ...doc, isMandatory: true, isActive: true })),
        ...module.optionalDocs.map((doc) => ({ ...doc, isMandatory: false, isActive: true })),
      ];
      setDocumentConfigs(configs);
      initialStateRef.current = configs;
      setSelectedDocId('');
    }
    if (!open) {
      initialStateRef.current = null;
      setSelectedDocId('');
      setSearch('');
    }
  }, [open, module]);

  // Handle adding document from select
  const handleAddDocument = useCallback(
    (docId: string) => {
      if (!docId) return;
      if (documentConfigs.some((d) => d.id === docId)) return;

      const option = options.find((o) => o.value === docId);
      if (!option) return;

      setDocumentConfigs([
        ...documentConfigs,
        {
          id: docId,
          code: option.label.split(' - ')[0] || '',
          name: option.label.split(' - ')[1] || option.label,
          isMandatory: false,
          isActive: true,
        },
      ]);
      setSelectedDocId('');
    },
    [documentConfigs, options]
  );

  const handleDeleteDocument = (docId: string) => {
    setDocumentConfigs(documentConfigs.filter((d) => d.id !== docId));
  };

  const handleToggleMandatory = (docId: string, isMandatory: boolean) => {
    setDocumentConfigs(documentConfigs.map((d) => (d.id === docId ? { ...d, isMandatory } : d)));
  };

  const handleToggleActive = (docId: string, isActive: boolean) => {
    setDocumentConfigs(documentConfigs.map((d) => (d.id === docId ? { ...d, isActive } : d)));
  };

  const handleSave = async () => {
    if (!module) return;
    setIsConfirmOpen(false);
    setIsSaving(true);
    try {
      const payload: SyncModuleRequest = {
        documents: documentConfigs.map((doc) => ({
          documentTypeId: doc.id,
          isMandatory: doc.isMandatory,
          isActive: doc.isActive,
        })),
      };
      await syncDocumentModule(module.module, payload);
      initialStateRef.current = null;
      onSuccess?.();
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  const handleScrollToBottom = useCallback(() => {
    if (hasMore) loadMore();
  }, [hasMore, loadMore]);

  const handleSelectDocument = useCallback(
    (val: string | string[] | null | undefined) => {
      if (val && typeof val === 'string') {
        handleAddDocument(val);
      }
    },
    [handleAddDocument]
  );

  const hasChanges = useMemo(() => {
    if (initialStateRef.current === null) return false;
    if (documentConfigs.length !== initialStateRef.current.length) return true;
    return !documentConfigs.every((config) => {
      const initial = initialStateRef.current!.find((d) => d.id === config.id);
      return (
        initial &&
        initial.isMandatory === config.isMandatory &&
        initial.isActive === config.isActive
      );
    });
  }, [documentConfigs]);

  const unusedDocuments = useMemo(
    () => options.filter((o) => !documentConfigs.some((d) => d.id === o.value)),
    [options, documentConfigs]
  );

  return (
    <>
      <DetailDrawerTemplate
        open={open}
        onClose={onClose}
        title="Pengaturan Modul"
        closeLabel="Batal"
        customFooter={
          <Button
            onClick={() => setIsConfirmOpen(true)}
            disabled={!hasChanges || isSaving}
            className="w-full"
          >
            {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
          </Button>
        }
      >
        {!module ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {/* Module Section Header */}
            <div className="rounded-lg bg-slate-100 px-4 py-3">
              <p className="text-sm font-medium text-slate-700 capitalize">Modul {module.module}</p>
            </div>

            {/* Add Document Select */}
            <div className="flex flex-col gap-2">
              <Label className="text-sm font-medium text-slate-700">Tambah dokumen</Label>
              <AsyncSelect
                value={selectedDocId}
                onChange={handleSelectDocument}
                options={unusedDocuments}
                isSearchable
                isLoading={isLoadingOptions}
                placeholder="Tambah dokumen"
                onScrollToBottom={handleScrollToBottom}
                onSearchChange={setSearch}
                isClearable
                className="w-full"
              />
            </div>

            {/* Document Configs */}
            <div className="flex flex-col gap-3">
              {documentConfigs.length === 0 ? (
                <p className="text-sm text-slate-500">Tidak ada dokumen yang dikonfigurasi</p>
              ) : (
                documentConfigs.map((config) => (
                  <div
                    key={config.id}
                    className="flex items-start justify-between rounded-lg border border-slate-200 bg-white px-4 py-3"
                  >
                    <div className="flex flex-1 flex-col gap-2">
                      <p className="text-sm font-medium text-slate-900">{config.name}</p>

                      {/* Mandatory Toggle */}
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={config.isMandatory}
                          onCheckedChange={(checked) => handleToggleMandatory(config.id, checked)}
                        />
                        <Label className="text-xs text-slate-600">
                          {config.isMandatory ? 'Dokumen Wajib' : 'Dokumen Lainnya'}
                        </Label>
                      </div>

                      {/* Active Toggle */}
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={config.isActive}
                          onCheckedChange={(checked) => handleToggleActive(config.id, checked)}
                        />
                        <Label className="text-xs text-slate-600">
                          {config.isActive ? 'Aktif' : 'Tidak Aktif'}
                        </Label>
                      </div>
                    </div>

                    {/* Delete Button */}
                    <button
                      type="button"
                      onClick={() => handleDeleteDocument(config.id)}
                      className="ml-3 mt-1 shrink-0 rounded p-1 text-red-500 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </DetailDrawerTemplate>

      <ConfirmDialog
        open={isConfirmOpen}
        onOpenChange={setIsConfirmOpen}
        title="Konfirmasi Perubahan"
        description="Anda yakin untuk menambah dan merubah pengaturan modul?"
        cancelText="Batal"
        confirmText="Simpan"
        onCancel={() => setIsConfirmOpen(false)}
        onConfirm={handleSave}
      />
    </>
  );
}
