import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@/shared/utils/test-utils';
import { PLACEHOLDERS, WAREHOUSE_LABELS } from '../../constants';
import { WarehouseForm } from '../WarehouseForm';

describe('WarehouseForm Integration', () => {
  const mockOnSubmit = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    mockOnSubmit.mockClear();
    mockOnCancel.mockClear();
  });

  it('renders all required form fields in create mode', async () => {
    render(<WarehouseForm mode="create" onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    await waitFor(() => {
      expect(screen.getByLabelText(WAREHOUSE_LABELS.CREATE.FIELDS.CODE)).toBeInTheDocument();
      expect(screen.getByLabelText(WAREHOUSE_LABELS.CREATE.FIELDS.NAME)).toBeInTheDocument();
      expect(screen.getByLabelText(WAREHOUSE_LABELS.CREATE.FIELDS.TYPE)).toBeInTheDocument();
      expect(screen.getByLabelText(WAREHOUSE_LABELS.CREATE.FIELDS.COMPANY)).toBeInTheDocument();
      expect(screen.getByLabelText(WAREHOUSE_LABELS.CREATE.FIELDS.STATUS)).toBeInTheDocument();
    });
  });

  it('renders optional geography and address fields', async () => {
    render(<WarehouseForm mode="create" onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    await waitFor(() => {
      expect(screen.getByLabelText(WAREHOUSE_LABELS.CREATE.FIELDS.PROVINCE)).toBeInTheDocument();
      expect(screen.getByLabelText(WAREHOUSE_LABELS.CREATE.FIELDS.LATITUDE)).toBeInTheDocument();
      expect(screen.getByLabelText(WAREHOUSE_LABELS.CREATE.FIELDS.LONGITUDE)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(PLACEHOLDERS.ADDRESS_DETAIL)).toBeInTheDocument();
    });
  });

  it('renders address section header', async () => {
    render(<WarehouseForm mode="create" onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    await waitFor(() => {
      expect(screen.getByText(WAREHOUSE_LABELS.CREATE.FIELDS.ADDRESS_SECTION)).toBeInTheDocument();
    });
  });

  it('displays create mode button text', async () => {
    render(<WarehouseForm mode="create" onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: WAREHOUSE_LABELS.CREATE.BUTTONS.SAVE })
      ).toBeInTheDocument();
    });
  });

  it('displays edit mode button text', async () => {
    render(<WarehouseForm mode="edit" onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: WAREHOUSE_LABELS.EDIT.BUTTONS.SAVE })
      ).toBeInTheDocument();
    });
  });

  it('calls onCancel when cancel button is clicked', async () => {
    const user = userEvent.setup();
    render(<WarehouseForm mode="create" onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    const cancelButton = await screen.findByRole('button', {
      name: WAREHOUSE_LABELS.CREATE.BUTTONS.CANCEL,
    });
    await user.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('submit button is disabled when form is invalid', async () => {
    render(<WarehouseForm mode="create" onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    const submitButton = await screen.findByRole('button', {
      name: WAREHOUSE_LABELS.CREATE.BUTTONS.SAVE,
    });

    await waitFor(() => {
      expect(submitButton).toBeDisabled();
    });
  });

  it('submit button shows loading text when submitting', async () => {
    render(
      <WarehouseForm
        mode="create"
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        isSubmitting={true}
      />
    );

    const submitButton = await screen.findByRole('button', {
      name: WAREHOUSE_LABELS.CREATE.BUTTONS.SAVING,
    });

    await waitFor(() => {
      expect(submitButton).toBeDisabled();
    });
  });

  it('cancel button is disabled when submitting', async () => {
    render(
      <WarehouseForm
        mode="create"
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        isSubmitting={true}
      />
    );

    const cancelButton = await screen.findByRole('button', {
      name: WAREHOUSE_LABELS.CREATE.BUTTONS.CANCEL,
    });

    await waitFor(() => {
      expect(cancelButton).toBeDisabled();
    });
  });

  it('allows typing in text fields', async () => {
    const user = userEvent.setup();
    render(<WarehouseForm mode="create" onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    const codeInput = await screen.findByLabelText(WAREHOUSE_LABELS.CREATE.FIELDS.CODE);
    await user.type(codeInput, 'WH-001');

    await waitFor(() => {
      expect(codeInput).toHaveValue('WH-001');
    });
  });

  it('allows typing in name field', async () => {
    const user = userEvent.setup();
    render(<WarehouseForm mode="create" onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    const nameInput = await screen.findByLabelText(WAREHOUSE_LABELS.CREATE.FIELDS.NAME);
    await user.type(nameInput, 'Gudang Test');

    await waitFor(() => {
      expect(nameInput).toHaveValue('Gudang Test');
    });
  });

  it('renders with warehouse data in edit mode', async () => {
    const warehouse = {
      id: '1',
      code: 'WH-001',
      name: 'Gudang Existing',
      type: 'main',
      isActive: true,
      company: { id: 'c1', code: 'COMP01', name: 'PT Test' },
      province: { id: 'p1', code: 'P01', name: 'Jawa Barat' },
      city: { id: 'city-1', code: 'C01', name: 'Bandung' },
      district: null,
      village: null,
      postalCode: null,
      addressDetail: 'Jl. Test No. 1',
      latitude: '-6.9',
      longitude: '107.6',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    };

    render(
      <WarehouseForm
        mode="edit"
        warehouse={warehouse}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    await waitFor(() => {
      expect(screen.getByLabelText(WAREHOUSE_LABELS.CREATE.FIELDS.CODE)).toHaveValue('WH-001');
      expect(screen.getByLabelText(WAREHOUSE_LABELS.CREATE.FIELDS.NAME)).toHaveValue(
        'Gudang Existing'
      );
    });
  });

  it('displays validation errors on submit with empty required fields', async () => {
    render(<WarehouseForm mode="create" onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    const form = document.getElementById('warehouse-form')!;
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByText(/Kode wajib diisi/i)).toBeInTheDocument();
    });
  });
});
