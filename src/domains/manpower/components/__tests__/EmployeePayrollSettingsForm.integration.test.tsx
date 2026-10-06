import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { Employee } from '../../types';
import { EmployeePayrollSettingsForm } from '../EmployeePayrollSettingsForm';

vi.mock('@/shared/hooks/use-enums', () => ({
  useSalaryTypes: () => ({
    data: [
      { value: 'monthly', label: 'Bulanan' },
      { value: 'daily', label: 'Harian' },
    ],
  }),
}));

vi.mock('@/domains/employee-grade', () => ({
  useEmployeeGradesInfinite: () => ({
    options: [
      { value: 'grade-1', label: 'G1 - Golongan 1' },
      { value: 'grade-2', label: 'G2 - Golongan 2' },
    ],
    isLoading: false,
    hasMore: false,
    isFetchingNextPage: false,
    loadMore: vi.fn(),
  }),
}));

vi.mock('../../hooks/use-update-employee-payroll-settings', () => ({
  useUpdateEmployeePayrollSettings: (_employeeId: string) => {
    const mockMutate = vi.fn((_payload: any, options?: any) => {
      options?.onSuccess?.();
    });

    return {
      mutate: mockMutate,
      isPending: false,
    };
  },
}));

const mockEmployee: Employee = {
  id: '1',
  userId: null,
  code: 'EMP-001',
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
  contractType: 'permanent',
  salaryType: 'monthly',
  workPlacement: 'office',
  hireDate: null,
  terminationDate: null,
  gradeId: 'grade-1',
  grade: { id: 'grade-1', code: 'G1', name: 'Golongan 1' },
  employeeGradeId: null,
  employeeGrade: null,
  bankName: 'BCA',
  accountNumber: '1234',
  accountName: 'John Doe',
  createdAt: '2020-01-01T00:00:00.000Z',
  updatedAt: '2020-01-01T00:00:00.000Z',
};

describe('EmployeePayrollSettingsForm', () => {
  it('renders drawer title when open', () => {
    render(<EmployeePayrollSettingsForm open employee={mockEmployee} onClose={vi.fn()} />);

    expect(screen.getByText('Pengaturan Payroll')).toBeInTheDocument();
  });

  it('renders form fields with labels', () => {
    render(<EmployeePayrollSettingsForm open employee={mockEmployee} onClose={vi.fn()} />);

    expect(screen.getByText('Golongan')).toBeInTheDocument();
    expect(screen.getByText('Penggajian')).toBeInTheDocument();
    expect(screen.getByText('Nama Bank')).toBeInTheDocument();
    expect(screen.getByText('No. Rekening')).toBeInTheDocument();
    expect(screen.getByText('Nama Pemilik')).toBeInTheDocument();
  });

  it('renders save and cancel buttons', () => {
    render(<EmployeePayrollSettingsForm open employee={mockEmployee} onClose={vi.fn()} />);

    expect(screen.getByRole('button', { name: /Simpan/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Batal/i })).toBeInTheDocument();
  });

  it('renders select elements for both fields', () => {
    render(<EmployeePayrollSettingsForm open employee={mockEmployee} onClose={vi.fn()} />);

    const selects = screen.getAllByRole('combobox');
    expect(selects).toHaveLength(2);
    expect(screen.getByDisplayValue('BCA')).toBeInTheDocument();
    expect(screen.getByDisplayValue('1234')).toBeInTheDocument();
    expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument();
  });

  it('calls onClose when cancel button is clicked', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    render(<EmployeePayrollSettingsForm open employee={mockEmployee} onClose={onClose} />);

    const cancelButton = screen.getByRole('button', { name: /Batal/i });
    await user.click(cancelButton);

    expect(onClose).toHaveBeenCalled();
  });

  it('calls onSuccess when form is submitted', async () => {
    const user = userEvent.setup();
    const onSuccess = vi.fn();
    const onClose = vi.fn();

    render(
      <EmployeePayrollSettingsForm
        open
        employee={mockEmployee}
        onClose={onClose}
        onSuccess={onSuccess}
      />
    );

    const saveButton = screen.getByRole('button', { name: /Simpan/i });
    await user.click(saveButton);

    expect(onSuccess).toHaveBeenCalled();
  });

  it('displays grade option labels in select options', async () => {
    const user = userEvent.setup();
    render(<EmployeePayrollSettingsForm open employee={mockEmployee} onClose={vi.fn()} />);

    const selects = screen.getAllByRole('combobox');
    const gradeSelect = selects[0];

    await user.click(gradeSelect);

    expect(screen.getByRole('option', { name: 'G2 - Golongan 2' })).toBeInTheDocument();
  });

  it('does not render drawer content when open is false', () => {
    const { container } = render(
      <EmployeePayrollSettingsForm open={false} employee={mockEmployee} onClose={vi.fn()} />
    );

    const title = container.querySelector('[id*="drawer-title"]');
    expect(title?.textContent).not.toBe('Pengaturan Payroll');
  });
});
