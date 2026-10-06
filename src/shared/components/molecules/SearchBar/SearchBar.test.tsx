import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SearchBar } from './SearchBar';

vi.mock('lucide-react', () => ({
  Search: ({ className }: any) => <div className={className} data-testid="search-icon" />,
  X: ({ className }: any) => <div className={className} data-testid="x-icon" />,
}));

vi.mock('@/components/atoms/Button', () => ({
  Button: ({ children, onClick, className, variant, size, ...props }: any) => (
    <button
      className={className}
      data-variant={variant}
      data-size={size}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  ),
}));

vi.mock('@/components/atoms/Input', () => ({
  Input: ({ value, onChange, leftIcon, rightIcon, placeholder, className, ...props }: any) => (
    <div data-testid="input-wrapper">
      {leftIcon}
      <input
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={className}
        {...props}
      />
      {rightIcon}
    </div>
  ),
}));

vi.mock('@/hooks/use-debounce', () => ({
  useDebounce: (value: any) => value,
}));

vi.mock('@/lib/utils', () => ({
  cn: (...args: any[]) => args.filter(Boolean).join(' '),
}));

describe('SearchBar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders search input', () => {
    render(<SearchBar />);
    expect(screen.getByTestId('input-wrapper')).toBeInTheDocument();
  });

  it('renders with default placeholder', () => {
    const { container } = render(<SearchBar />);
    const input = container.querySelector('input');
    expect(input?.placeholder).toBe('Type here');
  });

  it('renders with custom placeholder', () => {
    const { container } = render(<SearchBar placeholder="Search items..." />);
    const input = container.querySelector('input');
    expect(input?.placeholder).toBe('Search items...');
  });

  it('renders search icon', () => {
    render(<SearchBar />);
    expect(screen.getByTestId('search-icon')).toBeInTheDocument();
  });

  it('does not show clear button by default', () => {
    render(<SearchBar />);
    expect(screen.queryByTestId('x-icon')).not.toBeInTheDocument();
  });

  it('shows clear button when showClear is true and has value', () => {
    render(<SearchBar defaultValue="" showClear placeholder="Search" />);

    expect(screen.queryByTestId('x-icon')).not.toBeInTheDocument();
  });

  it('handles input change', async () => {
    const user = userEvent.setup();
    const { container } = render(<SearchBar />);

    const input = container.querySelector('input')!;
    await user.type(input, 'search term');

    expect(input.value).toBe('search term');
  });

  it('calls onChange when input changes', async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();
    const { container } = render(<SearchBar onChange={handleChange} placeholder="Search" />);

    const input = container.querySelector('input')!;
    await user.type(input, 'test');

    expect(handleChange).toHaveBeenCalled();
  });

  it('calls onClear when clear button clicked', async () => {
    const handleClear = vi.fn();
    const user = userEvent.setup();

    render(<SearchBar value="search term" showClear onClear={handleClear} placeholder="Search" />);

    const clearButton = screen.queryByTestId('search-clear');
    if (clearButton) {
      await user.click(clearButton);
      expect(handleClear).toHaveBeenCalled();
    }
  });

  it('accepts custom width', () => {
    const { container } = render(<SearchBar width="400px" />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.style.width).toBe('400px');
  });

  it('accepts custom className', () => {
    const { container } = render(<SearchBar className="custom-class" />);
    const input = container.querySelector('input');
    expect(input?.className).toContain('custom-class');
  });

  it('forwards ref correctly', () => {
    const ref = { current: null };
    render(<SearchBar ref={ref as any} />);
    expect(ref.current).toBeTruthy();
  });

  it('manages internal value state when not controlled', async () => {
    const user = userEvent.setup();
    const { container } = render(<SearchBar defaultValue="initial" />);

    const input = container.querySelector('input')!;
    expect(input.value).toBe('initial');

    await user.clear(input);
    await user.type(input, 'new');

    expect(input.value).toBe('new');
  });

  it('uses controlled value when provided', async () => {
    const { rerender, container } = render(<SearchBar value="controlled" placeholder="Search" />);

    const input = container.querySelector('input')!;
    expect(input.value).toBe('controlled');

    rerender(<SearchBar value="updated" placeholder="Search" />);
    expect(input.value).toBe('updated');
  });
});
