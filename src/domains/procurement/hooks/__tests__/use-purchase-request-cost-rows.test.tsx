import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as getCostRowsAPI from '@/domains/procurement/api/get-purchase-request-cost-rows';
import { usePurchaseRequestCostRows } from '../use-purchase-request-cost-rows';

const queryClient = new QueryClient();
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

describe('usePurchaseRequestCostRows', () => {
  beforeEach(() => {
    queryClient.clear();
    vi.spyOn(getCostRowsAPI, 'getPurchaseRequestCostRows').mockReset();
  });

  it('fetches cost rows for the given boqItemId when enabled', async () => {
    vi.spyOn(getCostRowsAPI, 'getPurchaseRequestCostRows').mockResolvedValue({
      sections: [
        { type: 'material', label: 'Material', rows: [] },
        { type: 'equipment', label: 'Jasa Penyewaan', rows: [] },
        { type: 'manpower', label: 'Jasa Pengerjaan', rows: [] },
      ],
    });

    const { result } = renderHook(() => usePurchaseRequestCostRows('item-1', { enabled: true }), {
      wrapper,
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(getCostRowsAPI.getPurchaseRequestCostRows).toHaveBeenCalledWith('item-1');
    expect(result.current.data?.sections).toHaveLength(3);
  });

  it('does not fetch when boqItemId is null', () => {
    renderHook(() => usePurchaseRequestCostRows(null), { wrapper });
    expect(getCostRowsAPI.getPurchaseRequestCostRows).not.toHaveBeenCalled();
  });

  it('does not fetch when enabled is explicitly false', () => {
    renderHook(() => usePurchaseRequestCostRows('item-1', { enabled: false }), { wrapper });
    expect(getCostRowsAPI.getPurchaseRequestCostRows).not.toHaveBeenCalled();
  });
});
