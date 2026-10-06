import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '../../../../shared/utils/test-utils';
import type { Employee } from '../../types';
import { EmployeeOtherSettings } from '../EmployeeOtherSettings';

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

describe('EmployeeOtherSettings', () => {
  it('renders the card title', () => {
    render(<EmployeeOtherSettings employee={mockEmployee} />);

    expect(screen.getByText('Pengaturan Lainnya')).toBeInTheDocument();
  });

  it('renders setting button', () => {
    const onSetting = vi.fn();
    render(<EmployeeOtherSettings employee={mockEmployee} onSetting={onSetting} />);

    const settingButton = screen.getByRole('button', { name: /setting/i });
    expect(settingButton).toBeInTheDocument();
  });

  it('calls onSetting when setting button is clicked', async () => {
    const user = userEvent.setup();
    const onSetting = vi.fn();
    render(<EmployeeOtherSettings employee={mockEmployee} onSetting={onSetting} />);

    const settingButton = screen.getByRole('button', { name: /setting/i });
    await user.click(settingButton);

    expect(onSetting).toHaveBeenCalled();
  });

  it('renders table headers', () => {
    render(<EmployeeOtherSettings employee={mockEmployee} />);

    expect(screen.getByText('Penugasan')).toBeInTheDocument();
    expect(screen.getByText('Kontrak Kerja')).toBeInTheDocument();
  });

  it('displays work placement label in badge', () => {
    render(<EmployeeOtherSettings employee={mockEmployee} />);

    expect(screen.getByText('Kantor')).toBeInTheDocument();
  });

  it('displays contract type label in badge', () => {
    render(<EmployeeOtherSettings employee={mockEmployee} />);

    expect(screen.getByText('Karyawan Tetap')).toBeInTheDocument();
  });

  it('displays contract employee type label', () => {
    const contractEmployee = { ...mockEmployee, contractType: 'contract' };
    render(<EmployeeOtherSettings employee={contractEmployee} />);

    expect(screen.getByText('Karyawan Kontrak')).toBeInTheDocument();
  });

  it('renders table structure correctly', () => {
    render(<EmployeeOtherSettings employee={mockEmployee} />);

    const table = screen.getByRole('table');
    expect(table).toBeInTheDocument();

    const rows = table.querySelectorAll('tr');
    expect(rows.length).toBeGreaterThan(0);
  });

  it('shows no-data row when contractType is null', () => {
    const emptyEmployee = { ...mockEmployee, contractType: null };
    render(<EmployeeOtherSettings employee={emptyEmployee} />);

    expect(screen.getByText('Belum ada data.')).toBeInTheDocument();
  });

  it('renders badges for non-empty values', () => {
    render(<EmployeeOtherSettings employee={mockEmployee} />);

    const badges = screen.getByRole('table').querySelectorAll('[class*="badge"]');
    expect(badges.length).toBeGreaterThan(0);
  });

  it('does not wrap dash in badge when one field is present', () => {
    const employeeWithPartialData = {
      ...mockEmployee,
      contractType: 'permanent',
      workPlacement: null,
    };
    render(<EmployeeOtherSettings employee={employeeWithPartialData} />);

    const dashes = screen.getAllByText('-');
    expect(dashes.length).toBeGreaterThan(0);

    dashes.forEach((dash) => {
      const badge = dash.closest('[class*="badge"]');
      expect(badge).toBeNull();
    });
  });
});
