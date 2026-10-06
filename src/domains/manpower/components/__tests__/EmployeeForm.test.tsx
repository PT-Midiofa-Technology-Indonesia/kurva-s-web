import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { Employee } from '@/domains/manpower/types';
import { EmployeeForm } from '../EmployeeForm';

vi.mock('@/shared/hooks/use-enums', () => ({
  useEmployeeTypes: () => ({ data: [{ value: 'staff', label: 'Staff' }] }),
  useGenders: () => ({ data: [{ value: 'male', label: 'Laki-laki' }] }),
}));

vi.mock('@/shared/hooks/use-geography', () => ({
  useProvinces: () => ({ data: [{ value: 'prov-1', label: 'Jawa Barat' }] }),
  useCities: () => ({ data: [], isFetching: false }),
  useDistricts: () => ({ data: [], isFetching: false }),
  useVillages: () => ({ data: [], isFetching: false }),
}));

vi.mock('react-hook-form', async () => {
  const actual = await vi.importActual('react-hook-form');
  return {
    ...actual,
    useFormContext: () => ({
      formState: { isValid: true, isSubmitting: false },
      control: {},
      setValue: vi.fn(),
    }),
    useWatch: () => null,
  };
});

vi.mock('@/components/organisms/FormGenerator', () => ({
  FormGenerator: ({ fields, actions }: any) => (
    <div data-testid="form-generator">
      <div data-testid="form-fields-count">{fields?.length ?? 0}</div>
      <div data-testid="form-actions">{actions}</div>
      <button type="submit" form="employee-form">
        Submit
      </button>
    </div>
  ),
}));

vi.mock('@/components/atoms', () => ({
  Button: ({ children, onClick, disabled, type }: any) => (
    <button type={type || 'button'} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  ),
}));

const mockEmployee: Employee = {
  id: '1',
  userId: null,
  fullName: 'John Doe',
  employeeType: 'staff',
  isActive: true,
  gender: 'male',
  birthPlace: 'Jakarta',
  birthDate: '1990-01-15',
  phone: '6281234567890',
  email: 'john@example.com',
  province: null,
  city: null,
  district: null,
  village: null,
  postalCode: null,
  addressDetail: null,
  nik: null,
  npwp: null,
  contractType: null,
  salaryType: null,
  workPlacement: null,
  hireDate: null,
  terminationDate: null,
  code: null,
  gradeId: null,
  grade: null,
  employeeGradeId: null,
  employeeGrade: null,
  bankName: null,
  accountNumber: null,
  accountName: null,
  createdAt: '2020-01-01T00:00:00.000Z',
  updatedAt: '2020-01-01T00:00:00.000Z',
};

describe('EmployeeForm', () => {
  it('renders form with all fields in create mode', () => {
    render(<EmployeeForm mode="create" />);

    expect(screen.getByTestId('form-generator')).toBeInTheDocument();
  });

  it('renders form with correct number of fields', () => {
    render(<EmployeeForm mode="create" />);

    const fieldsCount = screen.getByTestId('form-fields-count');
    expect(fieldsCount.textContent).toBe('14');
  });

  it('renders cancel and save buttons in create mode', () => {
    render(<EmployeeForm mode="create" />);

    expect(screen.getByRole('button', { name: /batal/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /simpan/i })).toBeInTheDocument();
  });

  it('renders cancel and save buttons in edit mode', () => {
    render(<EmployeeForm mode="edit" employee={mockEmployee} />);

    expect(screen.getByRole('button', { name: /batal/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /simpan perubahan/i })).toBeInTheDocument();
  });

  it('calls onCancel when cancel button is clicked', async () => {
    const onCancel = vi.fn();
    const user = userEvent.setup();

    render(<EmployeeForm mode="create" onCancel={onCancel} />);

    await user.click(screen.getByRole('button', { name: /batal/i }));

    expect(onCancel).toHaveBeenCalled();
  });

  it('renders with employee data in edit mode', () => {
    render(<EmployeeForm mode="edit" employee={mockEmployee} />);

    expect(screen.getByTestId('form-generator')).toBeInTheDocument();
  });

  it('renders with custom defaultEmployeeType', () => {
    render(<EmployeeForm mode="create" defaultEmployeeType="project_worker" />);

    expect(screen.getByTestId('form-generator')).toBeInTheDocument();
  });

  it('renders with isSubmitting state', () => {
    render(<EmployeeForm mode="create" isSubmitting={true} />);

    expect(screen.getByRole('button', { name: /menyimpan/i })).toBeInTheDocument();
  });

  it('disables save button when isSubmitting', () => {
    const { container } = render(<EmployeeForm mode="create" isSubmitting={true} />);

    const saveButton = container.querySelector('button[type="submit"]');
    expect(saveButton).toBeDisabled();
  });

  it('disables cancel button when isSubmitting', () => {
    render(<EmployeeForm mode="create" isSubmitting={true} />);

    const cancelButton = screen.getByRole('button', { name: /batal/i });
    expect(cancelButton).toBeDisabled();
  });

  it('has submit button with correct text in create mode', () => {
    render(<EmployeeForm mode="create" onSubmit={vi.fn()} />);
    expect(screen.getByRole('button', { name: /simpan/i })).toBeInTheDocument();
  });

  it('renders employee form with wrapper styles', () => {
    const { container } = render(<EmployeeForm mode="create" />);

    expect(container.firstChild).toHaveClass('bg-white');
    expect(container.firstChild).toHaveClass('border');
  });

  it('renders with null employee in edit mode', () => {
    render(<EmployeeForm mode="edit" employee={null} />);

    expect(screen.getByTestId('form-generator')).toBeInTheDocument();
  });
});
