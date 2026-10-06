import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useExportBillingProgressPdf } from './use-export-billing-progress-pdf';

const exportBillingProgressPdfMock = vi.fn();
const downloadFileMock = vi.fn();
const toastProgressMock = vi.fn();
const toastDismissMock = vi.fn();
const toastSuccessMock = vi.fn();
const toastErrorMock = vi.fn();

vi.mock('../api/export-billing-progress-pdf', () => ({
  exportBillingProgressPdf: (...args: unknown[]) => exportBillingProgressPdfMock(...args),
}));

vi.mock('@/shared/utils/file-download', () => ({
  downloadFile: (...args: unknown[]) => downloadFileMock(...args),
}));

vi.mock('@/shared/lib/toast', () => ({
  toast: {
    progress: (...args: unknown[]) => toastProgressMock(...args),
    dismiss: (...args: unknown[]) => toastDismissMock(...args),
    success: (...args: unknown[]) => toastSuccessMock(...args),
    error: (...args: unknown[]) => toastErrorMock(...args),
  },
}));

describe('useExportBillingProgressPdf', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows progress toast and downloads file on success', async () => {
    const blob = new Blob(['pdf'], { type: 'application/pdf' });

    exportBillingProgressPdfMock.mockImplementation(
      async (
        params: { billingId: string; companyId?: string },
        onDownloadProgress?: (percent: number) => void
      ) => {
        expect(params).toEqual({ billingId: 'billing-1', companyId: 'company-1' });
        onDownloadProgress?.(42);
        return blob;
      }
    );

    const { result } = renderHook(() => useExportBillingProgressPdf());

    await act(async () => {
      await result.current.handleExport({ billingId: 'billing-1', companyId: 'company-1' });
    });

    expect(toastProgressMock).toHaveBeenNthCalledWith(1, 'billing-progress-pdf-download', {
      title: 'Mengunduh PDF tagihan... 0%',
      percent: 0,
    });
    expect(toastProgressMock).toHaveBeenNthCalledWith(2, 'billing-progress-pdf-download', {
      title: 'Mengunduh PDF tagihan... 42%',
      percent: 42,
    });
    expect(toastDismissMock).toHaveBeenCalledWith('billing-progress-pdf-download');
    expect(downloadFileMock).toHaveBeenCalledWith(blob, 'billing-progress-billing-1.pdf');
    expect(toastSuccessMock).toHaveBeenCalledWith({ title: 'PDF tagihan berhasil diunduh' });
    expect(result.current.isExporting).toBe(false);
  });

  it('dismisses progress toast and shows error on failure', async () => {
    exportBillingProgressPdfMock.mockRejectedValue(new Error('fail'));

    const { result } = renderHook(() => useExportBillingProgressPdf());

    await act(async () => {
      await result.current.handleExport({ billingId: 'billing-2' });
    });

    expect(toastProgressMock).toHaveBeenCalledWith('billing-progress-pdf-download', {
      title: 'Mengunduh PDF tagihan... 0%',
      percent: 0,
    });
    expect(toastDismissMock).toHaveBeenCalledWith('billing-progress-pdf-download');
    expect(downloadFileMock).not.toHaveBeenCalled();
    expect(toastErrorMock).toHaveBeenCalledWith({ title: 'Gagal mengunduh PDF tagihan' });
    expect(result.current.isExporting).toBe(false);
  });
});
