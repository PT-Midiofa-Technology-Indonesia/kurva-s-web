import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '../../../../shared/utils/test-utils';
import { ITEM_CATALOG_LABELS } from '../../constants';
import { ItemCatalogTab } from '../ItemCatalogTab';

const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => '/master-data/item-master',
  useSearchParams: () => new URLSearchParams('tab=catalog'),
  useParams: () => ({}),
}));

describe('ItemCatalogTab Integration', () => {
  beforeEach(() => {
    mockPush.mockClear();
  });

  it('renders page title', () => {
    render(<ItemCatalogTab />);

    expect(
      screen.getByRole('heading', { name: ITEM_CATALOG_LABELS.LIST.TITLE })
    ).toBeInTheDocument();
  });

  it('renders import export menu button', () => {
    render(<ItemCatalogTab />);

    expect(screen.getAllByRole('button').length).toBeGreaterThan(0);
    expect(
      screen.getByRole('button', { name: ITEM_CATALOG_LABELS.LIST.ADD_BUTTON })
    ).toBeInTheDocument();
  });

  it('renders search input', () => {
    render(<ItemCatalogTab />);

    expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument();
  });

  it('renders add button and opens import export menu', async () => {
    const user = userEvent.setup();
    render(<ItemCatalogTab />);

    expect(
      screen.getByRole('button', { name: ITEM_CATALOG_LABELS.LIST.ADD_BUTTON })
    ).toBeInTheDocument();

    const menuButton = screen.getAllByRole('button')[1];
    await user.click(menuButton);

    await waitFor(() => {
      expect(
        screen.getByText(ITEM_CATALOG_LABELS.LIST.BUTTONS.DOWNLOAD_TEMPLATE)
      ).toBeInTheDocument();
    });
  });

  it('renders page layout container', () => {
    render(<ItemCatalogTab />);

    expect(
      screen.getByRole('heading', { name: ITEM_CATALOG_LABELS.LIST.TITLE })
    ).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument();
  });
});
