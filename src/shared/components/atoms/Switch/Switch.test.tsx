import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Switch } from './Switch';

vi.mock('@/components/ui/switch', () => ({
  Switch: ({ checked, onCheckedChange, disabled, className, ...props }: any) => (
    <button
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      className={className}
      onClick={() => onCheckedChange?.(!checked)}
      {...props}
    />
  ),
}));

vi.mock('@/lib/utils', () => ({
  cn: (...args: any[]) => args.filter(Boolean).join(' '),
}));

describe('Switch', () => {
  it('renders without label when showLabel is false', () => {
    render(<Switch label="Toggle me" showLabel={false} data-testid="switch-no-label" />);
    expect(screen.queryByText('Toggle me')).not.toBeInTheDocument();
    expect(screen.getByRole('switch')).toBeInTheDocument();
  });

  it('renders with label when showLabel is true', () => {
    render(<Switch label="Toggle me" showLabel data-testid="switch-with-label" />);
    expect(screen.getByText('Toggle me')).toBeInTheDocument();
    expect(screen.getByRole('switch')).toBeInTheDocument();
  });

  it('hides label when label prop is not provided', () => {
    render(<Switch showLabel data-testid="switch" />);
    expect(screen.getByRole('switch')).toBeInTheDocument();
  });

  it('positions label on the right by default', () => {
    const { container } = render(
      <Switch label="Right label" labelPosition="right" data-testid="switch" />
    );
    const label = container.querySelector('label');
    expect(label?.className).toContain('flex-row');
  });

  it('positions label on the left when labelPosition is left', () => {
    const { container } = render(
      <Switch label="Left label" labelPosition="left" data-testid="switch" />
    );
    const label = container.querySelector('label');
    expect(label?.className).toContain('flex-row-reverse');
  });

  it('renders as checked when checked prop is true', () => {
    render(<Switch checked />);
    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'true');
  });

  it('renders as unchecked when checked prop is false', () => {
    render(<Switch checked={false} />);
    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'false');
  });

  it('handles default checked state', () => {
    render(<Switch defaultChecked />);
    const switchElement = screen.getByRole('switch');
    expect(switchElement).toBeInTheDocument();
  });

  it('disables switch when disabled prop is true', () => {
    render(<Switch disabled data-testid="disabled-switch" />);
    expect(screen.getByRole('switch')).toBeDisabled();
  });

  it('calls onCheckedChange when toggled', async () => {
    const handleCheckedChange = vi.fn();
    const user = userEvent.setup();

    render(
      <Switch
        checked={false}
        onCheckedChange={handleCheckedChange}
        data-testid="toggleable-switch"
      />
    );

    await user.click(screen.getByRole('switch'));
    expect(handleCheckedChange).toHaveBeenCalledWith(true);
  });

  it('accepts size prop', () => {
    const { container: smallContainer } = render(<Switch size="sm" />);
    const smallSwitch = smallContainer.querySelector('[role="switch"]');
    expect(smallSwitch).toBeInTheDocument();

    const { container: defaultContainer } = render(<Switch size="default" />);
    const defaultSwitch = defaultContainer.querySelector('[role="switch"]');
    expect(defaultSwitch).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<Switch className="custom-class" data-testid="custom-switch" />);
    const switchEl = screen.getByRole('switch');
    expect(switchEl.className).toContain('custom-class');
  });

  it('forwards ref correctly', () => {
    const ref = { current: null };
    render(<Switch ref={ref as any} data-testid="ref-switch" />);
    expect(ref.current).toBeTruthy();
  });

  it('applies disabled styling to wrapper when disabled', () => {
    const { container } = render(
      <Switch label="Disabled switch" disabled data-testid="styled-disabled" />
    );
    const label = container.querySelector('label');
    expect(label?.className).toContain('opacity-50');
  });

  it('applies disabled styling to div wrapper when no label', () => {
    const { container } = render(<Switch disabled showLabel={false} data-testid="div-disabled" />);
    const div = container.querySelector('div');
    expect(div?.className).toContain('opacity-50');
  });
});
