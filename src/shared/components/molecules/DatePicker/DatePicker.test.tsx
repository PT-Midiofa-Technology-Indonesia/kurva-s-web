import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Controller, useForm } from 'react-hook-form';
import { describe, expect, it, vi } from 'vitest';
import { DatePicker } from './DatePicker';

vi.mock('lucide-react', () => ({
  CalendarIcon: ({ className }: any) => <div className={className} data-testid="calendar-icon" />,
  ChevronLeft: ({ className }: any) => <div className={className} data-testid="chevron-left" />,
  ChevronRight: ({ className }: any) => <div className={className} data-testid="chevron-right" />,
  ChevronDown: ({ className }: any) => <div className={className} data-testid="chevron-down" />,
  XIcon: ({ className }: any) => <div className={className} data-testid="x-icon" />,
}));

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, disabled, variant, className, ...props }: any) => (
    <button
      onClick={onClick}
      disabled={disabled}
      data-variant={variant}
      className={className}
      {...props}
    >
      {children}
    </button>
  ),
}));

vi.mock('@/shared/components/ui/calendar', () => ({
  Calendar: ({ mode, onSelect, footer }: any) => (
    <div data-testid="calendar" data-mode={mode}>
      <button
        type="button"
        data-testid="calendar-select-btn"
        onClick={() => onSelect?.(new Date(2024, 0, 15))}
      >
        Select Date
      </button>
      {footer && <div data-testid="calendar-footer">{footer}</div>}
    </div>
  ),
}));

vi.mock('@/shared/components/ui/popover', () => ({
  Popover: ({ children, open }: any) => (
    <div data-testid="popover" data-open={open ?? true}>
      {children}
    </div>
  ),
  PopoverTrigger: ({ children }: any) => <div data-testid="popover-trigger">{children}</div>,
  PopoverContent: ({ children, className, container }: any) => (
    <div
      data-testid="popover-content"
      className={className}
      data-container={container ? container.getAttribute('data-marker') : 'none'}
    >
      {children}
    </div>
  ),
}));

vi.mock('@/lib/utils', () => ({
  cn: (...args: any[]) => args.filter(Boolean).join(' '),
}));

describe('DatePicker', () => {
  function ReactHookFormDatePicker() {
    const { control } = useForm({
      defaultValues: { dueDate: new Date(2026, 7, 31) },
    });

    return (
      <Controller
        control={control}
        name="dueDate"
        render={({ field }) => (
          <DatePicker
            mode="single"
            value={field.value}
            onChange={(value) => field.onChange(value ?? null)}
          />
        )}
      />
    );
  }

  it('clears a controlled date on the first click when used with react-hook-form', async () => {
    const user = userEvent.setup();
    render(<ReactHookFormDatePicker />);

    await user.click(screen.getByRole('button', { name: 'Clear date' }));

    expect(screen.getByText('Pilih tanggal')).toBeInTheDocument();
  });

  it('renders date picker button', () => {
    render(<DatePicker />);
    expect(screen.getByTestId('popover-trigger')).toBeInTheDocument();
  });

  it('renders calendar icon', () => {
    render(<DatePicker />);
    expect(screen.getByTestId('calendar-icon')).toBeInTheDocument();
  });

  it('renders a trigger chevron when showChevron is enabled', () => {
    render(<DatePicker showChevron />);
    expect(screen.getAllByTestId('chevron-down')).toHaveLength(2);
  });

  it('displays placeholder text for single mode by default', () => {
    render(<DatePicker mode="single" />);
    expect(screen.getByText('Pilih tanggal')).toBeInTheDocument();
  });

  it('displays custom placeholder text', () => {
    render(<DatePicker mode="single" placeholder="Select date" />);
    expect(screen.getByText('Select date')).toBeInTheDocument();
  });

  it('displays range placeholder text in range mode', () => {
    render(<DatePicker mode="range" />);
    expect(screen.getByText('Pilih rentang tanggal')).toBeInTheDocument();
  });

  it('displays custom range placeholder', () => {
    render(<DatePicker mode="range" rangePlaceholder="Select range" />);
    expect(screen.getByText('Select range')).toBeInTheDocument();
  });

  it('renders popover content with calendar', () => {
    render(<DatePicker />);
    expect(screen.getByTestId('popover')).toBeInTheDocument();
    expect(screen.getByTestId('calendar')).toBeInTheDocument();
  });

  it('renders calendar in single mode', () => {
    render(<DatePicker mode="single" />);
    const calendar = screen.getByTestId('calendar');
    expect(calendar).toHaveAttribute('data-mode', 'single');
  });

  it('renders calendar in range mode', () => {
    render(<DatePicker mode="range" />);
    const calendar = screen.getByTestId('calendar');
    expect(calendar).toHaveAttribute('data-mode', 'range');
  });

  it('calls onChange when date selected', async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();
    render(<DatePicker mode="single" onChange={handleChange} />);

    const selectButton = screen.getByTestId('calendar-select-btn');
    await user.click(selectButton);

    expect(handleChange).toHaveBeenCalled();
  });

  it('disables date picker when disabledState is true', () => {
    const { container } = render(<DatePicker disabledState={true} />);
    const button = container.querySelector('button');
    expect(button).toBeDisabled();
  });

  it('accepts custom className', () => {
    const { container } = render(<DatePicker className="custom-class" />);
    const button = container.querySelector('button');
    expect(button?.className).toContain('custom-class');
  });

  it('accepts custom popoverClassName', () => {
    render(<DatePicker popoverClassName="custom-popover-class" />);
    const content = screen.getByTestId('popover-content');
    expect(content.className).toContain('custom-popover-class');
  });

  it('forwards popoverContainer to the underlying PopoverContent, for fullscreen portal support', () => {
    const marker = document.createElement('div');
    marker.setAttribute('data-marker', 'fullscreen-root');
    render(<DatePicker popoverContainer={marker} />);
    const content = screen.getByTestId('popover-content');
    expect(content).toHaveAttribute('data-container', 'fullscreen-root');
  });

  it('renders footer when provided', () => {
    const footer = <div data-testid="custom-footer">Custom Footer</div>;
    render(<DatePicker footer={footer} />);
    expect(screen.getByTestId('custom-footer')).toBeInTheDocument();
  });

  it('renders clear button when date is selected', () => {
    const { container } = render(<DatePicker mode="single" defaultValue={new Date(2024, 0, 15)} />);

    const clearButton = container.querySelector('button[aria-label="Clear date"]');
    expect(clearButton).toBeInTheDocument();
  });

  it('calls onChange with undefined when clear button clicked', async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();
    const { container } = render(
      <DatePicker mode="single" defaultValue={new Date(2024, 0, 15)} onChange={handleChange} />
    );

    const clearButton = container.querySelector('button[aria-label="Clear date"]') as HTMLElement;
    if (clearButton) {
      await user.click(clearButton);
      expect(handleChange).toHaveBeenCalledWith(undefined);
    }
  });

  it('does not render clear button when empty', () => {
    const { container } = render(<DatePicker mode="single" />);
    const clearButton = container.querySelector('button[aria-label="Clear date"]');
    expect(clearButton).not.toBeInTheDocument();
  });

  it('hides the clear button when clearable is false, even with a value', () => {
    const { container } = render(
      <DatePicker mode="single" defaultValue={new Date(2024, 0, 15)} clearable={false} />
    );
    const clearButton = container.querySelector('button[aria-label="Clear date"]');
    expect(clearButton).not.toBeInTheDocument();
  });

  it('forwards ref correctly', () => {
    const ref = { current: null };
    render(<DatePicker ref={ref as any} />);
    expect(ref.current).toBeTruthy();
  });

  it('accepts controlled value prop', () => {
    const { rerender } = render(<DatePicker mode="single" value={undefined} onChange={vi.fn()} />);
    expect(screen.getByText('Pilih tanggal')).toBeInTheDocument();

    rerender(<DatePicker mode="single" value={new Date(2024, 0, 15)} onChange={vi.fn()} />);
    expect(screen.queryByText('Pilih tanggal')).not.toBeInTheDocument();
  });

  it('accepts defaultValue prop', () => {
    render(<DatePicker mode="single" defaultValue={new Date(2024, 0, 15)} />);
    expect(screen.queryByText('Pilih tanggal')).not.toBeInTheDocument();
  });

  it('keeps popover open in range mode after selection', async () => {
    const user = userEvent.setup();
    render(<DatePicker mode="range" />);

    const selectButton = screen.getByTestId('calendar-select-btn');
    await user.click(selectButton);

    const popover = screen.getByTestId('popover');
    expect(popover).toBeInTheDocument();
  });

  it('closes popover in single mode after selection', async () => {
    const user = userEvent.setup();
    render(<DatePicker mode="single" />);

    const selectButton = screen.getByTestId('calendar-select-btn');
    await user.click(selectButton);

    expect(screen.getByTestId('popover')).toBeInTheDocument();
  });

  it('applies muted-foreground class when empty', () => {
    const { container } = render(<DatePicker mode="single" />);
    const button = container.querySelector('button');
    expect(button?.className).toContain('text-muted-foreground');
  });

  it('renders navigation header with chevrons', async () => {
    const user = userEvent.setup();
    render(<DatePicker mode="single" />);

    const trigger = screen.getByTestId('popover-trigger');
    await user.click(trigger);

    expect(screen.getByTestId('chevron-left')).toBeInTheDocument();
    expect(screen.getByTestId('chevron-right')).toBeInTheDocument();
    expect(screen.getByTestId('chevron-down')).toBeInTheDocument();
  });

  it('navigates months with prev/next buttons', async () => {
    const user = userEvent.setup();
    render(<DatePicker mode="single" />);

    const trigger = screen.getByTestId('popover-trigger');
    await user.click(trigger);

    const prevBtn = screen.getByTestId('chevron-left').parentElement;
    const nextBtn = screen.getByTestId('chevron-right').parentElement;

    if (prevBtn) await user.click(prevBtn);
    if (nextBtn) await user.click(nextBtn);
  });

  it('disables navigation when disabledState is true', () => {
    const { container } = render(<DatePicker mode="single" disabledState />);
    const trigger = container.querySelector('button');
    expect(trigger).toBeDisabled();
  });

  it('selects month in month mode', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(<DatePicker mode="month" defaultOpen onChange={handleChange} />);

    const monthButton = screen.getByRole('button', { name: /Jan/i });
    await user.click(monthButton);

    expect(handleChange).toHaveBeenCalled();
  });
});
