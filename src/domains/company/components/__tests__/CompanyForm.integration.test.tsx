import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@/shared/utils/test-utils';
import { COMPANY_LABELS, PLACEHOLDERS } from '../../constants';
import { CompanyForm } from '../CompanyForm';

describe('CompanyForm Integration', () => {
  const mockOnSubmit = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    mockOnSubmit.mockClear();
    mockOnCancel.mockClear();
  });

  it('renders all required form fields in create mode', async () => {
    render(<CompanyForm mode="create" onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    await waitFor(() => {
      expect(screen.getByLabelText(COMPANY_LABELS.CREATE.FIELDS.CODE)).toBeInTheDocument();
      expect(screen.getByLabelText(COMPANY_LABELS.CREATE.FIELDS.NAME)).toBeInTheDocument();
      expect(screen.getByLabelText(COMPANY_LABELS.CREATE.FIELDS.STATUS)).toBeInTheDocument();
    });
  });

  it('renders optional form fields', async () => {
    render(<CompanyForm mode="create" onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    await waitFor(() => {
      expect(screen.getByLabelText(COMPANY_LABELS.CREATE.FIELDS.NPWP)).toBeInTheDocument();
      expect(screen.getByLabelText(COMPANY_LABELS.CREATE.FIELDS.SIUP_NUMBER)).toBeInTheDocument();
      expect(screen.getByLabelText(COMPANY_LABELS.CREATE.FIELDS.PHONE)).toBeInTheDocument();
      expect(screen.getByLabelText(COMPANY_LABELS.CREATE.FIELDS.EMAIL)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(PLACEHOLDERS.ADDRESS_DETAIL)).toBeInTheDocument();
    });
  });

  it('renders project capabilities field', async () => {
    render(<CompanyForm mode="create" onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    await waitFor(() => {
      expect(
        screen.getByLabelText(COMPANY_LABELS.CREATE.FIELDS.PROJECT_CAPABILITIES)
      ).toBeInTheDocument();
    });
  });

  it('renders geography fields', async () => {
    render(<CompanyForm mode="create" onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    await waitFor(() => {
      expect(screen.getByLabelText(COMPANY_LABELS.CREATE.FIELDS.PROVINCE)).toBeInTheDocument();
    });
  });

  it('renders address section header', async () => {
    render(<CompanyForm mode="create" onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    await waitFor(() => {
      expect(screen.getByText(COMPANY_LABELS.CREATE.FIELDS.ADDRESS_SECTION)).toBeInTheDocument();
    });
  });

  it('displays create mode button text', async () => {
    render(<CompanyForm mode="create" onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: COMPANY_LABELS.CREATE.BUTTONS.SAVE })
      ).toBeInTheDocument();
    });
  });

  it('displays edit mode button text', async () => {
    render(<CompanyForm mode="edit" onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: COMPANY_LABELS.EDIT.BUTTONS.SAVE })
      ).toBeInTheDocument();
    });
  });

  it('calls onCancel when cancel button is clicked', async () => {
    const user = userEvent.setup();
    render(<CompanyForm mode="create" onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    const cancelButton = await screen.findByRole('button', {
      name: COMPANY_LABELS.CREATE.BUTTONS.CANCEL,
    });
    await user.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('submit button is disabled when form is invalid', async () => {
    render(<CompanyForm mode="create" onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    const submitButton = await screen.findByRole('button', {
      name: COMPANY_LABELS.CREATE.BUTTONS.SAVE,
    });

    await waitFor(() => {
      expect(submitButton).toBeDisabled();
    });
  });

  it('submit button shows loading text when submitting', async () => {
    render(
      <CompanyForm
        mode="create"
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        isSubmitting={true}
      />
    );

    const submitButton = await screen.findByRole('button', {
      name: COMPANY_LABELS.CREATE.BUTTONS.SAVING,
    });

    await waitFor(() => {
      expect(submitButton).toBeDisabled();
    });
  });

  it('cancel button is disabled when submitting', async () => {
    render(
      <CompanyForm
        mode="create"
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        isSubmitting={true}
      />
    );

    const cancelButton = await screen.findByRole('button', {
      name: COMPANY_LABELS.CREATE.BUTTONS.CANCEL,
    });

    await waitFor(() => {
      expect(cancelButton).toBeDisabled();
    });
  });

  it('allows typing in text fields', async () => {
    const user = userEvent.setup();
    render(<CompanyForm mode="create" onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    const codeInput = await screen.findByLabelText(COMPANY_LABELS.CREATE.FIELDS.CODE);
    await user.type(codeInput, 'COMP-001');

    await waitFor(() => {
      expect(codeInput).toHaveValue('COMP-001');
    });
  });

  it('allows typing in name field', async () => {
    const user = userEvent.setup();
    render(<CompanyForm mode="create" onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    const nameInput = await screen.findByLabelText(COMPANY_LABELS.CREATE.FIELDS.NAME);
    await user.type(nameInput, 'PT Test Company');

    await waitFor(() => {
      expect(nameInput).toHaveValue('PT Test Company');
    });
  });

  it('renders with company data in edit mode', async () => {
    const company = {
      id: '1',
      code: 'COMP-001',
      name: 'PT Existing',
      isActive: true,
      groupId: 'g1',
      group: { id: 'g1', code: 'G01', name: 'Group A' },
      npwp: '123456789012345',
      siupNumber: 'SIUP-001',
      phone: '628123456789',
      email: 'test@example.com',
      projectCapabilities: [{ id: 'pc1', code: 'PC01', name: 'Capability 1', isActive: true }],
      province: { id: 'p1', code: 'P01', name: 'Jawa Barat' },
      city: null,
      district: null,
      village: null,
      postalCode: null,
      addressDetail: 'Jl. Test No. 1',
      departments: [],
      createdAt: '2020-01-01T00:00:00.000Z',
      updatedAt: '2020-01-01T00:00:00.000Z',
    };

    render(
      <CompanyForm mode="edit" company={company} onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
    );

    await waitFor(() => {
      expect(screen.getByLabelText(COMPANY_LABELS.CREATE.FIELDS.CODE)).toHaveValue('COMP-001');
      expect(screen.getByLabelText(COMPANY_LABELS.CREATE.FIELDS.NAME)).toHaveValue('PT Existing');
    });
  });
});
