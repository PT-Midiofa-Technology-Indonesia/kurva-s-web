import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@/shared/utils/test-utils';
import { VENDOR_CATALOG_LABELS } from '../../constants';
import { CreateVendorCatalogPage } from '../CreateVendorCatalogPage';

const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

describe('CreateVendorCatalogPage Integration', () => {
  afterEach(() => {
    mockPush.mockClear();
  });

  it('renders without crashing', () => {
    render(<CreateVendorCatalogPage />);
  });

  it('renders page title', () => {
    render(<CreateVendorCatalogPage />);
    expect(screen.getByText(VENDOR_CATALOG_LABELS.CREATE.PAGE_TITLE)).toBeInTheDocument();
  });

  it('renders back button', () => {
    render(<CreateVendorCatalogPage />);
    expect(screen.getByRole('button', { name: 'Back' })).toBeInTheDocument();
  });

  it('renders form fields', async () => {
    render(<CreateVendorCatalogPage />);
    await waitFor(() => {
      expect(screen.getByLabelText(VENDOR_CATALOG_LABELS.CREATE.FIELDS.CODE)).toBeInTheDocument();
      expect(screen.getByLabelText(VENDOR_CATALOG_LABELS.CREATE.FIELDS.NAME)).toBeInTheDocument();
    });
  });

  it('renders geography fields', async () => {
    render(<CreateVendorCatalogPage />);
    await waitFor(() => {
      expect(
        screen.getByLabelText(VENDOR_CATALOG_LABELS.CREATE.FIELDS.PROVINCE)
      ).toBeInTheDocument();
    });
  });

  it('renders cancel and save buttons', async () => {
    render(<CreateVendorCatalogPage />);
    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: VENDOR_CATALOG_LABELS.CREATE.BUTTONS.CANCEL })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: VENDOR_CATALOG_LABELS.CREATE.BUTTONS.SAVE })
      ).toBeInTheDocument();
    });
  });

  it('save button is disabled when required fields are empty', async () => {
    render(<CreateVendorCatalogPage />);
    await waitFor(() => {
      const saveButton = screen.getByRole('button', {
        name: VENDOR_CATALOG_LABELS.CREATE.BUTTONS.SAVE,
      });
      expect(saveButton).toBeDisabled();
    });
  });

  it('navigates back when cancel is clicked', async () => {
    const user = userEvent.setup();
    render(<CreateVendorCatalogPage />);

    const cancelButton = await screen.findByRole('button', {
      name: VENDOR_CATALOG_LABELS.CREATE.BUTTONS.CANCEL,
    });
    await user.click(cancelButton);

    expect(mockPush).toHaveBeenCalledWith('/vendor-management/vendor-catalog');
  });

  it('navigates back when back button is clicked', async () => {
    const user = userEvent.setup();
    render(<CreateVendorCatalogPage />);

    const backButton = await screen.findByRole('button', { name: 'Back' });
    await user.click(backButton);

    expect(mockPush).toHaveBeenCalledWith('/vendor-management/vendor-catalog');
  });

  it('displays confirm dialog configuration', () => {
    render(<CreateVendorCatalogPage />);
    expect(VENDOR_CATALOG_LABELS.CREATE.DIALOG.TITLE).toBe('Simpan Vendor Baru?');
    expect(VENDOR_CATALOG_LABELS.CREATE.DIALOG.CONFIRM).toBe('Simpan');
  });
});
