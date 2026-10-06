import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Navbar } from './Navbar';

vi.mock('lucide-react', () => ({
  PanelLeft: ({ className }: any) => <div className={className} data-testid="panel-left-icon" />,
  Bell: ({ className }: any) => <div className={className} data-testid="bell-icon" />,
}));

vi.mock('@/components/atoms/Breadcrumb', () => ({
  Breadcrumb: ({ items }: any) => (
    <nav data-testid="breadcrumb">
      {items.map((item: any) => (
        <span key={item.label} data-active={item.isActive}>
          {item.label}
        </span>
      ))}
    </nav>
  ),
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

vi.mock('@/components/molecules/ProfileDropdown', () => ({
  ProfileDropdown: ({ name, role }: any) => (
    <div data-testid="profile-dropdown">
      <span>{name}</span>
      <span>{role}</span>
    </div>
  ),
}));

vi.mock('@/lib/utils', () => ({
  cn: (...args: any[]) => args.filter(Boolean).join(' '),
}));

describe('Navbar', () => {
  it('renders navbar element', () => {
    const { container } = render(<Navbar />);
    const nav = container.querySelector('nav');
    expect(nav).toBeInTheDocument();
  });

  it('renders sidebar toggle button', () => {
    render(<Navbar onToggleSidebar={vi.fn()} />);
    expect(screen.getByTestId('panel-left-icon')).toBeInTheDocument();
  });

  it('calls onToggleSidebar when toggle button clicked', async () => {
    const handleToggleSidebar = vi.fn();
    const user = userEvent.setup();

    const { container } = render(<Navbar onToggleSidebar={handleToggleSidebar} />);

    const toggleButton = container.querySelector('[data-testid="panel-left-icon"]')?.parentElement;
    await user.click(toggleButton!);

    expect(handleToggleSidebar).toHaveBeenCalledTimes(1);
  });

  it('renders breadcrumbs when provided', () => {
    render(
      <Navbar
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Users', href: '/users' },
        ]}
      />
    );
    expect(screen.getByTestId('breadcrumb')).toBeInTheDocument();
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Users')).toBeInTheDocument();
  });

  it('renders breadcrumbSlot when provided', () => {
    render(<Navbar breadcrumbSlot={<div data-testid="custom-breadcrumb">Custom</div>} />);
    expect(screen.getByTestId('custom-breadcrumb')).toBeInTheDocument();
  });

  it('renders notification bell', () => {
    render(<Navbar onNotificationClick={vi.fn()} />);
    expect(screen.getByTestId('bell-icon')).toBeInTheDocument();
  });

  it('calls onNotificationClick when notification button clicked', async () => {
    const handleNotificationClick = vi.fn();
    const user = userEvent.setup();

    render(<Navbar onNotificationClick={handleNotificationClick} />);

    const notificationButton = screen.getByTestId('bell-icon').parentElement;
    await user.click(notificationButton!);

    expect(handleNotificationClick).toHaveBeenCalledTimes(1);
  });

  it('shows notification count badge when provided', () => {
    const { container } = render(<Navbar notificationCount={3} />);
    // Badge is rendered as a span with bg-primary class
    const badge = container.querySelector('span[class*="bg-primary"]');
    expect(badge).toBeInTheDocument();
  });

  it('does not show notification count badge when count is 0', () => {
    const { container } = render(<Navbar notificationCount={0} />);
    const badge = container.querySelector('span[class*="bg-primary"]');
    expect(badge).not.toBeInTheDocument();
  });

  it('renders profile dropdown when profileName provided', () => {
    render(<Navbar profileName="John Doe" profileRole="Admin" />);
    expect(screen.getByTestId('profile-dropdown')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Admin')).toBeInTheDocument();
  });

  it('does not render profile dropdown when no profile info provided', () => {
    render(<Navbar />);
    expect(screen.queryByTestId('profile-dropdown')).not.toBeInTheDocument();
  });

  it('accepts custom className', () => {
    const { container } = render(<Navbar className="custom-navbar" />);
    const nav = container.querySelector('nav');
    expect(nav?.className).toContain('custom-navbar');
  });

  it('forwards ref correctly', () => {
    const ref = { current: null };
    render(<Navbar ref={ref as any} />);
    expect(ref.current).toBeTruthy();
  });
});
