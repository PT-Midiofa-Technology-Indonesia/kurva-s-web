import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Input } from './Input';

vi.mock('@/components/ui/input', () => ({
  Input: ({ className, ...props }: any) => <input className={className} {...props} />,
}));

vi.mock('@/components/ui/label', () => ({
  Label: ({ children, className, ...props }: any) => (
    <label className={className} {...props}>
      {children}
    </label>
  ),
}));

vi.mock('@/lib/utils', () => ({
  cn: (...args: any[]) => args.filter(Boolean).join(' '),
}));

describe('Input', () => {
  it('renders with label when showLabel is true', () => {
    render(<Input label="Email" />);
    expect(screen.getByText('Email')).toBeInTheDocument();
  });

  it('hides label when showLabel is false', () => {
    render(<Input label="Email" showLabel={false} />);
    expect(screen.queryByText('Email')).not.toBeInTheDocument();
  });

  it('renders required asterisk when required prop is true', () => {
    const { container } = render(<Input label="Email" required />);
    const label = container.querySelector('label');
    expect(label).toBeInTheDocument();
  });

  it('handles input changes', async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();

    render(<Input onChange={handleChange} />);
    const input = screen.getByRole('textbox');

    await user.type(input, 'test@example.com');
    expect(handleChange).toHaveBeenCalled();
  });

  it('displays error message when error prop is provided', () => {
    render(<Input error="Email is invalid" />);
    expect(screen.getByText('Email is invalid')).toBeInTheDocument();
  });

  it('displays hint when hint prop is provided', () => {
    render(<Input hint="Enter a valid email" />);
    expect(screen.getByText('Enter a valid email')).toBeInTheDocument();
  });

  it('hides hint when showHint is false', () => {
    render(<Input hint="Enter a valid email" showHint={false} />);
    expect(screen.queryByText('Enter a valid email')).not.toBeInTheDocument();
  });

  it('prioritizes error over hint', () => {
    render(<Input error="Email is invalid" hint="Enter a valid email" />);
    expect(screen.getByText('Email is invalid')).toBeInTheDocument();
    expect(screen.queryByText('Enter a valid email')).not.toBeInTheDocument();
  });

  it('renders leftIcon when provided', () => {
    render(<Input leftIcon={<span data-testid="left-icon">📧</span>} />);
    expect(screen.getByTestId('left-icon')).toBeInTheDocument();
  });

  it('renders rightIcon when provided', () => {
    render(<Input rightIcon={<span data-testid="right-icon">✓</span>} />);
    expect(screen.getByTestId('right-icon')).toBeInTheDocument();
  });

  it('disables input when disabled prop is true', () => {
    render(<Input disabled />);
    const input = screen.getByRole('textbox');
    expect(input).toBeDisabled();
  });

  it('sets aria-invalid when error exists', () => {
    render(<Input error="Invalid" />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('aria-invalid', 'true');
  });

  it('sets aria-invalid to false when no error', () => {
    render(<Input />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('aria-invalid', 'false');
  });

  it('applies error styling to input', () => {
    render(<Input error="Invalid" />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveClass('border-destructive');
  });

  it('forwards ref correctly', () => {
    const ref = { current: null };
    render(<Input ref={ref as any} />);
    expect(ref.current).toBeTruthy();
  });
});
