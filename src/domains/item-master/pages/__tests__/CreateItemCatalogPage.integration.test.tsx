import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '../../../../shared/utils/test-utils';
import { ITEM_CATALOG_LABELS, ITEM_MASTER_TABS } from '../../constants';
import { CreateItemCatalogPage } from '../CreateItemCatalogPage';

const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => '/master-data/item-master/create',
  useSearchParams: () => new URLSearchParams(`tab=${ITEM_MASTER_TABS.ITEM_CATALOG}`),
  useParams: () => ({}),
}));

describe('CreateItemCatalogPage Integration', () => {
  beforeEach(() => {
    mockPush.mockClear();
  });

  it('renders page title', () => {
    render(<CreateItemCatalogPage />);

    expect(
      screen.getByRole('heading', { name: ITEM_CATALOG_LABELS.FORM.CREATE_TITLE })
    ).toBeInTheDocument();
  });

  it('renders form with code and name fields', () => {
    render(<CreateItemCatalogPage />);

    expect(screen.getByLabelText(/Kode/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Nama Item Catalog/i)).toBeInTheDocument();
  });

  it('renders form with item type field', () => {
    render(<CreateItemCatalogPage />);

    expect(screen.getByLabelText(/Item Type/i)).toBeInTheDocument();
  });

  it('renders back button', () => {
    render(<CreateItemCatalogPage />);

    const backButtons = screen.getAllByRole('button', {
      name: ITEM_CATALOG_LABELS.FORM.BUTTONS.BACK,
    });
    expect(backButtons.length).toBeGreaterThan(0);
  });

  it('renders save button', () => {
    render(<CreateItemCatalogPage />);

    expect(
      screen.getByRole('button', { name: ITEM_CATALOG_LABELS.FORM.BUTTONS.SAVE })
    ).toBeInTheDocument();
  });

  it('calls router.push when back button is clicked', async () => {
    const user = userEvent.setup();
    render(<CreateItemCatalogPage />);

    const backButtons = screen.getAllByRole('button', {
      name: ITEM_CATALOG_LABELS.FORM.BUTTONS.BACK,
    });
    await user.click(backButtons[0]);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith(
        expect.stringContaining(`tab=${ITEM_MASTER_TABS.ITEM_CATALOG}`)
      );
    });
  });
});
