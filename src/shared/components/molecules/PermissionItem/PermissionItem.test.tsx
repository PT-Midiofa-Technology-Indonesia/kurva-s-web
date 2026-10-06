import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { PermissionItem } from './PermissionItem';

vi.mock('@/components/atoms/PermissionCheckbox', () => ({
  PermissionCheckbox: ({ id, label, checked, onChange, disabled }: any) => (
    <div data-testid="permission-checkbox">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
        aria-label={label}
      />
      <label htmlFor={id}>{label}</label>
    </div>
  ),
}));

vi.mock('@/utils/cn', () => ({
  cn: (...args: any[]) => args.filter(Boolean).join(' '),
}));

describe('PermissionItem', () => {
  it('renders permission checkbox with label', () => {
    const handleChange = vi.fn();
    render(<PermissionItem id="perm-1" name="Read" checked={false} onChange={handleChange} />);
    expect(screen.getByText('Read')).toBeInTheDocument();
    expect(screen.getByTestId('permission-checkbox')).toBeInTheDocument();
  });

  it('displays permission name', () => {
    const handleChange = vi.fn();
    render(
      <PermissionItem id="perm-1" name="Create Users" checked={false} onChange={handleChange} />
    );
    expect(screen.getByText('Create Users')).toBeInTheDocument();
  });

  it('renders checked checkbox when checked is true', () => {
    const handleChange = vi.fn();
    const { container } = render(
      <PermissionItem id="perm-1" name="Write" checked={true} onChange={handleChange} />
    );
    const checkbox = container.querySelector('input[type="checkbox"]');
    expect(checkbox).toBeChecked();
  });

  it('renders unchecked checkbox when checked is false', () => {
    const handleChange = vi.fn();
    const { container } = render(
      <PermissionItem id="perm-1" name="Write" checked={false} onChange={handleChange} />
    );
    const checkbox = container.querySelector('input[type="checkbox"]');
    expect(checkbox).not.toBeChecked();
  });

  it('calls onChange with true when checkbox checked', async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();
    const { container } = render(
      <PermissionItem id="perm-1" name="Delete" checked={false} onChange={handleChange} />
    );

    const checkbox = container.querySelector('input[type="checkbox"]')!;
    await user.click(checkbox);

    expect(handleChange).toHaveBeenCalledWith(true);
  });

  it('calls onChange with false when checkbox unchecked', async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();
    const { container } = render(
      <PermissionItem id="perm-1" name="Delete" checked={true} onChange={handleChange} />
    );

    const checkbox = container.querySelector('input[type="checkbox"]')!;
    await user.click(checkbox);

    expect(handleChange).toHaveBeenCalledWith(false);
  });

  it('disables checkbox when disabled is true', () => {
    const handleChange = vi.fn();
    const { container } = render(
      <PermissionItem id="perm-1" name="Admin" checked={false} onChange={handleChange} disabled />
    );
    const checkbox = container.querySelector('input[type="checkbox"]');
    expect(checkbox).toBeDisabled();
  });

  it('enables checkbox when disabled is false', () => {
    const handleChange = vi.fn();
    const { container } = render(
      <PermissionItem
        id="perm-1"
        name="Admin"
        checked={false}
        onChange={handleChange}
        disabled={false}
      />
    );
    const checkbox = container.querySelector('input[type="checkbox"]');
    expect(checkbox).not.toBeDisabled();
  });

  it('accepts custom className', () => {
    const handleChange = vi.fn();
    const { container } = render(
      <PermissionItem
        id="perm-1"
        name="View"
        checked={false}
        onChange={handleChange}
        className="custom-class"
      />
    );
    const wrapper = container.querySelector('[class*="custom-class"]');
    expect(wrapper).toBeInTheDocument();
  });

  it('uses provided id for checkbox', () => {
    const handleChange = vi.fn();
    const { container } = render(
      <PermissionItem id="custom-id" name="Execute" checked={false} onChange={handleChange} />
    );
    const checkbox = container.querySelector('input[id="custom-id"]');
    expect(checkbox).toBeInTheDocument();
  });

  it('associates label with checkbox via htmlFor', () => {
    const handleChange = vi.fn();
    const { container } = render(
      <PermissionItem id="perm-123" name="Approve" checked={false} onChange={handleChange} />
    );
    const label = container.querySelector('label[for="perm-123"]');
    expect(label).toBeInTheDocument();
  });
});
