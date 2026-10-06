import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useBOQDetailPage } from '../use-boq-detail-page';
import * as useProjectBOQModule from '../use-project-boq';

const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => '/project-control/project/proj-1/boq',
  useSearchParams: () => new URLSearchParams(),
  useParams: () => ({ id: 'proj-1' }),
}));

const queryClient = new QueryClient();
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

const projectBOQData = {
  project: {
    id: 'proj-1',
    code: 'PRJ-1',
    name: 'Office Building',
    company: { id: 'comp-1', name: 'PT Test' },
    client: { id: 'client-1', name: 'Client' },
  },
  boq: { items: [] },
};

describe('useBOQDetailPage', () => {
  beforeEach(() => {
    queryClient.clear();
    vi.spyOn(useProjectBOQModule, 'useProjectBOQ').mockReturnValue({
      data: projectBOQData,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useProjectBOQModule.useProjectBOQ>);
  });

  it('opens the manual PR dialog scoped to the clicked row', () => {
    const { result } = renderHook(() => useBOQDetailPage({ projectId: 'proj-1' }), { wrapper });

    expect(result.current.manualPrDialog).toEqual({
      open: false,
      boqItemId: null,
      itemName: null,
    });

    act(() => {
      result.current.handleCreatePR({ id: 'item-1', name: 'Penataan Bata Dinding' } as never);
    });

    expect(result.current.manualPrDialog).toEqual({
      open: true,
      boqItemId: 'item-1',
      itemName: 'Penataan Bata Dinding',
    });
  });

  it('opens the bundle PR dialog scoped to the clicked row', () => {
    const { result } = renderHook(() => useBOQDetailPage({ projectId: 'proj-1' }), { wrapper });

    act(() => {
      result.current.handleCreatePRBundle({ id: 'item-2', name: 'Pekerjaan Struktur' } as never);
    });

    expect(result.current.bundlePrDialog).toEqual({
      open: true,
      boqItemId: 'item-2',
      itemName: 'Pekerjaan Struktur',
    });
  });

  it('closes dialogs via closeManualPrDialog/closeBundlePrDialog', () => {
    const { result } = renderHook(() => useBOQDetailPage({ projectId: 'proj-1' }), { wrapper });

    act(() => {
      result.current.handleCreatePR({ id: 'item-1', name: 'Penataan Bata Dinding' } as never);
    });
    act(() => {
      result.current.closeManualPrDialog();
    });

    expect(result.current.manualPrDialog).toEqual({
      open: false,
      boqItemId: null,
      itemName: null,
    });
  });
});
