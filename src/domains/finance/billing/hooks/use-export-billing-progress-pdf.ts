'use client';

import { useCallback, useState } from 'react';
import { toast } from '@/shared/lib/toast';
import { downloadFile } from '@/shared/utils/file-download';
import {
  type ExportBillingProgressPdfParams,
  exportBillingProgressPdf,
} from '../api/export-billing-progress-pdf';

const BILLING_EXPORT_PDF_TOAST_ID = 'billing-progress-pdf-download';

export function useExportBillingProgressPdf() {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = useCallback(
    async ({ billingId, companyId }: ExportBillingProgressPdfParams) => {
      try {
        setIsExporting(true);
        toast.progress(BILLING_EXPORT_PDF_TOAST_ID, {
          title: 'Mengunduh PDF tagihan... 0%',
          percent: 0,
        });

        const blob = await exportBillingProgressPdf({ billingId, companyId }, (percent) => {
          toast.progress(BILLING_EXPORT_PDF_TOAST_ID, {
            title: `Mengunduh PDF tagihan... ${percent}%`,
            percent,
          });
        });

        toast.dismiss(BILLING_EXPORT_PDF_TOAST_ID);
        downloadFile(blob, `billing-progress-${billingId}.pdf`);
        toast.success({ title: 'PDF tagihan berhasil diunduh' });
      } catch {
        toast.dismiss(BILLING_EXPORT_PDF_TOAST_ID);
        toast.error({ title: 'Gagal mengunduh PDF tagihan' });
      } finally {
        setIsExporting(false);
      }
    },
    []
  );

  return { isExporting, handleExport };
}
