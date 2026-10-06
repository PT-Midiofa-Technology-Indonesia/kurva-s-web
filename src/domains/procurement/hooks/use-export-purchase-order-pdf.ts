'use client';

import { useCallback, useState } from 'react';
import { toast } from '@/shared/lib/toast';
import { downloadFile } from '@/shared/utils/file-download';
import {
  type GeneratePurchaseOrderPdfParams,
  generatePurchaseOrderPdf,
} from '../api/generate-purchase-order-pdf';

const PO_EXPORT_PDF_TOAST_ID = 'po-export-pdf-download';

export interface ExportPurchaseOrderPdfOptions extends GeneratePurchaseOrderPdfParams {
  code?: string;
}

export function useExportPurchaseOrderPdf() {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = useCallback(
    async ({ id, companyId, code }: ExportPurchaseOrderPdfOptions) => {
      try {
        setIsExporting(true);
        toast.progress(PO_EXPORT_PDF_TOAST_ID, {
          title: 'Mengunduh PDF Purchase Order... 0%',
          percent: 0,
        });

        const blob = await generatePurchaseOrderPdf({ id, companyId }, (percent) => {
          toast.progress(PO_EXPORT_PDF_TOAST_ID, {
            title: `Mengunduh PDF Purchase Order... ${percent}%`,
            percent,
          });
        });

        toast.dismiss(PO_EXPORT_PDF_TOAST_ID);
        const filename = code ? `PO-${code}.pdf` : `PO-${id}.pdf`;
        downloadFile(blob, filename);
        toast.success({ title: 'PDF Purchase Order berhasil diunduh' });
      } catch {
        toast.dismiss(PO_EXPORT_PDF_TOAST_ID);
        toast.error({ title: 'Gagal mengunduh PDF Purchase Order' });
      } finally {
        setIsExporting(false);
      }
    },
    []
  );

  return { isExporting, handleExport };
}
