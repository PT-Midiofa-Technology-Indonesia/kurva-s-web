import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import type { Permission } from '@/types/permissions';
import { PermissionsAccordion } from './PermissionsAccordion';

vi.mock('@/components/atoms/Switch', () => ({
  Switch: ({ checked, onCheckedChange, label, disabled }: any) => (
    <div data-testid="switch">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onCheckedChange(e.target.checked)}
        disabled={disabled}
        data-testid="switch-input"
      />
      {label && <label data-testid="switch-label">{label}</label>}
    </div>
  ),
}));

vi.mock('@/components/molecules/PermissionGroup', () => ({
  PermissionGroup: ({ name, subPermissions }: any) => (
    <div data-testid={`permission-group-${name}`}>
      <h4>{name}</h4>
      {subPermissions.map((sub: any) => (
        <div key={sub.id} data-testid={`sub-perm-${sub.id}`}>
          {sub.name}
        </div>
      ))}
    </div>
  ),
}));

vi.mock('@/components/ui/accordion', () => ({
  Accordion: ({ children }: any) => <div data-testid="accordion">{children}</div>,
  AccordionItem: ({ children, className }: any) => (
    <div data-testid="accordion-item" className={className}>
      {children}
    </div>
  ),
  AccordionContent: ({ children, className }: any) => (
    <div data-testid="accordion-content" className={className}>
      {children}
    </div>
  ),
}));

vi.mock('radix-ui', () => ({
  Accordion: {
    Header: ({ children }: any) => <div data-testid="accordion-header">{children}</div>,
    Trigger: ({ children, className }: any) => (
      <button type="button" className={className} data-testid="accordion-trigger">
        {children}
      </button>
    ),
  },
}));

vi.mock('@/utils/cn', () => ({
  cn: (...args: any[]) => args.filter(Boolean).join(' '),
}));

vi.mock('lucide-react', () => ({
  ChevronDownIcon: () => <div data-testid="chevron-icon" />,
}));

describe('PermissionsAccordion', () => {
  const mockPermission: Permission = {
    id: 'user-management',
    name: 'User Management',
    description: 'Manage users in the system',
    selectAll: false,
    groups: [
      {
        id: 'group-1',
        name: 'User Operations',
        icon: '👤',
        subPermissions: [
          { id: 'create-user', name: 'Create User', checked: false },
          { id: 'edit-user', name: 'Edit User', checked: false },
          { id: 'delete-user', name: 'Delete User', checked: false },
        ],
      },
      {
        id: 'group-2',
        name: 'User Roles',
        icon: '🔐',
        subPermissions: [
          { id: 'assign-role', name: 'Assign Role', checked: false },
          { id: 'remove-role', name: 'Remove Role', checked: false },
        ],
      },
    ],
  };

  it('renders permission accordion', () => {
    render(<PermissionsAccordion permission={mockPermission} onPermissionChange={vi.fn()} />);
    expect(screen.getByTestId('accordion')).toBeInTheDocument();
  });

  it('displays permission name', () => {
    render(<PermissionsAccordion permission={mockPermission} onPermissionChange={vi.fn()} />);
    expect(screen.getByText('User Management')).toBeInTheDocument();
  });

  it('displays permission description', () => {
    render(<PermissionsAccordion permission={mockPermission} onPermissionChange={vi.fn()} />);
    expect(screen.getByText('Manage users in the system')).toBeInTheDocument();
  });

  it('renders permission groups', () => {
    render(<PermissionsAccordion permission={mockPermission} onPermissionChange={vi.fn()} />);
    expect(screen.getByTestId('permission-group-User Operations')).toBeInTheDocument();
    expect(screen.getByTestId('permission-group-User Roles')).toBeInTheDocument();
  });

  it('renders select all switch', () => {
    render(<PermissionsAccordion permission={mockPermission} onPermissionChange={vi.fn()} />);
    expect(screen.getByTestId('switch')).toBeInTheDocument();
  });

  it('uses custom selectAllLabel', () => {
    render(
      <PermissionsAccordion
        permission={mockPermission}
        onPermissionChange={vi.fn()}
        selectAllLabel="Select All Permissions"
      />
    );
    expect(screen.getByText('Select All Permissions')).toBeInTheDocument();
  });

  it('uses default selectAllLabel', () => {
    render(<PermissionsAccordion permission={mockPermission} onPermissionChange={vi.fn()} />);
    expect(screen.getByText('Pilih semua')).toBeInTheDocument();
  });

  it('calls onPermissionChange when select all is toggled', async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();
    render(<PermissionsAccordion permission={mockPermission} onPermissionChange={handleChange} />);

    const switchInput = screen.getByTestId('switch-input');
    await user.click(switchInput);

    expect(handleChange).toHaveBeenCalled();
  });

  it('toggles all permissions when select all is checked', async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();
    render(<PermissionsAccordion permission={mockPermission} onPermissionChange={handleChange} />);

    const switchInput = screen.getByTestId('switch-input');
    await user.click(switchInput);

    const callArgs = handleChange.mock.calls[0][0];
    expect(callArgs.selectAll).toBe(true);
    expect(callArgs.groups.every((g: any) => g.subPermissions.every((s: any) => s.checked))).toBe(
      true
    );
  });

  it('does not render switch when disabled', () => {
    render(
      <PermissionsAccordion
        permission={mockPermission}
        onPermissionChange={vi.fn()}
        disabled={true}
      />
    );
    expect(screen.queryByTestId('switch')).not.toBeInTheDocument();
  });

  it('renders switch when not disabled', () => {
    render(
      <PermissionsAccordion
        permission={mockPermission}
        onPermissionChange={vi.fn()}
        disabled={false}
      />
    );
    expect(screen.getByTestId('switch')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <PermissionsAccordion
        permission={mockPermission}
        onPermissionChange={vi.fn()}
        className="custom-class"
      />
    );
    const wrapper = container.firstChild;
    expect(wrapper).toHaveClass('custom-class');
  });

  it('renders chevron icon', () => {
    render(<PermissionsAccordion permission={mockPermission} onPermissionChange={vi.fn()} />);
    expect(screen.getByTestId('chevron-icon')).toBeInTheDocument();
  });

  it('renders accordion trigger button', () => {
    render(<PermissionsAccordion permission={mockPermission} onPermissionChange={vi.fn()} />);
    expect(screen.getByTestId('accordion-trigger')).toBeInTheDocument();
  });

  it('handles all sub-permissions checked state', () => {
    const allCheckedPermission: Permission = {
      ...mockPermission,
      selectAll: true,
      groups: mockPermission.groups.map((g) => ({
        ...g,
        subPermissions: g.subPermissions.map((s) => ({ ...s, checked: true })),
      })),
    };

    render(<PermissionsAccordion permission={allCheckedPermission} onPermissionChange={vi.fn()} />);

    const switchInput = screen.getByTestId('switch-input') as HTMLInputElement;
    expect(switchInput.checked).toBe(true);
  });

  it('handles partial permissions checked', () => {
    const partialPermission: Permission = {
      ...mockPermission,
      groups: [
        {
          ...mockPermission.groups[0],
          subPermissions: [
            { ...mockPermission.groups[0].subPermissions[0], checked: true },
            { ...mockPermission.groups[0].subPermissions[1], checked: false },
            { ...mockPermission.groups[0].subPermissions[2], checked: false },
          ],
        },
        mockPermission.groups[1],
      ],
    };

    render(<PermissionsAccordion permission={partialPermission} onPermissionChange={vi.fn()} />);

    const switchInput = screen.getByTestId('switch-input') as HTMLInputElement;
    expect(switchInput.checked).toBe(false);
  });

  it('renders with multiple permission groups', () => {
    render(<PermissionsAccordion permission={mockPermission} onPermissionChange={vi.fn()} />);

    expect(screen.getByTestId('permission-group-User Operations')).toBeInTheDocument();
    expect(screen.getByTestId('permission-group-User Roles')).toBeInTheDocument();
  });

  it('passes disabled state to permission groups', () => {
    render(
      <PermissionsAccordion
        permission={mockPermission}
        onPermissionChange={vi.fn()}
        disabled={true}
      />
    );

    expect(screen.getByTestId('accordion')).toBeInTheDocument();
  });

  it('displays all sub-permissions in groups', () => {
    render(<PermissionsAccordion permission={mockPermission} onPermissionChange={vi.fn()} />);

    expect(screen.getByTestId('sub-perm-create-user')).toBeInTheDocument();
    expect(screen.getByTestId('sub-perm-edit-user')).toBeInTheDocument();
    expect(screen.getByTestId('sub-perm-delete-user')).toBeInTheDocument();
    expect(screen.getByTestId('sub-perm-assign-role')).toBeInTheDocument();
    expect(screen.getByTestId('sub-perm-remove-role')).toBeInTheDocument();
  });

  it('renders border styling', () => {
    const { container } = render(
      <PermissionsAccordion permission={mockPermission} onPermissionChange={vi.fn()} />
    );
    const wrapper = container.firstChild;
    expect(wrapper).toHaveClass('border', 'border-slate-200', 'rounded-lg');
  });

  it('handles updates to permission object', () => {
    const { rerender } = render(
      <PermissionsAccordion permission={mockPermission} onPermissionChange={vi.fn()} />
    );

    const updatedPermission: Permission = {
      ...mockPermission,
      name: 'Updated Permission Name',
    };

    rerender(<PermissionsAccordion permission={updatedPermission} onPermissionChange={vi.fn()} />);

    expect(screen.getByText('Updated Permission Name')).toBeInTheDocument();
  });
});
