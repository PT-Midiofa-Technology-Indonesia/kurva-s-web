import { describe, expect, it, vi } from 'vitest';

// Mock the Checkbox component from shadcn
vi.mock('@/components/ui/checkbox', () => ({
  Checkbox: ({ checked, onCheckedChange, disabled, ...props }: any) => (
    <input
      {...props}
      type="checkbox"
      checked={checked}
      disabled={disabled}
      onChange={(e) => onCheckedChange(e.currentTarget.checked)}
    />
  ),
}));

// Mock the cn utility
vi.mock('@/utils/cn', () => ({
  cn: (...args: any[]) => args.filter(Boolean).join(' '),
}));

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PermissionCheckbox } from './PermissionCheckbox';

describe('PermissionCheckbox', () => {
  it('renders label text', () => {
    const onChange = vi.fn();
    render(
      <PermissionCheckbox
        id="permission-1"
        label="View Reports"
        checked={false}
        onChange={onChange}
      />
    );
    expect(screen.getByLabelText('View Reports')).toBeInTheDocument();
  });

  it('calls onChange when checked', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();

    render(
      <PermissionCheckbox
        id="permission-1"
        label="Edit Users"
        checked={false}
        onChange={onChange}
      />
    );

    const checkbox = screen.getByRole('checkbox');
    await user.click(checkbox);

    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('calls onChange with false when unchecking', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();

    render(
      <PermissionCheckbox
        id="permission-1"
        label="Delete Users"
        checked={true}
        onChange={onChange}
      />
    );

    const checkbox = screen.getByRole('checkbox');
    await user.click(checkbox);

    expect(onChange).toHaveBeenCalledWith(false);
  });

  it('disables checkbox when disabled prop is true', () => {
    const onChange = vi.fn();
    render(
      <PermissionCheckbox
        id="permission-1"
        label="Admin Access"
        checked={false}
        onChange={onChange}
        disabled={true}
      />
    );

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeDisabled();
  });

  it('renders with custom className', () => {
    const onChange = vi.fn();
    render(
      <PermissionCheckbox
        id="permission-1"
        label="Custom Class"
        checked={false}
        onChange={onChange}
        className="custom-class"
      />
    );

    const container = screen.getByLabelText('Custom Class').closest('div');
    expect(container).toHaveClass('custom-class');
  });
});
