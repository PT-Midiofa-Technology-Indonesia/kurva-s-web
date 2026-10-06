import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as createBundleAPI from '@/domains/procurement/api/create-purchase-request-bundle';
import { toast } from '@/shared/lib/toast';
import { useCreatePurchaseRequestBundle } from '../use-create-purchase-request-bundle';
import { PROCUREMENT_QUERY_KEYS } from '../use-purchase-requests';

const queryClient = new QueryClient();
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

const payload = {
  companyId: 'comp-001',
  projectId: 'proj-001',
  boqItemId: 'item-001',
  categories: ['material', 'manpower', 'equipment'] as const,
  dateRequired: '2026-07-20',
  notes: 'Bundle seluruh pekerjaan struktur lantai 1 ke subkontraktor',
};

describe('useCreatePurchaseRequestBundle', () => {
  beforeEach(() => {
    queryClient.clear();
    vi.spyOn(createBundleAPI, 'createPurchaseRequestBundle').mockReset();
  });

  it('creates the bundle PR and invalidates procurement queries (list + cost rows)', async () => {
    const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries');
    const toastSuccessSpy = vi.spyOn(toast, 'success');
    vi.spyOn(createBundleAPI, 'createPurchaseRequestBundle').mockResolvedValue(undefined);

    const { result } = renderHook(() => useCreatePurchaseRequestBundle(), { wrapper });

    result.current.mutate({ ...payload, categories: [...payload.categories] });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(createBundleAPI.createPurchaseRequestBundle).toHaveBeenCalledWith({
      ...payload,
      categories: [...payload.categories],
    });
    // `.all` prefix-matches both lists() and costRows() so Existing PR
    // updates without a hard refresh after creating a PR.
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: PROCUREMENT_QUERY_KEYS.all,
    });
    expect(toastSuccessSpy).toHaveBeenCalled();
  });

  it('shows an error toast when creation fails', async () => {
    const toastErrorSpy = vi.spyOn(toast, 'error');
    vi.spyOn(createBundleAPI, 'createPurchaseRequestBundle').mockRejectedValue(
      new Error('Gagal membuat bundle purchase request')
    );

    const { result } = renderHook(() => useCreatePurchaseRequestBundle(), { wrapper });

    result.current.mutate({ ...payload, categories: [...payload.categories] });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(toastErrorSpy).toHaveBeenCalled();
  });
});
