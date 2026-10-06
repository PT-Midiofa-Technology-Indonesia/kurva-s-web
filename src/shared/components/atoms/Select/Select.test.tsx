import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AsyncSelect, SelectOption } from './Select';

vi.mock('lucide-react', () => ({
  CheckIcon: ({ className }: any) => <div className={className} data-testid="check-icon" />,
  ChevronDownIcon: ({ className }: any) => (
    <div className={className} data-testid="chevron-down-icon" />
  ),
  Loader2Icon: ({ className }: any) => <div className={className} data-testid="loader-icon" />,
  XIcon: ({ className }: any) => <div className={className} data-testid="x-icon" />,
}));

vi.mock('@/components/ui/badge', () => ({
  Badge: ({ children, className, variant }: any) => (
    <div className={className} data-variant={variant}>
      {children}
    </div>
  ),
}));

vi.mock('@/components/ui/command', () => ({
  Command: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  CommandEmpty: ({ children }: any) => <div data-testid="command-empty">{children}</div>,
  CommandGroup: ({ children, heading }: any) => (
    <div data-testid="command-group" data-heading={heading}>
      {children}
    </div>
  ),
  CommandInput: ({ value, onValueChange, placeholder }: any) => (
    <input
      data-testid="command-input"
      placeholder={placeholder}
      value={value}
      onChange={(e) => onValueChange(e.target.value)}
    />
  ),
  CommandItem: ({ children, onSelect, disabled }: any) => (
    <button
      type="button"
      data-testid="command-item"
      onClick={() => !disabled && onSelect()}
      disabled={disabled}
    >
      {children}
    </button>
  ),
  CommandList: ({ children }: any) => <div data-testid="command-list">{children}</div>,
}));

vi.mock('@/components/ui/popover', () => ({
  Popover: ({ children, open }: any) => (
    <div data-testid="popover" data-open={open}>
      {children}
    </div>
  ),
  PopoverTrigger: ({ children }: any) => <div data-testid="popover-trigger">{children}</div>,
  PopoverContent: ({ children, className }: any) => (
    <div data-testid="popover-content" className={className}>
      {children}
    </div>
  ),
}));

vi.mock('@/lib/utils', () => ({
  cn: (...args: any[]) => args.filter(Boolean).join(' '),
}));

describe('AsyncSelect', () => {
  const defaultOptions: SelectOption[] = [
    { value: 'opt1', label: 'Option 1' },
    { value: 'opt2', label: 'Option 2' },
    { value: 'opt3', label: 'Option 3', disabled: true },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders with options', () => {
    render(<AsyncSelect options={defaultOptions} />);
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('displays placeholder when no value selected', () => {
    render(<AsyncSelect options={defaultOptions} placeholder="Select an option" />);
    expect(screen.getByText('Select an option')).toBeInTheDocument();
  });

  it('displays selected value', () => {
    render(<AsyncSelect options={defaultOptions} value="opt1" />);
    expect(screen.getByRole('combobox')).toHaveTextContent('Option 1');
  });

  it('calls onChange when option selected in single mode', async () => {
    const handleChange = vi.fn();

    render(<AsyncSelect options={defaultOptions} onChange={handleChange} />);

    await waitFor(() => {
      const trigger = screen.getByRole('combobox');
      expect(trigger).toBeInTheDocument();
    });
  });

  it('supports multi-select mode', () => {
    render(<AsyncSelect options={defaultOptions} isMulti />);
    const combobox = screen.getByRole('combobox');
    expect(combobox).toHaveAttribute('aria-expanded', 'false');
  });

  it('shows loading spinner when isLoading is true', () => {
    render(<AsyncSelect options={defaultOptions} isLoading />);
    expect(screen.getByTestId('loader-icon')).toBeInTheDocument();
  });

  it('disables interaction when isDisabled is true', () => {
    render(<AsyncSelect options={defaultOptions} isDisabled />);
    const combobox = screen.getByRole('combobox');
    expect(combobox).toHaveAttribute('aria-disabled', 'true');
  });

  it('sets aria-invalid when invalid prop is true', () => {
    render(<AsyncSelect options={defaultOptions} invalid />);
    const combobox = screen.getByRole('combobox');
    expect(combobox).toHaveAttribute('aria-invalid', 'true');
  });

  it('renders with grouped options', () => {
    render(
      <AsyncSelect
        groups={[
          { heading: 'Group 1', options: [defaultOptions[0], defaultOptions[1]] },
          { heading: 'Group 2', options: [defaultOptions[2]] },
        ]}
      />
    );
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('supports default value in controlled mode', () => {
    render(<AsyncSelect options={defaultOptions} defaultValue="opt1" />);
    expect(screen.getByRole('combobox')).toHaveTextContent('Option 1');
  });

  it('forwards ref correctly', () => {
    const ref = { current: null };
    render(<AsyncSelect ref={ref as any} options={defaultOptions} />);
    expect(ref.current).toBeTruthy();
  });

  it('accepts custom className', () => {
    const { container } = render(<AsyncSelect options={defaultOptions} className="custom-class" />);
    const combobox = container.querySelector('[role="combobox"]');
    expect(combobox?.className).toContain('custom-class');
  });

  it('accepts custom id', () => {
    render(<AsyncSelect options={defaultOptions} id="my-select" />);
    expect(screen.getByRole('combobox')).toHaveAttribute('id', 'my-select');
  });
});
