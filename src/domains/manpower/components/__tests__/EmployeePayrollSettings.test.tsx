import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '../../../../shared/utils/test-utils';
import type { Employee } from '../../types';
import { EmployeePayrollSettings } from '../EmployeePayrollSettings';

vi.mock('@/shared/hooks/use-enums', () => ({
  useSalaryTypes: () => ({
    data: [
      { value: 'monthly', label: 'Bulanan' },
      { value: 'daily', label: 'Harian' },
    ],
  }),
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

describe('EmployeePayrollSettings', () => {
  it('renders the card title', () => {
    render(<EmployeePayrollSettings employee={mockEmployee} />);

    expect(screen.getByText('Pengaturan Payroll')).toBeInTheDocument();
  });

  it('renders setting button', () => {
    const onSetting = vi.fn();
    render(<EmployeePayrollSettings employee={mockEmployee} onSetting={onSetting} />);

    const settingButton = screen.getByRole('button', { name: /setting/i });
    expect(settingButton).toBeInTheDocument();
  });

  it('calls onSetting when setting button is clicked', async () => {
    const user = userEvent.setup();
    const onSetting = vi.fn();
    render(<EmployeePayrollSettings employee={mockEmployee} onSetting={onSetting} />);

    const settingButton = screen.getByRole('button', { name: /setting/i });
    await user.click(settingButton);

    expect(onSetting).toHaveBeenCalled();
  });

  it('renders table headers', () => {
    render(<EmployeePayrollSettings employee={mockEmployee} />);

    expect(screen.getByText('Golongan')).toBeInTheDocument();
    expect(screen.getByText('Penggajian')).toBeInTheDocument();
    expect(screen.getByText('Nama Bank')).toBeInTheDocument();
    expect(screen.getByText('No. Rekening')).toBeInTheDocument();
    expect(screen.getByText('Nama Pemilik')).toBeInTheDocument();
  });

  it('displays grade label in badge', () => {
    render(<EmployeePayrollSettings employee={mockEmployee} />);

    expect(screen.getByText('G1 - Golongan 1')).toBeInTheDocument();
  });

  it('displays salary type label in badge', () => {
    render(<EmployeePayrollSettings employee={mockEmployee} />);

    expect(screen.getByText('Bulanan')).toBeInTheDocument();
  });

  it('displays bank fields', () => {
    render(<EmployeePayrollSettings employee={mockEmployee} />);

    expect(screen.getByText('BCA')).toBeInTheDocument();
    expect(screen.getByText('1234')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('displays daily salary type label', () => {
    const dailyEmployee = { ...mockEmployee, salaryType: 'daily' };
    render(<EmployeePayrollSettings employee={dailyEmployee} />);

    expect(screen.getByText('Harian')).toBeInTheDocument();
  });

  it('displays dash for missing grade', () => {
    const employeeNoGrade = { ...mockEmployee, gradeId: null, grade: null };
    render(<EmployeePayrollSettings employee={employeeNoGrade} />);

    const cells = screen.getAllByText('-');
    expect(cells.length).toBeGreaterThan(0);
  });

  it('shows no-data row when payroll fields are empty', () => {
    const emptyEmployee = {
      ...mockEmployee,
      gradeId: null,
      grade: null,
      salaryType: null,
      bankName: null,
      accountNumber: null,
      accountName: null,
    };
    render(<EmployeePayrollSettings employee={emptyEmployee} />);

    expect(screen.getByText('Belum ada data.')).toBeInTheDocument();
  });

  it('renders table structure correctly', () => {
    render(<EmployeePayrollSettings employee={mockEmployee} />);

    const table = screen.getByRole('table');
    expect(table).toBeInTheDocument();

    const rows = table.querySelectorAll('tr');
    expect(rows.length).toBeGreaterThan(0);
  });

  it('renders badges for non-empty values', () => {
    render(<EmployeePayrollSettings employee={mockEmployee} />);

    const badges = screen.getByRole('table').querySelectorAll('[class*="badge"]');
    expect(badges.length).toBeGreaterThan(0);
  });

  it('does not wrap dash in badge when one field is present', () => {
    const employeeWithPartialData = {
      ...mockEmployee,
      gradeId: null,
      grade: null,
      salaryType: 'monthly',
    };
    render(<EmployeePayrollSettings employee={employeeWithPartialData} />);

    const dashes = screen.getAllByText('-');
    expect(dashes.length).toBeGreaterThan(0);

    dashes.forEach((dash) => {
      const badge = dash.closest('[class*="badge"]');
      expect(badge).toBeNull();
    });
  });
});
