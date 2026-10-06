import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Checkbox } from './Checkbox';

vi.mock('@/components/ui/checkbox', () => ({
  Checkbox: ({ checked, onChange, disabled, id, className, ...props }: any) => (
    <input
      type="checkbox"
      id={id}
      checked={checked}
      onChange={onChange}
      disabled={disabled}
      className={className}
      {...props}
    />
  ),
}));

vi.mock('@/lib/utils', () => ({
  cn: (...args: any[]) => args.filter(Boolean).join(' '),
}));

describe('Checkbox', () => {
  it('renders checkbox input', () => {
    const { container } = render(<Checkbox />);
    const checkbox = container.querySelector('input[type="checkbox"]');
    expect(checkbox).toBeInTheDocument();
  });

  it('renders with label', () => {
    render(<Checkbox label="Accept terms" />);
    expect(screen.getByText('Accept terms')).toBeInTheDocument();
  });

  it('renders with description', () => {
    render(<Checkbox label="Subscribe" description="Receive email notifications" />);
    expect(screen.getByText('Receive email notifications')).toBeInTheDocument();
  });

  it('renders error message', () => {
    render(<Checkbox error="This field is required" />);
    expect(screen.getByText('This field is required')).toBeInTheDocument();
  });

  it('handles checked state', async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();
    const { container } = render(<Checkbox checked={false} onChange={handleChange} />);

    const checkbox = container.querySelector('input[type="checkbox"]')!;
    await user.click(checkbox);

    expect(handleChange).toHaveBeenCalled();
  });

  it('disables checkbox when disabled prop is true', () => {
    const { container } = render(<Checkbox disabled />);
    const checkbox = container.querySelector('input[type="checkbox"]');
    expect(checkbox).toBeDisabled();
  });

  it('disables label when checkbox is disabled', () => {
    const { container } = render(<Checkbox label="Disabled option" disabled />);
    const wrapper = container.querySelector('.opacity-50');
    expect(wrapper).toBeInTheDocument();
  });

  it('applies error styling when error is present', () => {
    const { container } = render(<Checkbox error="Error message" />);
    const checkbox = container.querySelector('input[type="checkbox"]');
    expect(checkbox?.className).toContain('destructive');
  });

  it('associates label with checkbox via id', () => {
    const { container } = render(<Checkbox id="my-checkbox" label="My Label" />);
    const checkbox = container.querySelector('input[id="my-checkbox"]');
    const label = container.querySelector('label[for="my-checkbox"]');
    expect(checkbox).toBeInTheDocument();
    expect(label).toBeInTheDocument();
  });

  it('generates id when not provided', () => {
    const { container } = render(<Checkbox label="Auto ID" />);
    const checkbox = container.querySelector('input[type="checkbox"]');
    expect(checkbox?.id).toBeTruthy();
  });

  it('forwards ref correctly', () => {
    const ref = { current: null };
    render(<Checkbox ref={ref as any} />);
    expect(ref.current).toBeTruthy();
  });
});
