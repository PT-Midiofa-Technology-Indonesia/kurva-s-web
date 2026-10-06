import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { KanbanColumn } from './KanbanColumn';

vi.mock('@dnd-kit/core', () => ({
  useDroppable: () => ({
    setNodeRef: vi.fn(),
    isOver: false,
  }),
}));

vi.mock('@dnd-kit/sortable', () => ({
  SortableContext: ({ children, items }: any) => (
    <div data-testid="sortable-context" data-items={items.join(',')}>
      {children}
    </div>
  ),
  verticalListSortingStrategy: {},
}));

vi.mock('@/lib/utils', () => ({
  cn: (...args: any[]) => args.filter(Boolean).join(' '),
}));

describe('KanbanColumn', () => {
  const defaultProps = {
    id: 'todo',
    title: 'To Do',
    itemIds: ['item-1', 'item-2'],
    children: <div data-testid="column-children">Column Content</div>,
  };

  it('renders column with title', () => {
    render(<KanbanColumn {...defaultProps} />);
    expect(screen.getByText('To Do')).toBeInTheDocument();
  });

  it('renders column container', () => {
    const { container } = render(<KanbanColumn {...defaultProps} />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('renders children content', () => {
    render(<KanbanColumn {...defaultProps} />);
    expect(screen.getByTestId('column-children')).toBeInTheDocument();
  });

  it('displays count when provided', () => {
    render(<KanbanColumn {...defaultProps} count={5} />);
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('does not display count when not provided', () => {
    render(<KanbanColumn {...defaultProps} />);
    expect(screen.queryByText('undefined')).not.toBeInTheDocument();
  });

  it('renders header element when provided', () => {
    const header = (
      <button type="button" data-testid="custom-header">
        Options
      </button>
    );
    render(<KanbanColumn {...defaultProps} header={header} />);
    expect(screen.getByTestId('custom-header')).toBeInTheDocument();
  });

  it('does not render header when not provided', () => {
    render(<KanbanColumn {...defaultProps} />);
    expect(screen.queryByTestId('custom-header')).not.toBeInTheDocument();
  });

  it('passes itemIds to SortableContext', () => {
    render(<KanbanColumn {...defaultProps} />);
    const context = screen.getByTestId('sortable-context');
    expect(context).toHaveAttribute('data-items', 'item-1,item-2');
  });

  it('accepts custom className', () => {
    const { container } = render(<KanbanColumn {...defaultProps} className="custom-class" />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).toContain('custom-class');
  });

  it('includes default card styling', () => {
    const { container } = render(<KanbanColumn {...defaultProps} />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).toContain('flex');
    expect(wrapper.className).toContain('flex-col');
    expect(wrapper.className).toContain('w-66.5');
  });

  it('renders header section', () => {
    const { container } = render(<KanbanColumn {...defaultProps} />);
    const header = container.querySelector('.h-8');
    expect(header).toBeInTheDocument();
  });

  it('renders content area', () => {
    render(<KanbanColumn {...defaultProps} />);
    expect(screen.getByTestId('sortable-context')).toBeInTheDocument();
  });

  it('renders title element', () => {
    render(<KanbanColumn {...defaultProps} />);
    expect(screen.getByText('To Do')).toBeInTheDocument();
  });

  it('forwards ref correctly', () => {
    const ref = { current: null };
    render(<KanbanColumn {...defaultProps} ref={ref as any} />);
    expect(ref.current).toBeTruthy();
  });

  it('handles multiple children elements', () => {
    const children = (
      <>
        <div data-testid="child-1">Child 1</div>
        <div data-testid="child-2">Child 2</div>
      </>
    );
    const { ...props } = defaultProps;
    render(<KanbanColumn {...props}>{children}</KanbanColumn>);
    expect(screen.getByTestId('child-1')).toBeInTheDocument();
    expect(screen.getByTestId('child-2')).toBeInTheDocument();
  });

  it('updates when title prop changes', () => {
    const { rerender } = render(<KanbanColumn {...defaultProps} />);
    expect(screen.getByText('To Do')).toBeInTheDocument();

    rerender(<KanbanColumn {...defaultProps} title="In Progress" />);
    expect(screen.queryByText('To Do')).not.toBeInTheDocument();
    expect(screen.getByText('In Progress')).toBeInTheDocument();
  });

  it('updates when count prop changes', () => {
    const { rerender } = render(<KanbanColumn {...defaultProps} count={3} />);
    expect(screen.getByText('3')).toBeInTheDocument();

    rerender(<KanbanColumn {...defaultProps} count={7} />);
    expect(screen.queryByText('3')).not.toBeInTheDocument();
    expect(screen.getByText('7')).toBeInTheDocument();
  });

  it('renders SortableContext around children', () => {
    render(<KanbanColumn {...defaultProps} />);
    const context = screen.getByTestId('sortable-context');
    expect(context).toBeInTheDocument();
    expect(context).toContainElement(screen.getByTestId('column-children'));
  });

  it('includes count badge with specific styling', () => {
    render(<KanbanColumn {...defaultProps} count={10} />);
    // The count badge should be present with muted background
    expect(screen.getByText('10')).toBeInTheDocument();
  });

  it('handles zero count', () => {
    render(<KanbanColumn {...defaultProps} count={0} />);
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('applies flex layout classes', () => {
    const { container } = render(<KanbanColumn {...defaultProps} />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).toContain('flex');
    expect(wrapper.className).toContain('flex-col');
  });

  it('renders with complex children structure', () => {
    const complexChildren = (
      <div>
        <header>Header</header>
        <main>Main Content</main>
        <footer>Footer</footer>
      </div>
    );
    const { ...props } = defaultProps;
    render(<KanbanColumn {...props}>{complexChildren}</KanbanColumn>);
    expect(screen.getByText('Header')).toBeInTheDocument();
    expect(screen.getByText('Main Content')).toBeInTheDocument();
    expect(screen.getByText('Footer')).toBeInTheDocument();
  });

  it('integrates header and count together', () => {
    const header = (
      <button type="button" data-testid="column-menu">
        Menu
      </button>
    );
    render(<KanbanColumn {...defaultProps} header={header} count={5} />);
    expect(screen.getByTestId('column-menu')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });
});
