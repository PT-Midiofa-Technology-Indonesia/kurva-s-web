import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@/shared/utils/test-utils';
import { WAREHOUSE_LABELS } from '../../constants';
import { CreateWarehousePage } from '../CreateWarehousePage';

const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

describe('CreateWarehousePage Integration', () => {
  afterEach(() => {
    mockPush.mockClear();
  });

  it('renders without crashing', () => {
    render(<CreateWarehousePage />);
  });

  it('renders page title', () => {
    render(<CreateWarehousePage />);
    expect(screen.getByText(WAREHOUSE_LABELS.CREATE.PAGE_TITLE)).toBeInTheDocument();
  });

  it('renders back button', () => {
    render(<CreateWarehousePage />);
    expect(screen.getByRole('button', { name: 'Back' })).toBeInTheDocument();
  });

  it('renders form fields', async () => {
    render(<CreateWarehousePage />);
    await waitFor(() => {
      expect(screen.getByLabelText(WAREHOUSE_LABELS.CREATE.FIELDS.CODE)).toBeInTheDocument();
      expect(screen.getByLabelText(WAREHOUSE_LABELS.CREATE.FIELDS.NAME)).toBeInTheDocument();
      expect(screen.getByLabelText(WAREHOUSE_LABELS.CREATE.FIELDS.TYPE)).toBeInTheDocument();
      expect(screen.getByLabelText(WAREHOUSE_LABELS.CREATE.FIELDS.COMPANY)).toBeInTheDocument();
      expect(screen.getByLabelText(WAREHOUSE_LABELS.CREATE.FIELDS.STATUS)).toBeInTheDocument();
    });
  });

  it('renders geography fields', async () => {
    render(<CreateWarehousePage />);
    await waitFor(() => {
      expect(screen.getByLabelText(WAREHOUSE_LABELS.CREATE.FIELDS.PROVINCE)).toBeInTheDocument();
    });
  });

  it('renders address section header', async () => {
    render(<CreateWarehousePage />);
    await waitFor(() => {
      expect(screen.getByText(WAREHOUSE_LABELS.CREATE.FIELDS.ADDRESS_SECTION)).toBeInTheDocument();
    });
  });

  it('renders cancel and save buttons', async () => {
    render(<CreateWarehousePage />);
    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: WAREHOUSE_LABELS.CREATE.BUTTONS.CANCEL })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: WAREHOUSE_LABELS.CREATE.BUTTONS.SAVE })
      ).toBeInTheDocument();
    });
  });

  it('save button is disabled when required fields are empty', async () => {
    render(<CreateWarehousePage />);
    await waitFor(() => {
      const saveButton = screen.getByRole('button', { name: WAREHOUSE_LABELS.CREATE.BUTTONS.SAVE });
      expect(saveButton).toBeDisabled();
    });
  });

  it('navigates back when cancel is clicked', async () => {
    const user = userEvent.setup();
    render(<CreateWarehousePage />);

    const cancelButton = await screen.findByRole('button', {
      name: WAREHOUSE_LABELS.CREATE.BUTTONS.CANCEL,
    });
    await user.click(cancelButton);

    expect(mockPush).toHaveBeenCalledWith('/organization/warehouse');
  });

  it('navigates back when back button is clicked', async () => {
    const user = userEvent.setup();
    render(<CreateWarehousePage />);

    const backButton = await screen.findByRole('button', { name: 'Back' });
    await user.click(backButton);

    expect(mockPush).toHaveBeenCalledWith('/organization/warehouse');
  });

  it('displays confirm dialog configuration', () => {
    render(<CreateWarehousePage />);
    expect(WAREHOUSE_LABELS.CREATE.DIALOG.TITLE).toBe('Simpan Warehouse Baru?');
    expect(WAREHOUSE_LABELS.CREATE.DIALOG.CONFIRM).toBe('Simpan');
  });
});
