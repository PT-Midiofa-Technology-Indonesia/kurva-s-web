import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { DataTableColumnHeader } from './DataTableColumnHeader';

vi.mock('@dnd-kit/sortable', () => ({
  useSortable: ({ id: _id }: any) => ({
    attributes: {},
    listeners: {},
    setNodeRef: vi.fn(),
    transform: null,
    transition: null,
    isDragging: false,
  }),
}));

vi.mock('lucide-react', () => ({
  ChevronDown: ({ className }: any) => <div className={className} data-testid="chevron-down" />,
  ChevronUp: ({ className }: any) => <div className={className} data-testid="chevron-up" />,
  ChevronsUpDown: ({ className }: any) => (
    <div className={className} data-testid="chevrons-up-down" />
  ),
  GripVertical: ({ className }: any) => <div className={className} data-testid="grip-vertical" />,
}));

vi.mock('@/lib/utils', () => ({
  cn: (...args: any[]) => args.filter(Boolean).join(' '),
}));

describe('DataTableColumnHeader', () => {
  const mockColumn = {
    id: 'name',
    getIsSorted: vi.fn(() => false),
    getCanSort: vi.fn(() => true),
    toggleSorting: vi.fn(),
  } as any;

  it('renders title text', () => {
    render(<DataTableColumnHeader column={mockColumn} title="User Name" />);
    expect(screen.getByText('User Name')).toBeInTheDocument();
  });

  it('renders sortable button when column is sortable', () => {
    render(<DataTableColumnHeader column={mockColumn} title="Status" />);
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
  });

  it('renders as span when column is not sortable', () => {
    const nonSortableColumn = {
      ...mockColumn,
      getCanSort: vi.fn(() => false),
    };
    render(<DataTableColumnHeader column={nonSortableColumn} title="ID" />);
    const span = screen.getByText('ID');
    expect(span.tagName).toBe('SPAN');
  });

  it('calls toggleSorting when clicked', async () => {
    const toggleSortingMock = vi.fn();
    const user = userEvent.setup();
    const column = {
      ...mockColumn,
      toggleSorting: toggleSortingMock,
    };

    render(<DataTableColumnHeader column={column} title="Email" />);
    const button = screen.getByRole('button');
    await user.click(button);

    expect(toggleSortingMock).toHaveBeenCalled();
  });

  it('shows up chevron for ascending sort', () => {
    const columnAsc = {
      ...mockColumn,
      getIsSorted: vi.fn(() => 'asc'),
    };
    render(<DataTableColumnHeader column={columnAsc} title="Price" />);
    expect(screen.getByTestId('chevron-up')).toBeInTheDocument();
  });

  it('shows down chevron for descending sort', () => {
    const columnDesc = {
      ...mockColumn,
      getIsSorted: vi.fn(() => 'desc'),
    };
    render(<DataTableColumnHeader column={columnDesc} title="Date" />);
    expect(screen.getByTestId('chevron-down')).toBeInTheDocument();
  });

  it('shows both chevrons for unsorted column', () => {
    render(<DataTableColumnHeader column={mockColumn} title="Created" />);
    expect(screen.getByTestId('chevrons-up-down')).toBeInTheDocument();
  });

  it('renders grip icon when rowDnd is true', () => {
    render(<DataTableColumnHeader column={mockColumn} title="Actions" rowDnd={true} />);
    expect(screen.getByTestId('grip-vertical')).toBeInTheDocument();
  });

  it('does not render grip icon when rowDnd is false', () => {
    render(<DataTableColumnHeader column={mockColumn} title="Actions" rowDnd={false} />);
    expect(screen.queryByTestId('grip-vertical')).not.toBeInTheDocument();
  });

  it('accepts custom className', () => {
    const { container } = render(
      <DataTableColumnHeader column={mockColumn} title="Custom" className="custom-class" />
    );
    const header = container.querySelector('.custom-class');
    expect(header).toBeInTheDocument();
  });

  it('passes correct isSorted value to toggleSorting', async () => {
    const toggleSortingMock = vi.fn();
    const user = userEvent.setup();
    const columnAsc = {
      ...mockColumn,
      getIsSorted: vi.fn(() => 'asc'),
      toggleSorting: toggleSortingMock,
    };

    render(<DataTableColumnHeader column={columnAsc} title="Test" />);
    const button = screen.getByRole('button');
    await user.click(button);

    expect(toggleSortingMock).toHaveBeenCalledWith(true);
  });

  it('has correct styling classes', () => {
    const { container } = render(<DataTableColumnHeader column={mockColumn} title="Test" />);
    const header = container.firstChild;
    expect(header).toHaveClass('flex', 'items-center');
  });

  it('handles different column types', () => {
    const columns = [
      { id: 'string', title: 'String Column' },
      { id: 'number', title: 'Number Column' },
      { id: 'date', title: 'Date Column' },
    ];

    columns.forEach((col) => {
      const { unmount } = render(
        <DataTableColumnHeader column={{ ...mockColumn, id: col.id }} title={col.title} />
      );
      expect(screen.getByText(col.title)).toBeInTheDocument();
      unmount();
    });
  });
});
