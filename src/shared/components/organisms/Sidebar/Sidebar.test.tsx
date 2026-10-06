import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import type { SectionGroup } from './Sidebar';
import Sidebar from './Sidebar';

vi.mock('next/navigation', () => ({
  usePathname: () => '/users',
}));

vi.mock('lucide-react', () => ({
  ChevronDown: ({ className }: any) => <div className={className} data-testid="chevron-down" />,
}));

vi.mock('@/utils/cn', () => ({
  cn: (...args: any[]) => args.filter(Boolean).join(' '),
}));

describe('Sidebar', () => {
  const mockSectionGroups: SectionGroup[] = [
    {
      id: 'group-1',
      label: 'Main',
      sections: [
        {
          id: 'users',
          label: 'Users',
          icon: <div data-testid="users-icon">👤</div>,
          href: '/users',
          items: [
            { id: 'users-list', label: 'List Users', href: '/users' },
            { id: 'users-create', label: 'Create User', href: '/users/create' },
          ],
        },
      ],
    },
  ];

  it('renders sidebar container', () => {
    const { container } = render(<Sidebar sectionGroups={mockSectionGroups} />);
    const sidebar = container.firstChild;
    expect(sidebar).toHaveClass('flex', 'flex-col', 'h-screen');
  });

  it('renders logo section', () => {
    render(<Sidebar sectionGroups={mockSectionGroups} />);
    expect(screen.getByText('C')).toBeInTheDocument();
    expect(screen.getByText('Curva-S')).toBeInTheDocument();
  });

  it('hides logo text when collapsed', () => {
    render(<Sidebar sectionGroups={mockSectionGroups} isCollapsed={true} />);
    expect(screen.queryByText('Curva-S')).not.toBeInTheDocument();
  });

  it('renders section groups', () => {
    render(<Sidebar sectionGroups={mockSectionGroups} />);
    expect(screen.getByText('Main')).toBeInTheDocument();
  });

  it('hides section group labels when collapsed', () => {
    render(<Sidebar sectionGroups={mockSectionGroups} isCollapsed={true} />);
    // Group label should have hidden class
    const mainLabel = screen.queryByText('Main');
    expect(mainLabel).toHaveClass('hidden');
  });

  it('renders menu section with items', () => {
    render(<Sidebar sectionGroups={mockSectionGroups} />);
    expect(screen.getByText('Users')).toBeInTheDocument();
  });

  it('renders submenu items', () => {
    render(<Sidebar sectionGroups={mockSectionGroups} />);
    expect(screen.getByText('List Users')).toBeInTheDocument();
    expect(screen.getByText('Create User')).toBeInTheDocument();
  });

  it('toggles submenu visibility', async () => {
    const user = userEvent.setup();
    const { container } = render(<Sidebar sectionGroups={mockSectionGroups} />);

    const usersButton = screen.getByRole('button', { name: /users/i });
    const submenuContainer = container.querySelector('.overflow-hidden.transition-all');

    expect(screen.getByText('List Users')).toBeInTheDocument();
    expect(submenuContainer).toHaveClass('max-h-[2000px]');

    await user.click(usersButton);
    expect(submenuContainer).toHaveClass('max-h-0');

    await user.click(usersButton);
    expect(submenuContainer).toHaveClass('max-h-[2000px]');
    expect(screen.getByText('List Users')).toBeInTheDocument();
  });

  it('renders menu item badges', async () => {
    const user = userEvent.setup();
    const groupsWithBadges: SectionGroup[] = [
      {
        id: 'group-1',
        label: 'Main',
        sections: [
          {
            id: 'tasks',
            label: 'Tasks',
            icon: <div>✓</div>,
            items: [
              { id: 'tasks-list', label: 'My Tasks', href: '/tasks', badge: '5' },
              { id: 'tasks-pending', label: 'Pending', href: '/tasks/pending', badge: '3' },
            ],
          },
        ],
      },
    ];

    render(<Sidebar sectionGroups={groupsWithBadges} />);
    const tasksButton = screen.getByRole('button', { name: /tasks/i });
    await user.click(tasksButton);
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('renders footer when provided', () => {
    const footer = <div data-testid="custom-footer">Footer Content</div>;
    render(<Sidebar sectionGroups={mockSectionGroups} footer={footer} />);
    expect(screen.getByTestId('custom-footer')).toBeInTheDocument();
  });

  it('does not render footer when not provided', () => {
    render(<Sidebar sectionGroups={mockSectionGroups} />);
    expect(screen.queryByTestId('custom-footer')).not.toBeInTheDocument();
  });

  it('renders multiple section groups', () => {
    const multipleGroups: SectionGroup[] = [
      {
        id: 'group-1',
        label: 'Administration',
        sections: [
          {
            id: 'users',
            label: 'Users',
            icon: <div>👤</div>,
            items: [{ id: 'users-list', label: 'List', href: '/users' }],
          },
        ],
      },
      {
        id: 'group-2',
        label: 'Settings',
        sections: [
          {
            id: 'config',
            label: 'Configuration',
            icon: <div>⚙️</div>,
            href: '/config',
          },
        ],
      },
    ];

    render(<Sidebar sectionGroups={multipleGroups} />);
    expect(screen.getByText('Administration')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('renders section without items as link', () => {
    const groupsWithLink: SectionGroup[] = [
      {
        id: 'group-1',
        label: 'Main',
        sections: [
          {
            id: 'dashboard',
            label: 'Dashboard',
            icon: <div>📊</div>,
            href: '/dashboard',
          },
        ],
      },
    ];

    render(<Sidebar sectionGroups={groupsWithLink} />);
    const link = screen.getByRole('link', { name: /dashboard/i });
    expect(link).toHaveAttribute('href', '/dashboard');
  });

  it('applies collapsed styling', () => {
    const { container } = render(<Sidebar sectionGroups={mockSectionGroups} isCollapsed={true} />);
    const sidebar = container.firstChild;
    expect(sidebar).toHaveClass('w-20');
  });

  it('applies expanded styling', () => {
    const { container } = render(<Sidebar sectionGroups={mockSectionGroups} isCollapsed={false} />);
    const sidebar = container.firstChild;
    expect(sidebar).toHaveClass('w-70');
  });

  it('renders with empty section groups', () => {
    const { container } = render(<Sidebar sectionGroups={[]} />);
    expect(container).toBeInTheDocument();
  });

  it('renders menu icons', () => {
    render(<Sidebar sectionGroups={mockSectionGroups} />);
    expect(screen.getByTestId('users-icon')).toBeInTheDocument();
  });

  it('shows chevron for expandable sections', () => {
    render(<Sidebar sectionGroups={mockSectionGroups} />);
    expect(screen.getByTestId('chevron-down')).toBeInTheDocument();
  });

  it('hides submenu when collapsed', () => {
    const groupsWithUserManagement: SectionGroup[] = [
      {
        id: 'group-1',
        label: 'Main',
        sections: [
          {
            id: 'user-management',
            label: 'Users',
            icon: <div data-testid="users-icon">👤</div>,
            items: [{ id: 'users-list', label: 'List Users', href: '/users' }],
          },
        ],
      },
    ];
    render(<Sidebar sectionGroups={groupsWithUserManagement} isCollapsed={true} />);
    expect(screen.queryByText('List Users')).not.toBeInTheDocument();
  });

  it('applies title attribute to icon-only buttons when collapsed', () => {
    render(<Sidebar sectionGroups={mockSectionGroups} isCollapsed={true} />);
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('title', 'Users');
  });

  it('renders multiple sections in a group', () => {
    const multiSection: SectionGroup[] = [
      {
        id: 'group-1',
        label: 'Main',
        sections: [
          {
            id: 'section1',
            label: 'Section 1',
            icon: <div>1</div>,
            items: [{ id: 'item1', label: 'Item 1', href: '/item1' }],
          },
          {
            id: 'section2',
            label: 'Section 2',
            icon: <div>2</div>,
            items: [{ id: 'item2', label: 'Item 2', href: '/item2' }],
          },
        ],
      },
    ];

    render(<Sidebar sectionGroups={multiSection} />);
    expect(screen.getByText('Section 1')).toBeInTheDocument();
    expect(screen.getByText('Section 2')).toBeInTheDocument();
  });

  it('handles sections with no items and no href', () => {
    const groupNoHref: SectionGroup[] = [
      {
        id: 'group-1',
        label: 'Main',
        sections: [
          {
            id: 'empty-section',
            label: 'Empty Section',
            icon: <div>📁</div>,
          },
        ],
      },
    ];

    render(<Sidebar sectionGroups={groupNoHref} />);
    expect(screen.getByText('Empty Section')).toBeInTheDocument();
  });

  it('opens section by default when section id matches initial state', () => {
    render(<Sidebar sectionGroups={mockSectionGroups} />);
    expect(screen.getByText('List Users')).toBeInTheDocument();
  });

  it('renders nav structure correctly', () => {
    const { container } = render(<Sidebar sectionGroups={mockSectionGroups} />);
    const buttons = container.querySelectorAll('button');
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('renders sidebar with footer and content', () => {
    const footer = <div data-testid="footer">Footer</div>;
    render(<Sidebar sectionGroups={mockSectionGroups} footer={footer} />);
    expect(screen.getByText('Users')).toBeInTheDocument();
    expect(screen.getByTestId('footer')).toBeInTheDocument();
  });

  it('shows submenu drawer on hover when collapsed', async () => {
    const user = userEvent.setup();
    const groupsWithItems: SectionGroup[] = [
      {
        id: 'group-1',
        label: 'Main',
        sections: [
          {
            id: 'users',
            label: 'Users',
            icon: <div data-testid="users-icon">👤</div>,
            items: [
              { id: 'users-list', label: 'List Users', href: '/users' },
              { id: 'users-create', label: 'Create User', href: '/users/create' },
            ],
          },
        ],
      },
    ];

    render(<Sidebar sectionGroups={groupsWithItems} isCollapsed={true} />);

    // Drawer should be hidden by default
    expect(screen.queryByText('List Users')).not.toBeInTheDocument();

    const usersButton = screen.getByTitle('Users');

    // Hover over the button to open drawer
    await user.hover(usersButton);
    expect(screen.getByText('List Users')).toBeInTheDocument();
    expect(screen.getByText('Create User')).toBeInTheDocument();

    // Unhover to close drawer (with a small delay)
    await user.unhover(usersButton);
    await waitFor(() => expect(screen.queryByText('List Users')).not.toBeInTheDocument());
  });

  it('shows section label in collapsed drawer header', async () => {
    const user = userEvent.setup();
    const groupsWithItems: SectionGroup[] = [
      {
        id: 'group-1',
        label: 'Main',
        sections: [
          {
            id: 'users',
            label: 'Users',
            icon: <div data-testid="users-icon">👤</div>,
            items: [{ id: 'users-list', label: 'List Users', href: '/users' }],
          },
        ],
      },
    ];

    render(<Sidebar sectionGroups={groupsWithItems} isCollapsed={true} />);

    const usersButton = screen.getByTitle('Users');
    await user.hover(usersButton);

    // Section label should appear as drawer header
    const drawerHeader = screen.getAllByText('Users');
    expect(drawerHeader.length).toBeGreaterThanOrEqual(1);
  });

  it('does not show drawer for collapsed sections without items', () => {
    const groupsWithLink: SectionGroup[] = [
      {
        id: 'group-1',
        label: 'Main',
        sections: [
          {
            id: 'dashboard',
            label: 'Dashboard',
            icon: <div>📊</div>,
            href: '/dashboard',
          },
        ],
      },
    ];

    render(<Sidebar sectionGroups={groupsWithLink} isCollapsed={true} />);
    const link = screen.getByRole('link', { name: /📊/i });
    expect(link).toHaveAttribute('href', '/dashboard');
  });
});
