import userEvent from '@testing-library/user-event';
import { HttpResponse, http } from 'msw';
import { describe, expect, it, vi } from 'vitest';
import { server } from '../../../../mocks/server';
import { render, screen, waitFor } from '../../../../shared/utils/test-utils';
import { ITEM_MASTER_TAB_LABELS, ITEM_MASTER_TABS, ITEM_TYPE_LABELS } from '../../constants';
import { ItemMasterPage } from '../ItemMasterPage';

const mockReplace = vi.fn();
const mockSearchParams = new URLSearchParams();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: mockReplace }),
  usePathname: () => '/master-data/item-master',
  useSearchParams: () => mockSearchParams,
}));

describe('ItemMasterPage Integration', () => {
  afterEach(() => {
    mockReplace.mockClear();
    mockSearchParams.forEach((_, key) => {
      mockSearchParams.delete(key);
    });
  });

  it('renders all 3 tab buttons when user has all permissions', async () => {
    render(<ItemMasterPage />);

    expect(
      await screen.findByRole('button', {
        name: ITEM_MASTER_TAB_LABELS[ITEM_MASTER_TABS.ITEM_TYPE],
      })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: ITEM_MASTER_TAB_LABELS[ITEM_MASTER_TABS.ITEM_CATEGORY] })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: ITEM_MASTER_TAB_LABELS[ITEM_MASTER_TABS.ITEM_CATALOG] })
    ).toBeInTheDocument();
  });

  it('renders only permitted tabs when user has restricted permissions', async () => {
    server.use(
      http.get('/api/v1/auth/me', () => {
        return HttpResponse.json({
          success: true,
          message: 'User retrieved successfully',
          data: {
            id: '1',
            name: 'Restricted User',
            email: 'user@example.com',
            permissions: ['md.im.ictg'],
          },
        });
      })
    );

    render(<ItemMasterPage />);

    expect(
      await screen.findByRole('button', {
        name: ITEM_MASTER_TAB_LABELS[ITEM_MASTER_TABS.ITEM_CATEGORY],
      })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', {
        name: ITEM_MASTER_TAB_LABELS[ITEM_MASTER_TABS.ITEM_TYPE],
      })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', {
        name: ITEM_MASTER_TAB_LABELS[ITEM_MASTER_TABS.ITEM_CATALOG],
      })
    ).not.toBeInTheDocument();
  });

  it('mounts ItemTypeTab by default', async () => {
    render(<ItemMasterPage />);
    expect(
      await screen.findByRole('heading', { name: ITEM_TYPE_LABELS.LIST.TITLE })
    ).toBeInTheDocument();
  });

  it('calls router.replace with tab=item-category when switching to Item Category', async () => {
    const user = userEvent.setup();
    render(<ItemMasterPage />);

    const categoryButton = await screen.findByRole('button', {
      name: ITEM_MASTER_TAB_LABELS[ITEM_MASTER_TABS.ITEM_CATEGORY],
    });
    await user.click(categoryButton);

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith(
        expect.stringContaining(`tab=${ITEM_MASTER_TABS.ITEM_CATEGORY}`),
        { scroll: false }
      );
    });
  });

  it('calls router.replace with tab=item-catalog when switching to Item Catalog', async () => {
    const user = userEvent.setup();
    render(<ItemMasterPage />);

    const catalogButton = await screen.findByRole('button', {
      name: ITEM_MASTER_TAB_LABELS[ITEM_MASTER_TABS.ITEM_CATALOG],
    });
    await user.click(catalogButton);

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith(
        expect.stringContaining(`tab=${ITEM_MASTER_TABS.ITEM_CATALOG}`),
        { scroll: false }
      );
    });
  });

  it('does not include tab param in URL when switching back to Item Type', async () => {
    const user = userEvent.setup();
    render(<ItemMasterPage />);

    const typeButton = await screen.findByRole('button', {
      name: ITEM_MASTER_TAB_LABELS[ITEM_MASTER_TABS.ITEM_TYPE],
    });
    await user.click(typeButton);

    await waitFor(() => {
      const lastCall = mockReplace.mock.calls.at(-1)?.[0] as string;
      expect(lastCall).not.toContain('tab=');
    });
  });
});
