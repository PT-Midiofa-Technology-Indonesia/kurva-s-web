import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ProfileDropdown } from './ProfileDropdown';

vi.mock('lucide-react', () => ({
  ChevronDown: ({ className }: any) => <div className={className} data-testid="chevron-down" />,
}));

vi.mock('@/components/atoms/Button', () => ({
  Button: ({ children, onClick, variant, className, ...props }: any) => (
    <button className={className} data-variant={variant} onClick={onClick} {...props}>
      {children}
    </button>
  ),
}));

vi.mock('@/components/atoms/Text', () => ({
  Text: ({ children, size, weight, className, ...props }: any) => (
    <span className={className} data-size={size} data-weight={weight} {...props}>
      {children}
    </span>
  ),
}));

vi.mock('@/components/ui/dropdown-menu', () => ({
  DropdownMenu: ({ children }: any) => <div data-testid="dropdown-menu">{children}</div>,
  DropdownMenuTrigger: ({ children }: any) => <div data-testid="dropdown-trigger">{children}</div>,
  DropdownMenuContent: ({ children, align }: any) => (
    <div data-testid="dropdown-content" data-align={align}>
      {children}
    </div>
  ),
  DropdownMenuItem: ({ children, onClick, disabled, ...props }: any) => (
    <button onClick={onClick} disabled={disabled} data-testid="dropdown-item" {...props}>
      {children}
    </button>
  ),
  DropdownMenuSeparator: () => <hr data-testid="dropdown-separator" />,
}));

vi.mock('@/lib/utils', () => ({
  cn: (...args: any[]) => args.filter(Boolean).join(' '),
}));

describe('ProfileDropdown', () => {
  const defaultItems = [
    { label: 'Profile', onClick: vi.fn() },
    { label: 'Settings', onClick: vi.fn() },
    { label: 'Sign out', variant: 'destructive' as const, onClick: vi.fn() },
  ];

  it('renders dropdown with user name', () => {
    const { container } = render(<ProfileDropdown name="John Doe" items={defaultItems} />);
    const nameElement = container.querySelector('span');
    expect(nameElement?.textContent).toContain('John Doe');
  });

  it('renders multiple dropdown items', () => {
    render(<ProfileDropdown name="John Doe" items={defaultItems} />);
    const items = screen.getAllByTestId('dropdown-item');
    expect(items.length).toBeGreaterThanOrEqual(2);
  });

  it('renders avatar when provided', () => {
    const avatar = <div data-testid="custom-avatar">Avatar</div>;
    const { container } = render(
      <ProfileDropdown name="John Doe" avatar={avatar} items={defaultItems} />
    );
    const customAvatar = container.querySelector('[data-testid="custom-avatar"]');
    expect(customAvatar).toBeInTheDocument();
  });

  it('generates initials when avatar not provided', () => {
    const { container } = render(<ProfileDropdown name="John Doe" items={defaultItems} />);
    const avatarDiv = container.querySelector('.bg-slate-300');
    expect(avatarDiv?.textContent).toBe('JD');
  });

  it('uses custom avatar fallback when provided', () => {
    const { container } = render(
      <ProfileDropdown name="John Doe" avatarFallback="AD" items={defaultItems} />
    );
    const avatarDiv = container.querySelector('.bg-slate-300');
    expect(avatarDiv?.textContent).toBe('AD');
  });

  it('renders dropdown items', () => {
    render(<ProfileDropdown name="John Doe" items={defaultItems} />);
    const items = screen.getAllByTestId('dropdown-item');
    expect(items).toHaveLength(3);
  });

  it('calls onClick handler for menu items', async () => {
    const handleClick = vi.fn();
    const items = [{ label: 'Profile', onClick: handleClick }];
    const user = userEvent.setup();

    render(<ProfileDropdown name="John Doe" items={items} />);
    const menuItem = screen.getByText('Profile');
    await user.click(menuItem);

    expect(handleClick).toHaveBeenCalled();
  });

  it('disables menu item when disabled prop is true', () => {
    const items = [{ label: 'Disabled', onClick: vi.fn(), disabled: true }];
    const { container } = render(<ProfileDropdown name="John Doe" items={items} />);
    const button = container.querySelector('button[disabled]');
    expect(button).toBeInTheDocument();
  });

  it('renders chevron icon', () => {
    render(<ProfileDropdown name="John Doe" items={defaultItems} />);
    expect(screen.getByTestId('chevron-down')).toBeInTheDocument();
  });

  it('accepts custom className', () => {
    const { container } = render(
      <ProfileDropdown name="John Doe" items={defaultItems} className="custom-class" />
    );
    const button = container.querySelector('button');
    expect(button?.className).toContain('custom-class');
  });
});
