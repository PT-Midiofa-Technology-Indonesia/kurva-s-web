import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '../../../../shared/utils/test-utils';
import type { Employee } from '../../types';
import { EmployeeDetailInfo } from '../EmployeeDetailInfo';

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
  province: { id: '1', name: 'DKI Jakarta' },
  city: { id: '2', name: 'Jakarta Pusat' },
  district: { id: '3', name: 'Menteng' },
  village: { id: '4', name: 'Cikini' },
  postalCode: '12160',
  addressDetail: 'Jalan Gatot Subroto',
  nik: '1234567890123456',
  npwp: '12.345.678.9-012.345',
  contractType: 'permanent',
  salaryType: 'monthly',
  workPlacement: 'office',
  hireDate: '2020-01-01',
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

describe('EmployeeDetailInfo', () => {
  it('renders employee information', () => {
    const onEdit = vi.fn();
    render(<EmployeeDetailInfo employee={mockEmployee} onEdit={onEdit} />);

    expect(screen.getByText('Informasi Manpower')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
  });

  it('renders edit button', () => {
    const onEdit = vi.fn();
    render(<EmployeeDetailInfo employee={mockEmployee} onEdit={onEdit} />);

    const editButton = screen.getByRole('button', { name: /edit/i });
    expect(editButton).toBeInTheDocument();
  });

  it('calls onEdit when edit button is clicked', async () => {
    const user = userEvent.setup();
    const onEdit = vi.fn();
    render(<EmployeeDetailInfo employee={mockEmployee} onEdit={onEdit} />);

    const editButton = screen.getByRole('button', { name: /edit/i });
    await user.click(editButton);

    expect(onEdit).toHaveBeenCalled();
  });

  it('renders status switch', () => {
    const onEdit = vi.fn();
    render(<EmployeeDetailInfo employee={mockEmployee} onEdit={onEdit} />);

    const switches = document.querySelectorAll('[role="switch"]');
    expect(switches.length).toBeGreaterThan(0);
  });

  it('displays active status when isActive is true', () => {
    const onEdit = vi.fn();
    render(<EmployeeDetailInfo employee={mockEmployee} onEdit={onEdit} />);

    expect(screen.getByText('Aktif')).toBeInTheDocument();
  });

  it('displays inactive status when isActive is false', () => {
    const onEdit = vi.fn();
    const inactiveEmployee = { ...mockEmployee, isActive: false };
    render(<EmployeeDetailInfo employee={inactiveEmployee} onEdit={onEdit} />);

    expect(screen.getByText('Tidak Aktif')).toBeInTheDocument();
  });

  it('renders address details', () => {
    const onEdit = vi.fn();
    render(<EmployeeDetailInfo employee={mockEmployee} onEdit={onEdit} />);

    expect(screen.getByText('DKI Jakarta')).toBeInTheDocument();
    expect(screen.getByText('Jakarta Pusat')).toBeInTheDocument();
    expect(screen.getByText('Menteng')).toBeInTheDocument();
  });

  it('opens status confirmation dialog when status is toggled', async () => {
    const user = userEvent.setup();
    const onEdit = vi.fn();
    render(<EmployeeDetailInfo employee={mockEmployee} onEdit={onEdit} />);

    const statusSwitch = document.querySelector('[role="switch"]');
    if (statusSwitch) {
      await user.click(statusSwitch);

      await waitFor(() => {
        expect(screen.getByText(/mengubah status/i)).toBeInTheDocument();
      });
    }
  });

  it('handles missing address fields gracefully', () => {
    const onEdit = vi.fn();
    const employeeNoAddress = {
      ...mockEmployee,
      province: null,
      city: null,
      district: null,
      village: null,
    };
    render(<EmployeeDetailInfo employee={employeeNoAddress} onEdit={onEdit} />);

    const emptyFields = screen.getAllByText('-');
    expect(emptyFields.length).toBeGreaterThan(0);
  });
});
