import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '../../../../shared/utils/test-utils';
import type { PositionAssignment } from '../../types';
import { EmployeePositionAssignments } from '../EmployeePositionAssignments';

const mockAssignment: PositionAssignment = {
  id: '019eb00c-db1c-73e6-8712-f79f02497254',
  employeeId: '1',
  companyId: '019e5387-20a8-7094-bda4-c029d64757f2',
  companyPositionId: '019ea868-b741-72ba-b719-8a417b2d4438',
  startedAt: '2026-06-10',
  endedAt: null,
  reason: null,
  notes: null,
  isActive: true,
  company: {
    id: '019e5387-20a8-7094-bda4-c029d64757f2',
    code: 'COMWIB',
    name: 'PT. Curva 1',
    npwp: '12.112.121.2-121.212',
    siupNumber: 'ASD1521AJDA',
    phone: '62811111111111',
    email: null,
    postalCode: null,
    addressDetail: 'Kantor WIB',
    isActive: true,
    createdAt: '2026-05-23T06:30:25.000000Z',
    updatedAt: '2026-06-06T02:13:27.000000Z',
  },
  companyPosition: {
    id: '019ea868-b741-72ba-b719-8a417b2d4438',
    isActive: true,
    department: {
      id: '019e4de1-b013-73ba-b1a1-35f4b1eea3eb',
      code: 'BD',
      name: 'Business Development',
      isActive: true,
    },
    position: {
      id: '019ea7af-99bf-7392-8974-ca928e82b792',
      code: 'D0010',
      name: 'Job Position 10',
      level: 1,
      isActive: true,
    },
    createdAt: '2026-06-08T18:04:55.000000Z',
    updatedAt: '2026-06-08T18:04:55.000000Z',
  },
  companyEmployee: {
    id: '019eb00c-db1c-73e6-8712-f79f02497255',
    companyId: '019e5387-20a8-7094-bda4-c029d64757f2',
    employeeId: '1',
    officeId: null,
    warehouseId: null,
    isPrimary: false,
    isActive: true,
    createdAt: '2026-06-10T12:41:33+07:00',
    updatedAt: '2026-06-10T12:41:33+07:00',
  },
  createdAt: '2026-06-10T12:41:33+07:00',
  updatedAt: '2026-06-10T12:41:33+07:00',
};

describe('EmployeePositionAssignments', () => {
  it('renders the card title', () => {
    render(<EmployeePositionAssignments assignments={[]} />);

    expect(screen.getByText('Pengaturan Company Position')).toBeInTheDocument();
  });

  it('renders setting button', () => {
    const onSetting = vi.fn();
    render(<EmployeePositionAssignments assignments={[]} onSetting={onSetting} />);

    const settingButton = screen.getByRole('button', { name: /setting/i });
    expect(settingButton).toBeInTheDocument();
  });

  it('calls onSetting when setting button is clicked', async () => {
    const user = userEvent.setup();
    const onSetting = vi.fn();
    render(<EmployeePositionAssignments assignments={[]} onSetting={onSetting} />);

    const settingButton = screen.getByRole('button', { name: /setting/i });
    await user.click(settingButton);

    expect(onSetting).toHaveBeenCalled();
  });

  it('renders table headers', () => {
    render(<EmployeePositionAssignments assignments={[]} />);

    expect(screen.getByText('Company')).toBeInTheDocument();
    expect(screen.getByText('Job Position')).toBeInTheDocument();
  });

  it('displays empty state when no assignments', () => {
    render(<EmployeePositionAssignments assignments={[]} />);

    expect(screen.getByText('Belum ada data.')).toBeInTheDocument();
  });

  it('renders position assignments in table', () => {
    render(<EmployeePositionAssignments assignments={[mockAssignment]} />);

    expect(screen.getByText('PT. Curva 1')).toBeInTheDocument();
    expect(screen.getByText('Job Position 10')).toBeInTheDocument();
  });

  it('renders multiple position assignments', () => {
    const assignment2 = {
      ...mockAssignment,
      id: '2',
      company: { ...mockAssignment.company, name: 'PT. Curva 2' },
    };

    render(<EmployeePositionAssignments assignments={[mockAssignment, assignment2]} />);

    expect(screen.getByText('PT. Curva 1')).toBeInTheDocument();
    expect(screen.getByText('PT. Curva 2')).toBeInTheDocument();
  });

  it('displays loading state', () => {
    render(<EmployeePositionAssignments assignments={[]} isLoading={true} />);

    const spinner = document.querySelector('[class*="animate-spin"]');
    expect(spinner).toBeInTheDocument();
  });

  it('hides loading state when data is loaded', () => {
    const { rerender } = render(<EmployeePositionAssignments assignments={[]} isLoading={true} />);

    let spinner = document.querySelector('[class*="animate-spin"]');
    expect(spinner).toBeInTheDocument();

    rerender(<EmployeePositionAssignments assignments={[mockAssignment]} isLoading={false} />);

    spinner = document.querySelector('[class*="animate-spin"]');
    expect(spinner).not.toBeInTheDocument();
  });
});
