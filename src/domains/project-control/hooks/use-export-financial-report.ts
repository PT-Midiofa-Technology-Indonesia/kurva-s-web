'use client';

import { useCallback, useState } from 'react';
import { toast } from '@/shared/lib/toast';
import { downloadFile } from '@/shared/utils/file-download';
import { exportFinancialReport } from '../api/export-financial-report';
import type { GetFinancialReportParams } from '../api/get-financial-report';

export function useExportFinancialReport(projectId: string) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = useCallback(
    async (params?: GetFinancialReportParams) => {
      try {
        setIsExporting(true);
        const blob = await exportFinancialReport(projectId, params);
        downloadFile(blob, `financial-report-${projectId}.xlsx`);
        toast.success({ title: 'Laporan keuangan berhasil diunduh' });
      } catch {
        toast.error({ title: 'Gagal mengunduh laporan keuangan' });
      } finally {
        setIsExporting(false);
      }
    },
    [projectId]
  );

  return { isExporting, handleExport };
}
