'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useRef, useState } from 'react';
import { toast } from '@/shared/lib/toast';
import { downloadFile } from '@/shared/utils/file-download';
import { downloadItemCatalogTemplate } from '../api/download-item-master-template';
import { importItemCatalogs } from '../api/import-item-masters';
import { ITEM_CATALOG_LABELS } from '../constants';
import { ITEM_CATALOG_QUERY_KEYS } from './use-item-catalogs';

const { IMPORT_EXPORT } = ITEM_CATALOG_LABELS.LIST;

interface UseItemCatalogImportExportOptions {
  onSuccess?: () => void;
}

export function useItemCatalogImportExport(options?: UseItemCatalogImportExportOptions) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const queryClient = useQueryClient();

  const handleDownloadTemplate = useCallback(async () => {
    try {
      setIsDownloading(true);
      toast.progress(IMPORT_EXPORT.TOAST_DOWNLOAD_ID, {
        title: IMPORT_EXPORT.MESSAGES.DOWNLOAD_PROGRESS(0),
        percent: 0,
      });

      const blob = await downloadItemCatalogTemplate((percent) => {
        toast.progress(IMPORT_EXPORT.TOAST_DOWNLOAD_ID, {
          title: IMPORT_EXPORT.MESSAGES.DOWNLOAD_PROGRESS(percent),
          percent,
        });
      });

      toast.dismiss(IMPORT_EXPORT.TOAST_DOWNLOAD_ID);
      downloadFile(blob, IMPORT_EXPORT.FILE_NAME);
      toast.success({ title: IMPORT_EXPORT.MESSAGES.DOWNLOAD_SUCCESS });
    } catch {
      toast.dismiss(IMPORT_EXPORT.TOAST_DOWNLOAD_ID);
      toast.error({ title: IMPORT_EXPORT.MESSAGES.DOWNLOAD_ERROR });
    } finally {
      setIsDownloading(false);
    }
  }, []);

  const handleImport = useCallback(
    async (file: File) => {
      try {
        setIsImporting(true);
        toast.progress(IMPORT_EXPORT.TOAST_IMPORT_ID, {
          title: IMPORT_EXPORT.MESSAGES.IMPORT_PROGRESS(0),
          percent: 0,
        });

        const result = await importItemCatalogs(file, (percent) => {
          toast.progress(IMPORT_EXPORT.TOAST_IMPORT_ID, {
            title:
              percent < 90
                ? IMPORT_EXPORT.MESSAGES.IMPORT_PROGRESS(percent)
                : IMPORT_EXPORT.MESSAGES.IMPORT_PROCESSING,
            percent,
          });
        });

        if (fileInputRef.current) fileInputRef.current.value = '';

        const errorMessages = result.failed_rows[0]?.errors?.join('\n') || '';

        if (result.failed_count === 0) {
          toast.success({ title: IMPORT_EXPORT.MESSAGES.IMPORT_SUCCESS(result.success_count) });
          await queryClient.invalidateQueries({ queryKey: ITEM_CATALOG_QUERY_KEYS.all });
          await queryClient.invalidateQueries({ queryKey: ITEM_CATALOG_QUERY_KEYS.infinite() });
          options?.onSuccess?.();
        } else if (result.success_count === 0) {
          toast.error({
            title: result.message || IMPORT_EXPORT.MESSAGES.IMPORT_FAILED(result.failed_count),
            description: errorMessages,
          });
        } else {
          toast.warning({
            title: `${result.success_count} data berhasil, ${result.failed_count} data gagal`,
            description: errorMessages || result.message,
          });
          await queryClient.invalidateQueries({ queryKey: ITEM_CATALOG_QUERY_KEYS.all });
          await queryClient.invalidateQueries({ queryKey: ITEM_CATALOG_QUERY_KEYS.infinite() });
          options?.onSuccess?.();
        }
      } catch {
        toast.error({ title: IMPORT_EXPORT.MESSAGES.IMPORT_ERROR });
      } finally {
        toast.dismiss(IMPORT_EXPORT.TOAST_IMPORT_ID);
        setIsImporting(false);
      }
    },
    [options?.onSuccess, queryClient]
  );

  return {
    fileInputRef,
    isDownloading,
    isImporting,
    handleDownloadTemplate,
    handleImport,
  };
}
