import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { z } from 'zod';
import { AdvancedFilter } from './AdvancedFilter';

const filterSchema = z.object({
  vendor: z.string().optional(),
  status: z.string().optional(),
});

type FilterFormData = z.infer<typeof filterSchema>;

describe('AdvancedFilter', () => {
  const mockOnApply = vi.fn();
  const mockOnReset = vi.fn();

  const defaultProps = {
    title: 'Advanced Filter',
    schema: filterSchema,
    fields: [
      {
        name: 'vendor' as const,
        label: 'Vendor',
        type: 'text' as const,
        placeholder: 'Search vendor...',
        colSpan: 6 as const,
      },
      {
        name: 'status' as const,
        label: 'Status',
        type: 'select' as const,
        options: [
          { label: 'Active', value: 'active' },
          { label: 'Inactive', value: 'inactive' },
        ],
        colSpan: 6 as const,
      },
    ],
    defaultValues: {},
    onApply: mockOnApply,
    onReset: mockOnReset,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render filter title', () => {
    render(<AdvancedFilter<FilterFormData> {...defaultProps} />);
    expect(screen.getByText('Advanced Filter')).toBeInTheDocument();
  });

  it('should render filter fields', () => {
    render(<AdvancedFilter<FilterFormData> {...defaultProps} />);
    expect(screen.getByLabelText('Vendor')).toBeInTheDocument();
    expect(screen.getByLabelText('Status')).toBeInTheDocument();
  });

  it('should render Apply and Reset buttons', () => {
    render(<AdvancedFilter<FilterFormData> {...defaultProps} />);
    expect(screen.getByRole('button', { name: /Apply/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Reset/i })).toBeInTheDocument();
  });

  it('should call onApply when submitting form with valid data', async () => {
    render(<AdvancedFilter<FilterFormData> {...defaultProps} />);

    const vendorInput = screen.getByPlaceholderText('Search vendor...');
    fireEvent.change(vendorInput, { target: { value: 'Acme Inc' } });

    const applyButton = screen.getByRole('button', { name: /Apply/i });
    fireEvent.click(applyButton);

    await waitFor(() => {
      expect(mockOnApply).toHaveBeenCalledWith(
        expect.objectContaining({
          vendor: 'Acme Inc',
        })
      );
    });
  });

  it('should call onReset when reset button is clicked', async () => {
    render(
      <AdvancedFilter<FilterFormData>
        {...defaultProps}
        defaultValues={{ vendor: 'Acme Inc', status: 'active' }}
      />
    );

    const resetButton = screen.getByRole('button', { name: /Reset/i });
    fireEvent.click(resetButton);

    expect(mockOnReset).toHaveBeenCalled();
  });

  it('should apply default values to form fields', () => {
    render(
      <AdvancedFilter<FilterFormData>
        {...defaultProps}
        defaultValues={{ vendor: 'Test Vendor', status: 'active' }}
      />
    );

    const vendorInput = screen.getByPlaceholderText('Search vendor...') as HTMLInputElement;
    expect(vendorInput.value).toBe('Test Vendor');
  });

  it('should disable buttons when isLoading is true', () => {
    render(<AdvancedFilter<FilterFormData> {...defaultProps} isLoading={true} />);

    const applyButton = screen.getByRole('button', { name: /Searching/i });
    const resetButton = screen.getByRole('button', { name: /Reset/i });

    expect(applyButton).toBeDisabled();
    expect(resetButton).toBeDisabled();
  });

  it('should render without title when not provided', () => {
    render(<AdvancedFilter<FilterFormData> {...defaultProps} title={undefined} />);

    expect(screen.queryByText('Advanced Filter')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Apply/i })).toBeInTheDocument();
  });

  it('should render fields with responsive colSpan', () => {
    const fieldsWithResponsive = [
      {
        name: 'vendor' as const,
        label: 'Vendor',
        type: 'text' as const,
        colSpan: { base: 12, md: 6, lg: 4 } as any,
      },
    ];

    render(<AdvancedFilter<FilterFormData> {...defaultProps} fields={fieldsWithResponsive} />);

    expect(screen.getByLabelText('Vendor')).toBeInTheDocument();
  });

  it('should support multiple rows of filters', () => {
    const multipleFields = [
      {
        name: 'vendor' as const,
        label: 'Vendor',
        type: 'text' as const,
        colSpan: 4 as const,
      },
      {
        name: 'status' as const,
        label: 'Status',
        type: 'select' as const,
        options: [{ label: 'Active', value: 'active' }],
        colSpan: 4 as const,
      },
      {
        name: 'vendor' as const,
        label: 'Secondary Vendor',
        type: 'text' as const,
        colSpan: 4 as const,
      },
    ];

    render(<AdvancedFilter<FilterFormData> {...defaultProps} fields={multipleFields} />);

    expect(screen.getByLabelText('Vendor')).toBeInTheDocument();
    expect(screen.getByLabelText('Status')).toBeInTheDocument();
    expect(screen.getByLabelText('Secondary Vendor')).toBeInTheDocument();
  });
});
