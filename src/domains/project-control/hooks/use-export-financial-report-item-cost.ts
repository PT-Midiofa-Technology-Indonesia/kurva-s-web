'use client';

import { useCallback, useState } from 'react';
import { toast } from '@/shared/lib/toast';
import { downloadFile } from '@/shared/utils/file-download';
import { exportFinancialReportItemCost } from '../api/export-financial-report-item-cost';

export function useExportFinancialReportItemCost(projectId: string) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = useCallback(
    async (itemId: string, itemName?: string) => {
      try {
        setIsExporting(true);
        const blob = await exportFinancialReportItemCost(projectId, itemId);
        downloadFile(blob, `financial-report-cost-${itemName ?? itemId}.xlsx`);
        toast.success({ title: 'Detail biaya berhasil diunduh' });
      } catch {
        toast.error({ title: 'Gagal mengunduh detail biaya' });
      } finally {
        setIsExporting(false);
      }
    },
    [projectId]
  );

  return { isExporting, handleExport };
}
