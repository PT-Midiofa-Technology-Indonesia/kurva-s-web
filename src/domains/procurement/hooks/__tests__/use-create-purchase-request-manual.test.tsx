import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as createManualAPI from '@/domains/procurement/api/create-purchase-request-manual';
import { toast } from '@/shared/lib/toast';
import { useCreatePurchaseRequestManual } from '../use-create-purchase-request-manual';
import { PROCUREMENT_QUERY_KEYS } from '../use-purchase-requests';

const queryClient = new QueryClient();
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

const payload = {
  companyId: 'comp-001',
  projectId: 'proj-001',
  dateRequired: '2026-07-15',
  notes: 'Permintaan semen dan besi untuk fondasi utama',
  items: [
    {
      itemType: 'materialTool' as const,
      item: [{ boqItemCostId: 'cost-1', quantity: 50, remarks: 'Merek Tiga Roda' }],
    },
  ],
};

describe('useCreatePurchaseRequestManual', () => {
  beforeEach(() => {
    queryClient.clear();
    vi.spyOn(createManualAPI, 'createPurchaseRequestManual').mockReset();
  });

  it('creates the manual PR and invalidates procurement queries (list + cost rows)', async () => {
    const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries');
    const toastSuccessSpy = vi.spyOn(toast, 'success');
    vi.spyOn(createManualAPI, 'createPurchaseRequestManual').mockResolvedValue(undefined);

    const { result } = renderHook(() => useCreatePurchaseRequestManual(), { wrapper });

    result.current.mutate(payload);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(createManualAPI.createPurchaseRequestManual).toHaveBeenCalledWith(payload);
    // `.all` prefix-matches both lists() and costRows() so Existing PR
    // updates without a hard refresh after creating a PR.
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: PROCUREMENT_QUERY_KEYS.all,
    });
    expect(toastSuccessSpy).toHaveBeenCalled();
  });

  it('shows an error toast when creation fails', async () => {
    const toastErrorSpy = vi.spyOn(toast, 'error');
    vi.spyOn(createManualAPI, 'createPurchaseRequestManual').mockRejectedValue(
      new Error('Gagal membuat purchase request')
    );

    const { result } = renderHook(() => useCreatePurchaseRequestManual(), { wrapper });

    result.current.mutate(payload);

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(toastErrorSpy).toHaveBeenCalled();
  });
});
