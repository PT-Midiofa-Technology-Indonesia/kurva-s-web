import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Breadcrumb } from './Breadcrumb';

vi.mock('lucide-react', () => ({
  ChevronRight: ({ className }: any) => <div className={className} data-testid="chevron-right" />,
  Home: ({ className }: any) => <div className={className} data-testid="home-icon" />,
}));

vi.mock('@/components/ui/breadcrumb', () => ({
  Breadcrumb: ({ children, className, ...props }: any) => (
    <nav className={className} {...props}>
      {children}
    </nav>
  ),
  BreadcrumbList: ({ children }: any) => <ul>{children}</ul>,
  BreadcrumbItem: ({ children }: any) => <li>{children}</li>,
  BreadcrumbLink: ({ children, href }: any) => <a href={href}>{children}</a>,
  BreadcrumbPage: ({ children }: any) => <span>{children}</span>,
  BreadcrumbSeparator: ({ children }: any) => <li>{children}</li>,
}));

vi.mock('@/lib/utils', () => ({
  cn: (...args: any[]) => args.filter(Boolean).join(' '),
}));

describe('Breadcrumb', () => {
  it('renders breadcrumb items', () => {
    const items = [{ label: 'Home', isHome: true, href: '/' }, { label: 'Users' }];
    render(<Breadcrumb items={items} />);

    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Users')).toBeInTheDocument();
  });

  it('renders home icon for home item', () => {
    const items = [{ label: 'Home', isHome: true, href: '/' }];
    render(<Breadcrumb items={items} />);

    expect(screen.getByTestId('home-icon')).toBeInTheDocument();
  });

  it('renders chevron separator by default', () => {
    const items = [{ label: 'Home', href: '/' }, { label: 'Users' }];
    render(<Breadcrumb items={items} />);

    expect(screen.getByTestId('chevron-right')).toBeInTheDocument();
  });

  it('renders slash separator when specified', () => {
    const items = [{ label: 'Home', href: '/' }, { label: 'Users' }];
    render(<Breadcrumb items={items} separator="slash" />);

    expect(screen.getByText('/')).toBeInTheDocument();
  });

  it('renders breadcrumb links with href', () => {
    const items = [
      { label: 'Home', href: '/', isHome: true },
      { label: 'Users', href: '/users' },
    ];
    render(<Breadcrumb items={items} />);

    const links = screen.getAllByRole('link');
    expect(links.length).toBeGreaterThan(0);
  });

  it('marks last item as active', () => {
    const items = [
      { label: 'Home', href: '/' },
      { label: 'Users', href: '/users' },
    ];
    render(<Breadcrumb items={items} />);

    const lastItem = screen.getByText('Users');
    expect(lastItem.tagName).toBe('SPAN');
  });

  it('accepts custom className', () => {
    const { container } = render(
      <Breadcrumb items={[{ label: 'Home' }]} className="custom-class" />
    );
    const nav = container.querySelector('nav');
    expect(nav?.className).toContain('custom-class');
  });

  it('forwards ref correctly', () => {
    const ref = { current: null };
    render(<Breadcrumb ref={ref as any} items={[{ label: 'Home' }]} />);
    expect(ref.current).toBeTruthy();
  });
});
