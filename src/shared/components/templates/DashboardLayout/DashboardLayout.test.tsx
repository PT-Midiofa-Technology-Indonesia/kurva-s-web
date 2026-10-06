import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import DashboardLayout from './DashboardLayout';

vi.mock('@/components/atoms/Breadcrumb', () => ({
  Breadcrumb: ({ items }: any) => (
    <div data-testid="breadcrumb">
      {items?.map((item: any) => (
        <span key={item.label} data-testid={`breadcrumb-${item.label}`}>
          {item.label}
        </span>
      ))}
    </div>
  ),
}));

vi.mock('@/components/organisms/Navbar', () => ({
  Navbar: ({ onToggleSidebar, breadcrumbSlot }: any) => (
    <nav data-testid="navbar">
      {breadcrumbSlot}
      <button type="button" onClick={onToggleSidebar} data-testid="toggle-sidebar">
        Toggle
      </button>
    </nav>
  ),
}));

vi.mock('@/components/organisms/Sidebar', () => ({
  Sidebar: ({ sectionGroups, footer, isCollapsed }: any) => (
    <aside data-testid="sidebar" data-collapsed={isCollapsed}>
      {sectionGroups?.length > 0 && <div data-testid="sections">Sections</div>}
      {footer && <div data-testid="sidebar-footer">{footer}</div>}
    </aside>
  ),
}));

vi.mock('@/shared/hooks/use-breadcrumbs', () => ({
  useBreadcrumbs: () => [
    { label: 'Dashboard', href: '/' },
    { label: 'Users', href: '/users' },
  ],
}));

vi.mock('@/utils/cn', () => ({
  cn: (...args: any[]) => args.filter(Boolean).join(' '),
}));

describe('DashboardLayout', () => {
  it('renders dashboard layout', () => {
    const { container } = render(<DashboardLayout />);
    const layout = container.firstChild;
    expect(layout).toHaveClass('flex', 'h-screen', 'w-full');
  });

  it('renders sidebar', () => {
    render(<DashboardLayout />);
    expect(screen.getByTestId('sidebar')).toBeInTheDocument();
  });

  it('renders navbar', () => {
    render(<DashboardLayout />);
    expect(screen.getByTestId('navbar')).toBeInTheDocument();
  });

  it('renders main content area', () => {
    render(
      <DashboardLayout>
        <div>Main Content</div>
      </DashboardLayout>
    );
    expect(screen.getByText('Main Content')).toBeInTheDocument();
  });

  it('renders breadcrumbs', () => {
    render(<DashboardLayout />);
    expect(screen.getByTestId('breadcrumb')).toBeInTheDocument();
  });

  it('toggles sidebar collapse state', async () => {
    const user = userEvent.setup();
    render(<DashboardLayout />);

    const sidebar = screen.getByTestId('sidebar');
    expect(sidebar).toHaveAttribute('data-collapsed', 'false');

    const toggleButton = screen.getByTestId('toggle-sidebar');
    await user.click(toggleButton);

    expect(sidebar).toHaveAttribute('data-collapsed', 'true');
  });

  it('passes sidebar section groups', () => {
    const sectionGroups = [
      {
        id: 'group-1',
        label: 'Main',
        sections: [
          {
            id: 'section-1',
            label: 'Section 1',
            icon: <div>Icon</div>,
          },
        ],
      },
    ];

    render(<DashboardLayout sidebarSectionGroups={sectionGroups} />);
    expect(screen.getByTestId('sections')).toBeInTheDocument();
  });

  it('passes sidebar footer', () => {
    const footer = <div data-testid="custom-footer">Footer</div>;
    render(<DashboardLayout sidebarFooter={footer} />);
    expect(screen.getByTestId('custom-footer')).toBeInTheDocument();
  });

  it('accepts navbar props', () => {
    const navbarProps = {
      profileName: 'John Doe',
    };

    render(<DashboardLayout navbarProps={navbarProps} />);
    expect(screen.getByTestId('navbar')).toBeInTheDocument();
  });

  it('renders with custom className', () => {
    const { container } = render(<DashboardLayout className="custom-class" />);
    const layout = container.firstChild;
    expect(layout).toHaveClass('custom-class');
  });

  it('displays breadcrumb items', () => {
    render(<DashboardLayout />);
    expect(screen.getByTestId('breadcrumb-Dashboard')).toBeInTheDocument();
    expect(screen.getByTestId('breadcrumb-Users')).toBeInTheDocument();
  });

  it('renders main content with proper styling', () => {
    const { container } = render(
      <DashboardLayout>
        <div>Content</div>
      </DashboardLayout>
    );
    const main = container.querySelector('main');
    expect(main).toHaveClass('flex-1', 'overflow-y-auto', 'bg-white');
  });

  it('renders with full height and width', () => {
    const { container } = render(<DashboardLayout />);
    const layout = container.firstChild;
    expect(layout).toHaveClass('h-screen', 'w-full');
  });

  it('handles multiple toggle sidebar clicks', async () => {
    const user = userEvent.setup();
    render(<DashboardLayout />);

    const sidebar = screen.getByTestId('sidebar');
    const toggleButton = screen.getByTestId('toggle-sidebar');

    expect(sidebar).toHaveAttribute('data-collapsed', 'false');

    await user.click(toggleButton);
    expect(sidebar).toHaveAttribute('data-collapsed', 'true');

    await user.click(toggleButton);
    expect(sidebar).toHaveAttribute('data-collapsed', 'false');
  });

  it('renders sidebar and navbar in flex layout', () => {
    const { container } = render(<DashboardLayout />);
    const layout = container.firstChild;
    expect(layout).toHaveClass('flex');
  });

  it('renders content in max-width container', () => {
    const { container } = render(
      <DashboardLayout>
        <div data-testid="main-content">Content</div>
      </DashboardLayout>
    );
    const contentWrapper = container.querySelector('.max-w-360');
    expect(contentWrapper).toBeInTheDocument();
    expect(screen.getByTestId('main-content')).toBeInTheDocument();
  });

  it('renders with overflow hidden', () => {
    const { container } = render(<DashboardLayout />);
    const layout = container.firstChild;
    expect(layout).toHaveClass('overflow-hidden');
  });

  it('renders children content directly', () => {
    render(
      <DashboardLayout>
        <div>Test Content Here</div>
      </DashboardLayout>
    );
    expect(screen.getByText('Test Content Here')).toBeInTheDocument();
  });

  it('handles complex children structure', () => {
    render(
      <DashboardLayout>
        <div>
          <h1>Title</h1>
          <p>Description</p>
          <button type="button">Action</button>
        </div>
      </DashboardLayout>
    );

    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('Description')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /action/i })).toBeInTheDocument();
  });

  it('renders without children', () => {
    render(<DashboardLayout />);
    expect(screen.getByTestId('navbar')).toBeInTheDocument();
    expect(screen.getByTestId('sidebar')).toBeInTheDocument();
  });

  it('maintains sidebar state independently', async () => {
    const user = userEvent.setup();
    const { rerender } = render(<DashboardLayout />);

    const sidebar = screen.getByTestId('sidebar');
    expect(sidebar).toHaveAttribute('data-collapsed', 'false');

    const toggleButton = screen.getByTestId('toggle-sidebar');
    await user.click(toggleButton);

    expect(sidebar).toHaveAttribute('data-collapsed', 'true');

    rerender(<DashboardLayout />);
    expect(screen.getByTestId('sidebar')).toHaveAttribute('data-collapsed', 'true');
  });

  it('renders layout with all components together', () => {
    render(
      <DashboardLayout
        sidebarSectionGroups={[
          {
            id: 'main',
            label: 'Main',
            sections: [
              {
                id: 'home',
                label: 'Home',
                icon: <span>Home</span>,
              },
            ],
          },
        ]}
        sidebarFooter={<div>Footer</div>}
      >
        <div>Dashboard Content</div>
      </DashboardLayout>
    );

    expect(screen.getByTestId('sidebar')).toBeInTheDocument();
    expect(screen.getByTestId('navbar')).toBeInTheDocument();
    expect(screen.getByText('Dashboard Content')).toBeInTheDocument();
    expect(screen.getByText('Footer')).toBeInTheDocument();
  });
});
