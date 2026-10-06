import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { Employee } from '../../types';
import { EmployeeOtherSettingsForm } from '../EmployeeOtherSettingsForm';

vi.mock('../../hooks/use-work-placement-enums', () => ({
  useWorkPlacementEnums: () => ({
    workPlacements: [
      { value: 'office', label: 'Kantor' },
      { value: 'remote', label: 'Remote' },
      { value: 'hybrid', label: 'Hybrid' },
    ],
    contractTypes: [
      { value: 'permanent', label: 'Karyawan Tetap' },
      { value: 'contract', label: 'Karyawan Kontrak' },
    ],
    isLoading: false,
  }),
}));

vi.mock('../../hooks/use-update-employee', () => ({
  useUpdateEmployee: (_employeeId: string) => {
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

describe('EmployeeOtherSettingsForm', () => {
  it('renders drawer title when open', () => {
    render(<EmployeeOtherSettingsForm open employee={mockEmployee} onClose={vi.fn()} />);

    expect(screen.getByText('Pengaturan Lainnya')).toBeInTheDocument();
  });

  it('renders form fields with labels', () => {
    render(<EmployeeOtherSettingsForm open employee={mockEmployee} onClose={vi.fn()} />);

    expect(screen.getByText('Penugasan')).toBeInTheDocument();
    expect(screen.getByText('Kontrak Kerja')).toBeInTheDocument();
  });

  it('renders save and cancel buttons', () => {
    render(<EmployeeOtherSettingsForm open employee={mockEmployee} onClose={vi.fn()} />);

    expect(screen.getByRole('button', { name: /Simpan/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Batal/i })).toBeInTheDocument();
  });

  it('renders select elements for both fields', () => {
    render(<EmployeeOtherSettingsForm open employee={mockEmployee} onClose={vi.fn()} />);

    const selects = screen.getAllByRole('combobox');
    expect(selects).toHaveLength(2);
  });

  it('calls onClose when cancel button is clicked', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    render(<EmployeeOtherSettingsForm open employee={mockEmployee} onClose={onClose} />);

    const cancelButton = screen.getByRole('button', { name: /Batal/i });
    await user.click(cancelButton);

    expect(onClose).toHaveBeenCalled();
  });

  it('calls onSuccess when form is submitted', async () => {
    const user = userEvent.setup();
    const onSuccess = vi.fn();
    const onClose = vi.fn();

    render(
      <EmployeeOtherSettingsForm
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

  it('displays enum option labels in select options', async () => {
    const user = userEvent.setup();
    render(<EmployeeOtherSettingsForm open employee={mockEmployee} onClose={vi.fn()} />);

    const selects = screen.getAllByRole('combobox');
    const workPlacementSelect = selects[0];

    await user.click(workPlacementSelect);

    // use role='option' to target dropdown items only — the trigger also shows the current label
    expect(screen.getByRole('option', { name: 'Kantor' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Remote' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Hybrid' })).toBeInTheDocument();
  });

  it('allows user to select different enum values', async () => {
    const user = userEvent.setup();
    render(<EmployeeOtherSettingsForm open employee={mockEmployee} onClose={vi.fn()} />);

    const selects = screen.getAllByRole('combobox');
    const workPlacementSelect = selects[0];

    await user.click(workPlacementSelect);
    await user.click(screen.getByText('Remote'));

    expect(workPlacementSelect).toHaveTextContent('Remote');
  });

  it('does not render drawer content when open is false', () => {
    const { container } = render(
      <EmployeeOtherSettingsForm open={false} employee={mockEmployee} onClose={vi.fn()} />
    );

    // When drawer is closed, the form elements should not be in the DOM
    const title = container.querySelector('[id*="drawer-title"]');
    expect(title?.textContent).not.toBe('Pengaturan Lainnya');
  });
});
