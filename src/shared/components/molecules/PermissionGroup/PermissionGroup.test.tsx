import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { PermissionGroup } from './PermissionGroup';

vi.mock('lucide-react', () => ({
  Laptop: ({ className }: any) => <div className={className} data-testid="laptop-icon" />,
  Smartphone: ({ className }: any) => <div className={className} data-testid="smartphone-icon" />,
}));

vi.mock('@/components/molecules/PermissionItem', () => ({
  PermissionItem: ({ id, name, checked, onChange, disabled }: any) => (
    <div data-testid={`permission-item-${id}`}>
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
      />
      <label htmlFor={id}>{name}</label>
    </div>
  ),
}));

vi.mock('@/utils/cn', () => ({
  cn: (...args: any[]) => args.filter(Boolean).join(' '),
}));

describe('PermissionGroup', () => {
  const mockSubPermissions = [
    { id: 'view', name: 'View', checked: false },
    { id: 'create', name: 'Create', checked: true },
    { id: 'edit', name: 'Edit', checked: false },
  ];

  const defaultProps = {
    id: 'user-management',
    name: 'User Management',
    subPermissions: mockSubPermissions,
    onSubPermissionChange: vi.fn(),
  };

  it('renders group name', () => {
    render(<PermissionGroup {...defaultProps} />);
    expect(screen.getByText('User Management')).toBeInTheDocument();
  });

  it('renders all sub-permissions', () => {
    render(<PermissionGroup {...defaultProps} />);

    expect(screen.getByText('View')).toBeInTheDocument();
    expect(screen.getByText('Create')).toBeInTheDocument();
    expect(screen.getByText('Edit')).toBeInTheDocument();
  });

  it('renders icon when provided', () => {
    render(<PermissionGroup {...defaultProps} icon="web" />);
    expect(screen.getByTestId('laptop-icon')).toBeInTheDocument();
  });

  it('renders smartphone icon for mobile', () => {
    render(<PermissionGroup {...defaultProps} icon="mobile" />);
    expect(screen.getByTestId('smartphone-icon')).toBeInTheDocument();
  });

  it('does not render icon when not provided', () => {
    render(<PermissionGroup {...defaultProps} />);
    expect(screen.queryByTestId('laptop-icon')).not.toBeInTheDocument();
    expect(screen.queryByTestId('smartphone-icon')).not.toBeInTheDocument();
  });

  it('calls onSubPermissionChange when permission is toggled', async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();
    render(<PermissionGroup {...defaultProps} onSubPermissionChange={handleChange} />);

    const viewCheckbox = screen.getByRole('checkbox', { name: 'View' });
    await user.click(viewCheckbox);

    expect(handleChange).toHaveBeenCalledWith('view', true);
  });

  it('reflects initial checked state of permissions', () => {
    render(<PermissionGroup {...defaultProps} />);

    const viewCheckbox = screen.getByRole('checkbox', { name: 'View' }) as HTMLInputElement;
    const createCheckbox = screen.getByRole('checkbox', { name: 'Create' }) as HTMLInputElement;

    expect(viewCheckbox.checked).toBe(false);
    expect(createCheckbox.checked).toBe(true);
  });

  it('disables all sub-permissions when disabled prop is true', () => {
    render(<PermissionGroup {...defaultProps} disabled={true} />);

    const checkboxes = screen.getAllByRole('checkbox');
    checkboxes.forEach((checkbox) => {
      expect(checkbox).toBeDisabled();
    });
  });

  it('enables all sub-permissions when disabled prop is false', () => {
    render(<PermissionGroup {...defaultProps} disabled={false} />);

    const checkboxes = screen.getAllByRole('checkbox');
    checkboxes.forEach((checkbox) => {
      expect(checkbox).not.toBeDisabled();
    });
  });

  it('accepts custom className', () => {
    const { container } = render(<PermissionGroup {...defaultProps} className="custom-class" />);

    const wrapper = container.querySelector('.space-y-0');
    expect(wrapper?.className).toContain('custom-class');
  });

  it('generates correct permission item IDs', () => {
    render(<PermissionGroup {...defaultProps} />);

    expect(screen.getByTestId('permission-item-user-management-view')).toBeInTheDocument();
    expect(screen.getByTestId('permission-item-user-management-create')).toBeInTheDocument();
    expect(screen.getByTestId('permission-item-user-management-edit')).toBeInTheDocument();
  });

  it('updates when sub-permissions prop changes', () => {
    const { rerender } = render(<PermissionGroup {...defaultProps} />);

    const newSubPermissions = [
      { id: 'view', name: 'View', checked: true },
      { id: 'delete', name: 'Delete', checked: false },
    ];

    rerender(<PermissionGroup {...defaultProps} subPermissions={newSubPermissions} />);

    expect(screen.queryByText('Create')).not.toBeInTheDocument();
    expect(screen.queryByText('Edit')).not.toBeInTheDocument();
    expect(screen.getByText('Delete')).toBeInTheDocument();
  });

  it('handles multiple permission changes', async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();
    render(<PermissionGroup {...defaultProps} onSubPermissionChange={handleChange} />);

    const viewCheckbox = screen.getByRole('checkbox', { name: 'View' });
    const editCheckbox = screen.getByRole('checkbox', { name: 'Edit' });

    await user.click(viewCheckbox);
    await user.click(editCheckbox);

    expect(handleChange).toHaveBeenCalledTimes(2);
    expect(handleChange).toHaveBeenNthCalledWith(1, 'view', true);
    expect(handleChange).toHaveBeenNthCalledWith(2, 'edit', true);
  });

  it('renders with empty subPermissions', () => {
    render(<PermissionGroup {...defaultProps} subPermissions={[]} />);

    expect(screen.getByText('User Management')).toBeInTheDocument();
    expect(screen.queryAllByRole('checkbox')).toHaveLength(0);
  });

  it('maintains permission state independently', async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();

    const { rerender } = render(
      <PermissionGroup {...defaultProps} onSubPermissionChange={handleChange} />
    );

    const createCheckbox = screen.getByRole('checkbox', { name: 'Create' });
    await user.click(createCheckbox);

    rerender(
      <PermissionGroup
        {...defaultProps}
        subPermissions={[...mockSubPermissions, { id: 'approve', name: 'Approve', checked: false }]}
        onSubPermissionChange={handleChange}
      />
    );

    expect(screen.getByText('Approve')).toBeInTheDocument();
    expect(handleChange).toHaveBeenCalled();
  });
});
